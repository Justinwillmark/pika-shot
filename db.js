const db = (() => {
    let dbInstance;
    const DB_NAME = 'pikaShotDB';
    const DB_VERSION = 1;
    const STORES = {
        PRODUCTS: 'products',
        SALES: 'sales',
        USER: 'user',
    };

    async function init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("Database error:", event.target.error);
                reject("Database error");
            };

            request.onsuccess = (event) => {
                dbInstance = event.target.result;
                resolve(dbInstance);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
                    db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains(STORES.SALES)) {
                    db.createObjectStore(STORES.SALES, { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains(STORES.USER)) {
                    db.createObjectStore(STORES.USER, { keyPath: 'id' });
                }
            };
        });
    }

    function getStore(storeName, mode) {
        const transaction = dbInstance.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }

    async function saveUser(user) {
        return new Promise((resolve, reject) => {
            const store = getStore(STORES.USER, 'readwrite');
            const request = store.put({ id: 1, ...user });
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async function getUser() {
        return new Promise((resolve, reject) => {
            const store = getStore(STORES.USER, 'readonly');
            const request = store.get(1);
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async function saveProduct(product) {
        return new Promise((resolve, reject) => {
            const store = getStore(STORES.PRODUCTS, 'readwrite');
            const request = store.add(product);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }
    
    async function updateProduct(product) {
        return new Promise((resolve, reject) => {
            const store = getStore(STORES.PRODUCTS, 'readwrite');
            const request = store.put(product);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async function getProduct(id) {
        return new Promise((resolve, reject) => {
            const store = getStore(STORES.PRODUCTS, 'readonly');
            const request = store.get(id);
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    async function getAllProducts() {
        return new Promise((resolve, reject) => {
            const store = getStore(STORES.PRODUCTS, 'readonly');
            const request = store.getAll();
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }
    
    async function saveSale(sale) {
        return new Promise((resolve, reject) => {
            const store = getStore(STORES.SALES, 'readwrite');
            const request = store.add(sale);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }
    
    async function getDashboardStats() {
        const products = await getAllProducts();
        const sales = await new Promise((resolve, reject) => {
            const store = getStore(STORES.SALES, 'readonly');
            const request = store.getAll();
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });

        const totalSales = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
        const itemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
        const productsInStock = products.length;

        return { totalSales, itemsSold, productsInStock };
    }

    return { init, saveUser, getUser, saveProduct, getProduct, updateProduct, getAllProducts, saveSale, getDashboardStats };
})();