const DB = {
    db: null,
    dbName: 'PikaShotDB',
    dbVersion: 5,
    userPhone: null, // this person's own account (their user document)
    dataPhone: null, // whose products and sales these are: a salesperson works on their admin's
    _salesBy: null, // a salesperson only reads (and keeps) the sales they recorded themselves
    // Kept on this phone only: they say which business confirmed a salesperson, and the cloud copy of that is its own record
    LOCAL_ONLY_USER_FIELDS: ['businessPhone', 'businessName', 'businessType', 'businessLowStock'],
    unsubscribeProducts: null,
    unsubscribeSales: null,

    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error("Database error:", event.target.error);
                reject("Database error");
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("Database opened successfully");
                // Try to load user to get phone number for cloud sync
                this.getUser().then(user => this.setIdentity(user));
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const transaction = event.target.transaction;
                if (!db.objectStoreNames.contains('user')) db.createObjectStore('user', { keyPath: 'id' });
                if (!db.objectStoreNames.contains('products')) {
                    const productStore = db.createObjectStore('products', { keyPath: 'id' });
                    productStore.createIndex('barcode', 'barcode', { unique: false });
                } else {
                    const productStore = transaction.objectStore('products');
                    if (!productStore.indexNames.contains('barcode')) productStore.createIndex('barcode', 'barcode', { unique: false });
                }
                if (!db.objectStoreNames.contains('sales')) {
                    const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
                    salesStore.createIndex('productId', 'productId', { unique: false });
                } else {
                    const salesStore = transaction.objectStore('sales');
                    if (!salesStore.indexNames.contains('productId')) salesStore.createIndex('productId', 'productId', { unique: false });
                }
                if (!db.objectStoreNames.contains('scan_counts')) db.createObjectStore('scan_counts', { keyPath: 'date' });
            };
        });
    },

    // Who this phone belongs to, and whose products and sales it works on. Call whenever the user or their business changes.
    setIdentity(user) {
        this.userPhone = (user && user.phone) || null;
        const salesperson = !!user && user.type === 'Salesperson';
        this.dataPhone = !user ? null : (salesperson ? (user.businessPhone || null) : user.phone);
        this._salesBy = salesperson ? user.phone : null;
    },

    _dataRoot() {
        return this.dataPhone || this.userPhone;
    },

    // All the sales, or for a salesperson only the ones they recorded
    _salesRef(root) {
        const ref = window.fb.collection(window.fb.db, `users/${root}/sales`);
        return this._salesBy ? window.fb.query(ref, window.fb.where('recordedBy', '==', this._salesBy)) : ref;
    },

    _getStore(storeName, mode) {
        const transaction = this.db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    },

    _requestToPromise(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // --- CLOUD SYNC HELPERS ---
    _normalizeTimestamp(ts) {
        if (!ts) return new Date();
        // Firestore Timestamp object
        if (ts.toDate && typeof ts.toDate === 'function') return ts.toDate();
        // Already a Date
        if (ts instanceof Date) return ts;
        // Epoch number (milliseconds)
        if (typeof ts === 'number') return new Date(ts);
        // ISO string or other parseable string
        if (typeof ts === 'string') {
            const d = new Date(ts);
            return isNaN(d.getTime()) ? new Date() : d;
        }
        // Firestore-like plain object {seconds, nanoseconds}
        if (ts.seconds !== undefined) return new Date(ts.seconds * 1000);
        return new Date();
    },

    // Sale pictures are never uploaded, so a sale arriving from the cloud must keep the picture already saved on this phone
    _putSalePreservingImage(store, sale) {
        const getReq = store.get(sale.id);
        getReq.onsuccess = () => {
            const existing = getReq.result;
            if (existing && existing.image && !sale.image) sale.image = existing.image;
            store.put(sale);
        };
    },

    _syncToCloud(collectionName, docId, data) {
        const root = collectionName ? this._dataRoot() : this.userPhone;
        if (!root || !window.fb) return Promise.resolve(); // Need the phone to know where to save
        const path = `users/${root}${collectionName ? '/' + collectionName : ''}`;

        try {
            const ref = docId
                ? window.fb.doc(window.fb.db, path, String(docId))
                : window.fb.doc(window.fb.db, path);

            // Remove image blobs and add server timestamp
            const cleanData = { ...data };
            if (cleanData.image) delete cleanData.image;

            // Optimization: Add lastUpdate timestamp to track changes
            if (window.fb.serverTimestamp) {
                cleanData.lastUpdate = window.fb.serverTimestamp();
            }

            return window.fb.setDoc(ref, cleanData, { merge: true })
                .catch(err => console.error("Cloud sync failed:", err));
        } catch (e) {
            console.error("Error initiating cloud sync:", e);
            return Promise.resolve();
        }
    },

    async syncDataFromCloud(phoneNumber) {
        if (!window.fb) return false;
        this.userPhone = phoneNumber;

        try {
            // 1. Sync User Profile (what only this phone knows about the business stays)
            const userRef = window.fb.doc(window.fb.db, 'users', phoneNumber);
            const userSnap = await window.fb.getDoc(userRef);
            if (userSnap.exists()) {
                const cloudUserData = userSnap.data();
                const existing = await this.getUser();
                this.LOCAL_ONLY_USER_FIELDS.forEach(k => { if (existing && existing[k] !== undefined) cloudUserData[k] = existing[k]; });
                await this.saveUser(cloudUserData, false); // false = don't sync back to cloud
            }

            // 2. Get ALL Products (always fetch all to avoid sync gaps)
            const root = this._dataRoot();
            const productsRef = window.fb.collection(window.fb.db, `users/${root}/products`);
            const prodSnaps = await window.fb.getDocs(productsRef);
            await new Promise((resolve, reject) => {
                const prodTx = this.db.transaction('products', 'readwrite');
                const store = prodTx.objectStore('products');
                prodSnaps.forEach(doc => {
                    const p = doc.data();
                    if (typeof p.id === 'string' && !isNaN(p.id)) p.id = Number(p.id);
                    // Preserve local image (images are stripped before cloud upload)
                    const getReq = store.get(p.id);
                    getReq.onsuccess = () => {
                        const existing = getReq.result;
                        if (existing && existing.image && !p.image) {
                            p.image = existing.image;
                        }
                        store.put(p);
                    };
                });
                prodTx.oncomplete = () => resolve();
                prodTx.onerror = () => reject(prodTx.error);
            });

            // 3. Get ALL Sales (always fetch all to avoid sync gaps)
            const saleSnaps = await window.fb.getDocs(this._salesRef(root));
            await new Promise((resolve, reject) => {
                const saleTx = this.db.transaction('sales', 'readwrite');
                const store = saleTx.objectStore('sales');
                saleSnaps.forEach(doc => {
                    const s = doc.data();
                    if (typeof s.id === 'string' && !isNaN(s.id)) s.id = Number(s.id);
                    s.timestamp = this._normalizeTimestamp(s.timestamp);
                    this._putSalePreservingImage(store, s);
                });
                saleTx.oncomplete = () => resolve();
                saleTx.onerror = () => reject(saleTx.error);
            });

            return true;
        } catch (error) {
            console.error("Sync from cloud failed:", error);
            return false;
        }
    },

    // --- REALTIME SYNC ---
    // `phoneNumber` is whose data to follow: the user's own, or for a salesperson their admin's
    setupRealtimeListeners(phoneNumber, onProductsChange, onSalesChange) {
        if (!window.fb || !phoneNumber) return;
        this.stopRealtimeListeners(); // Ensure clean slate
        this.dataPhone = phoneNumber;
        this._realtimePhone = phoneNumber;
        this._realtimeCallbacks = { onProductsChange, onSalesChange };

        this._startProductsListener(phoneNumber, onProductsChange);
        this._startSalesListener(phoneNumber, onSalesChange);
    },

    _startProductsListener(phoneNumber, onProductsChange, retryDelay) {
        if (this._realtimePhone !== phoneNumber) return; // User changed, don't reconnect
        const productsRef = window.fb.collection(window.fb.db, `users/${phoneNumber}/products`);
        this.unsubscribeProducts = window.fb.onSnapshot(productsRef, (snapshot) => {
            const tx = this.db.transaction('products', 'readwrite');
            const store = tx.objectStore('products');
            let hasChanges = false;

            snapshot.docChanges().forEach((change) => {
                hasChanges = true;
                const data = change.doc.data();
                if (data.id && typeof data.id === 'string' && !isNaN(Number(data.id))) {
                    data.id = Number(data.id);
                }
                if (change.type === "added" || change.type === "modified") {
                    // Preserve local image (images are stripped before cloud upload)
                    const getReq = store.get(data.id);
                    getReq.onsuccess = () => {
                        const existing = getReq.result;
                        if (existing && existing.image && !data.image) {
                            data.image = existing.image;
                        }
                        store.put(data);
                    };
                } else if (change.type === "removed") {
                    store.delete(Number(change.doc.id));
                }
            });

            if (hasChanges && onProductsChange) {
                tx.oncomplete = () => onProductsChange();
            }
        }, (error) => {
            console.error("Products listener error, will reconnect:", error);
            const delay = Math.min(retryDelay || 2000, 30000);
            setTimeout(() => this._startProductsListener(phoneNumber, onProductsChange, delay * 2), delay);
        });
    },

    _startSalesListener(phoneNumber, onSalesChange, retryDelay) {
        if (this._realtimePhone !== phoneNumber) return; // User changed, don't reconnect
        this.unsubscribeSales = window.fb.onSnapshot(this._salesRef(phoneNumber), (snapshot) => {
            const tx = this.db.transaction('sales', 'readwrite');
            const store = tx.objectStore('sales');
            let hasChanges = false;

            snapshot.docChanges().forEach((change) => {
                hasChanges = true;
                const data = change.doc.data();
                if (data.id && typeof data.id === 'string' && !isNaN(Number(data.id))) {
                    data.id = Number(data.id);
                }
                data.timestamp = this._normalizeTimestamp(data.timestamp);

                if (change.type === "added" || change.type === "modified") {
                    this._putSalePreservingImage(store, data);
                } else if (change.type === "removed") {
                    store.delete(Number(change.doc.id));
                }
            });

            if (hasChanges && onSalesChange) {
                tx.oncomplete = () => onSalesChange();
            }
        }, (error) => {
            console.error("Sales listener error, will reconnect:", error);
            const delay = Math.min(retryDelay || 2000, 30000);
            setTimeout(() => this._startSalesListener(phoneNumber, onSalesChange, delay * 2), delay);
        });
    },

    // Re-fetch all sales from cloud (used on visibility change)
    async resyncSalesFromCloud() {
        if (!window.fb || !this._dataRoot()) return;
        try {
            const saleSnaps = await window.fb.getDocs(this._salesRef(this._dataRoot()));
            await new Promise((resolve, reject) => {
                const saleTx = this.db.transaction('sales', 'readwrite');
                const store = saleTx.objectStore('sales');
                saleSnaps.forEach(doc => {
                    const s = doc.data();
                    if (typeof s.id === 'string' && !isNaN(s.id)) s.id = Number(s.id);
                    s.timestamp = this._normalizeTimestamp(s.timestamp);
                    this._putSalePreservingImage(store, s);
                });
                saleTx.oncomplete = () => resolve();
                saleTx.onerror = () => reject(saleTx.error);
            });
        } catch (error) {
            console.error("Resync sales failed:", error);
        }
    },

    stopRealtimeListeners() {
        this._realtimePhone = null; // Prevent auto-reconnect after stop
        if (this.unsubscribeProducts) {
            this.unsubscribeProducts();
            this.unsubscribeProducts = null;
        }
        if (this.unsubscribeSales) {
            this.unsubscribeSales();
            this.unsubscribeSales = null;
        }
    },

    // --- USER ---
    saveUser(userData, sync = true) {
        const store = this._getStore('user', 'readwrite');
        const user = { id: 1, ...userData };
        if (sync && userData.phone) {
            this.userPhone = userData.phone;
            const cloudCopy = { ...userData };
            this.LOCAL_ONLY_USER_FIELDS.forEach(k => delete cloudCopy[k]);
            this._syncToCloud(null, null, cloudCopy); // Save to users/{phone}
        }
        return this._requestToPromise(store.put(user));
    },

    async clearUser() {
        this.stopRealtimeListeners(); // Stop syncing
        const store = this._getStore('user', 'readwrite');
        // Clear all stores on logout
        const productsStore = this._getStore('products', 'readwrite');
        const salesStore = this._getStore('sales', 'readwrite');
        productsStore.clear();
        salesStore.clear();
        this.userPhone = null;
        this.dataPhone = null;
        this._salesBy = null;
        return this._requestToPromise(store.clear());
    },

    getUser() {
        const store = this._getStore('user', 'readonly');
        return this._requestToPromise(store.get(1));
    },

    // --- PRODUCTS ---
    // `stockDelta` (a salesperson's sale): the cloud copy only moves the stock by that much, so two phones selling the same
    // product at once never overwrite each other, and the rest of the admin's product is left exactly as it is.
    saveProduct(product, stockDelta) {
        const store = this._getStore('products', 'readwrite');
        const cloudData = typeof stockDelta === 'number' ? { stock: window.fb.increment(stockDelta) } : product;
        this._syncToCloud('products', product.id, cloudData);
        return this._requestToPromise(store.put(product));
    },

    getProduct(id) {
        const store = this._getStore('products', 'readonly');
        return this._requestToPromise(store.get(id));
    },

    async getProductByBarcode(barcode) {
        const store = this._getStore('products', 'readonly');
        const index = store.index('barcode');
        const found = await this._requestToPromise(index.get(barcode));
        if (found || typeof barcode !== 'string' || !/^\d+$/.test(barcode)) return found;

        // The same retail code can be read as UPC-A (12 digits) or EAN-13 with a leading zero depending on the
        // decoder, so try the equivalent form before concluding the product is unknown.
        let alternate = null;
        if (barcode.length === 12) alternate = '0' + barcode;
        else if (barcode.length === 13 && barcode[0] === '0') alternate = barcode.slice(1);
        if (!alternate) return found;
        return this._requestToPromise(this._getStore('products', 'readonly').index('barcode').get(alternate));
    },

    getAllProducts() {
        const store = this._getStore('products', 'readonly');
        return this._requestToPromise(store.getAll());
    },

    deleteProduct(id) {
        const store = this._getStore('products', 'readwrite');
        if (this._dataRoot()) {
            window.fb.deleteDoc(window.fb.doc(window.fb.db, `users/${this._dataRoot()}/products`, String(id))).catch(e => console.error(e));
        }
        return this._requestToPromise(store.delete(id));
    },

    // --- SALES ---
    addSale(sale) {
        const store = this._getStore('sales', 'readwrite');
        const saleWithLogStatus = { ...sale, sharedAsLog: false };
        // Fire-and-forget cloud sync (matching saveProduct pattern exactly)
        this._syncToCloud('sales', sale.id, saleWithLogStatus);
        return this._requestToPromise(store.put(saleWithLogStatus));
    },

    updateSale(sale) {
        const store = this._getStore('sales', 'readwrite');
        this._syncToCloud('sales', sale.id, sale);
        return this._requestToPromise(store.put(sale));
    },

    // Changes only these fields of a sale (here and in the cloud), leaving the rest as the other phone last wrote it
    async patchSale(id, fields) {
        const sale = await this._requestToPromise(this._getStore('sales', 'readonly').get(id));
        if (sale) await this._requestToPromise(this._getStore('sales', 'readwrite').put({ ...sale, ...fields }));
        return this._syncToCloud('sales', id, fields);
    },

    getAllSales() {
        const store = this._getStore('sales', 'readonly');
        return this._requestToPromise(store.getAll());
    },

    getSalesByProductId(productId) {
        const store = this._getStore('sales', 'readonly');
        const index = store.index('productId');
        return this._requestToPromise(index.getAll(productId));
    },

    getSalesToday() {
        return new Promise((resolve, reject) => {
            const store = this._getStore('sales', 'readonly');
            const allSalesRequest = store.getAll();

            allSalesRequest.onsuccess = () => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const todaysSales = allSalesRequest.result.filter(sale => {
                    const saleDate = this._normalizeTimestamp(sale.timestamp);
                    return saleDate >= today;
                });
                resolve(todaysSales);
            };
            allSalesRequest.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    // --- SCAN COUNTS ---
    async getScanCountForToday() {
        const today = new Date().toISOString().split('T')[0];
        const store = this._getStore('scan_counts', 'readonly');
        const data = await this._requestToPromise(store.get(today));
        return data ? data.count : 0;
    },

    async incrementScanCount() {
        const today = new Date().toISOString().split('T')[0];
        const store = this._getStore('scan_counts', 'readwrite');
        const data = await this._requestToPromise(store.get(today));
        const currentCount = data ? data.count : 0;
        return this._requestToPromise(store.put({ date: today, count: currentCount + 1 }));
    },
};
