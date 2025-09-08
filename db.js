const DB = {
    db: null,
    dbName: 'PikaShotDB',
    dbVersion: 2, // Incremented version to trigger onupgradeneeded

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
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // User store
                if (!db.objectStoreNames.contains('user')) {
                    db.createObjectStore('user', { keyPath: 'id' });
                }
                
                // Products store
                if (!db.objectStoreNames.contains('products')) {
                    const productStore = db.createObjectStore('products', { keyPath: 'id' });
                    productStore.createIndex('barcode', 'barcode', { unique: false });
                } else {
                    const transaction = event.target.transaction;
                    const productStore = transaction.objectStore('products');
                    if (!productStore.indexNames.contains('barcode')) {
                         productStore.createIndex('barcode', 'barcode', { unique: false });
                    }
                }
                
                // Sales store
                if (!db.objectStoreNames.contains('sales')) {
                    db.createObjectStore('sales', { keyPath: 'id' });
                }
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

    // --- USER ---
    saveUser(userData) {
        const store = this._getStore('user', 'readwrite');
        const user = { id: 1, ...userData };
        return this._requestToPromise(store.put(user));
    },

    getUser() {
        const store = this._getStore('user', 'readonly');
        return this._requestToPromise(store.get(1));
    },

    // --- PRODUCTS ---
    saveProduct(product) {
        const store = this._getStore('products', 'readwrite');
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
        return this._requestToPromise(store.delete(id));
    },
    
    // --- SALES ---
    addSale(sale) {
        const store = this._getStore('sales', 'readwrite');
        return this._requestToPromise(store.add(sale));
    },
    
    getAllSales() {
        const store = this._getStore('sales', 'readonly');
        return this._requestToPromise(store.getAll());
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
    }
};