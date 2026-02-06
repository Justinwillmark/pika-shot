const DB = {
    db: null,
    dbName: 'PikaShotDB',
    dbVersion: 5,
    userPhone: null, // Track the current user's phone for cloud paths

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
                    if(user && user.phone) this.userPhone = user.phone;
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
    _syncToCloud(collectionName, docId, data) {
        if (!this.userPhone || !window.fb) return; // Need user phone to know where to save
        const path = `users/${this.userPhone}${collectionName ? '/' + collectionName : ''}`;
        
        try {
            const ref = docId 
                ? window.fb.doc(window.fb.db, path, String(docId))
                : window.fb.doc(window.fb.db, path);
            
            // Remove image blobs and add server timestamp
            const cleanData = {...data};
            if(cleanData.image) delete cleanData.image; 
            
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
        const syncStartTime = new Date(); // Capture start time to set as new lastSync

        try {
            // Get local user to check for lastSync timestamp
            const localUser = await this.getUser();
            const lastSyncDate = localUser?.lastSync || null;

            // 1. Sync User Profile
            const userRef = window.fb.doc(window.fb.db, 'users', phoneNumber);
            const userSnap = await window.fb.getDoc(userRef);
            if (userSnap.exists()) {
                const cloudUserData = userSnap.data();
                // Preserve local lastSync when overwriting user data
                if (lastSyncDate) cloudUserData.lastSync = lastSyncDate;
                await this.saveUser(cloudUserData, false); // false = don't sync back to cloud
            }

            // 2. Get Products (Optimization: Fetch only changes if lastSync exists)
            const productsRef = window.fb.collection(window.fb.db, `users/${phoneNumber}/products`);
            let productsQuery = productsRef;
            
            if (lastSyncDate && window.fb.where && window.fb.query) {
                // If we have synced before, only get items updated since then
                productsQuery = window.fb.query(productsRef, window.fb.where('lastUpdate', '>', lastSyncDate));
            }

            const prodSnaps = await window.fb.getDocs(productsQuery);
            const prodTx = this.db.transaction('products', 'readwrite');
            prodSnaps.forEach(doc => {
                const p = doc.data();
                // Ensure IDs are numbers if they were numbers in IndexedDB
                if(typeof p.id === 'string' && !isNaN(p.id)) p.id = Number(p.id);
                prodTx.objectStore('products').put(p);
            });

            // 3. Get Sales (Optimization: Fetch only changes if lastSync exists)
            const salesRef = window.fb.collection(window.fb.db, `users/${phoneNumber}/sales`);
            let salesQuery = salesRef;

            if (lastSyncDate && window.fb.where && window.fb.query) {
                // Fetch sales updated (or created) after the last sync
                salesQuery = window.fb.query(salesRef, window.fb.where('lastUpdate', '>', lastSyncDate));
            }

            const saleSnaps = await window.fb.getDocs(salesQuery);
            const saleTx = this.db.transaction('sales', 'readwrite');
            saleSnaps.forEach(doc => {
                const s = doc.data();
                if(typeof s.id === 'string' && !isNaN(s.id)) s.id = Number(s.id);
                if(s.timestamp && s.timestamp.toDate) s.timestamp = s.timestamp.toDate(); // Convert Firestore Timestamp to Date
                saleTx.objectStore('sales').put(s);
            });

            // 4. Update lastSync in IDB upon successful sync
            const updatedUser = await this.getUser();
            if (updatedUser) {
                updatedUser.lastSync = syncStartTime;
                await this.saveUser(updatedUser, false);
            }

            return true;
        } catch (error) {
            console.error("Sync from cloud failed:", error);
            return false;
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
             window.fb.deleteDoc(window.fb.doc(window.fb.db, `users/${this.userPhone}/products`, String(id))).catch(e=>console.error(e));
        }
        return this._requestToPromise(store.delete(id));
    },

    // --- SALES ---
    addSale(sale) {
        const store = this._getStore('sales', 'readwrite');
        const saleWithLogStatus = { ...sale, sharedAsLog: false };
        this._syncToCloud('sales', sale.id, saleWithLogStatus);
        return this._requestToPromise(store.add(saleWithLogStatus));
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