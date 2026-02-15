const DB = {
    db: null,
    dbName: 'PikaShotDB',
    dbVersion: 5,
    userPhone: null, // Track the current user's phone for cloud paths
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
                this.getUser().then(user => {
                    if (user && user.phone) this.userPhone = user.phone;
                });
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

    _syncToCloud(collectionName, docId, data) {
        if (!this.userPhone || !window.fb) return; // Need user phone to know where to save
        const path = `users/${this.userPhone}${collectionName ? '/' + collectionName : ''}`;

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

            window.fb.setDoc(ref, cleanData, { merge: true })
                .catch(err => console.error("Cloud sync failed:", err));
        } catch (e) {
            console.error("Error initiating cloud sync:", e);
        }
    },

    async syncDataFromCloud(phoneNumber) {
        if (!window.fb) return false;
        this.userPhone = phoneNumber;

        try {
            // 1. Sync User Profile
            const userRef = window.fb.doc(window.fb.db, 'users', phoneNumber);
            const userSnap = await window.fb.getDoc(userRef);
            if (userSnap.exists()) {
                const cloudUserData = userSnap.data();
                await this.saveUser(cloudUserData, false); // false = don't sync back to cloud
            }

            // 2. Get ALL Products (always fetch all to avoid sync gaps)
            const productsRef = window.fb.collection(window.fb.db, `users/${phoneNumber}/products`);
            const prodSnaps = await window.fb.getDocs(productsRef);
            await new Promise((resolve, reject) => {
                const prodTx = this.db.transaction('products', 'readwrite');
                const store = prodTx.objectStore('products');
                prodSnaps.forEach(doc => {
                    const p = doc.data();
                    if (typeof p.id === 'string' && !isNaN(p.id)) p.id = Number(p.id);
                    store.put(p);
                });
                prodTx.oncomplete = () => resolve();
                prodTx.onerror = () => reject(prodTx.error);
            });

            // 3. Get ALL Sales (always fetch all to avoid sync gaps)
            const salesRef = window.fb.collection(window.fb.db, `users/${phoneNumber}/sales`);
            const saleSnaps = await window.fb.getDocs(salesRef);
            await new Promise((resolve, reject) => {
                const saleTx = this.db.transaction('sales', 'readwrite');
                const store = saleTx.objectStore('sales');
                saleSnaps.forEach(doc => {
                    const s = doc.data();
                    if (typeof s.id === 'string' && !isNaN(s.id)) s.id = Number(s.id);
                    s.timestamp = this._normalizeTimestamp(s.timestamp);
                    store.put(s);
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

    // --- REALTIME SYNC (NEW) ---
    setupRealtimeListeners(phoneNumber, onProductsChange, onSalesChange) {
        if (!window.fb || !phoneNumber) return;
        this.stopRealtimeListeners(); // Ensure clean slate
        this.userPhone = phoneNumber;

        // Products Listener
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
                    store.put(data);
                } else if (change.type === "removed") {
                    store.delete(Number(change.doc.id));
                }
            });

            if (hasChanges && onProductsChange) {
                tx.oncomplete = () => onProductsChange();
            }
        }, (error) => console.error("Products listener error:", error));

        // Sales Listener
        const salesRef = window.fb.collection(window.fb.db, `users/${phoneNumber}/sales`);
        this.unsubscribeSales = window.fb.onSnapshot(salesRef, (snapshot) => {
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
                    store.put(data);
                } else if (change.type === "removed") {
                    store.delete(Number(change.doc.id));
                }
            });

            if (hasChanges && onSalesChange) {
                tx.oncomplete = () => onSalesChange();
            }
        }, (error) => console.error("Sales listener error:", error));
    },

    stopRealtimeListeners() {
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
            this._syncToCloud(null, null, userData); // Save to users/{phone}
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
        return this._requestToPromise(store.clear());
    },

    getUser() {
        const store = this._getStore('user', 'readonly');
        return this._requestToPromise(store.get(1));
    },

    // --- PRODUCTS ---
    saveProduct(product) {
        const store = this._getStore('products', 'readwrite');
        this._syncToCloud('products', product.id, product);
        return this._requestToPromise(store.put(product));
    },

    getProduct(id) {
        const store = this._getStore('products', 'readonly');
        return this._requestToPromise(store.get(id));
    },

    getProductByBarcode(barcode) {
        const store = this._getStore('products', 'readonly');
        const index = store.index('barcode');
        return this._requestToPromise(index.get(barcode));
    },

    getAllProducts() {
        const store = this._getStore('products', 'readonly');
        return this._requestToPromise(store.getAll());
    },

    deleteProduct(id) {
        const store = this._getStore('products', 'readwrite');
        if (this.userPhone) {
            window.fb.deleteDoc(window.fb.doc(window.fb.db, `users/${this.userPhone}/products`, String(id))).catch(e => console.error(e));
        }
        return this._requestToPromise(store.delete(id));
    },

    // --- SALES ---
    addSale(sale) {
        const store = this._getStore('sales', 'readwrite');
        const saleWithLogStatus = { ...sale, sharedAsLog: false };
        this._syncToCloud('sales', sale.id, saleWithLogStatus);
        return this._requestToPromise(store.put(saleWithLogStatus));
    },

    updateSale(sale) {
        const store = this._getStore('sales', 'readwrite');
        this._syncToCloud('sales', sale.id, sale);
        return this._requestToPromise(store.put(sale));
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
                    const saleDate = new Date(sale.timestamp);
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
