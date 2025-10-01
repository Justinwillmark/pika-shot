const DB = {
    db: null,
    dbName: 'PikaShotDB',
    dbVersion: 4, // Incremented version to handle schema upgrade

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
                const transaction = event.target.transaction;

                // User store
                if (!db.objectStoreNames.contains('user')) {
                    db.createObjectStore('user', { keyPath: 'id' });
                }

                // Products store
                if (!db.objectStoreNames.contains('products')) {
                    const productStore = db.createObjectStore('products', { keyPath: 'id' });
                    productStore.createIndex('barcode', 'barcode', { unique: false });
                } else {
                    const productStore = transaction.objectStore('products');
                    if (!productStore.indexNames.contains('barcode')) {
                         productStore.createIndex('barcode', 'barcode', { unique: false });
                    }
                }

                // Sales store
                if (!db.objectStoreNames.contains('sales')) {
                    const salesStore = db.createObjectStore('sales', { keyPath: 'id' });
                    salesStore.createIndex('productId', 'productId', { unique: false });
                } else {
                     const salesStore = transaction.objectStore('sales');
                    if (!salesStore.indexNames.contains('productId')) {
                         salesStore.createIndex('productId', 'productId', { unique: false });
                    }
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
        const saleWithLogStatus = { ...sale, sharedAsLog: false };
        return this._requestToPromise(store.add(saleWithLogStatus));
    },

    updateSale(sale) {
        const store = this._getStore('sales', 'readwrite');
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
    }
};