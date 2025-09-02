const DB = {
    dbName: 'PikaShotDB',
    dbVersion: 1,
    db: null,

    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error("Database error:", event.target.errorCode);
                reject("Database error");
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log("Database opened successfully");
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('products')) {
                    const productStore = db.createObjectStore('products', { keyPath: 'id' });
                    // No indexes needed for this simple case, but could be added for performance
                }
                if (!db.objectStoreNames.contains('user_info')) {
                    db.createObjectStore('user_info', { keyPath: 'id' });
                }
            };
        });
    },

    setUserInfo(info) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['user_info'], 'readwrite');
            const store = transaction.objectStore('user_info');
            // Use a fixed ID for the single user info object
            const request = store.put({ id: 'user', ...info });
            
            request.onsuccess = () => resolve();
            request.onerror = (event) => reject("Error saving user info: " + event.target.error);
        });
    },

    getUserInfo() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['user_info'], 'readonly');
            const store = transaction.objectStore('user_info');
            const request = store.get('user');

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject("Error fetching user info: " + event.target.error);
        });
    },
    
    saveProduct(product) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readwrite');
            const store = transaction.objectStore('products');
            const request = store.put(product);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject("Error saving product: " + event.target.error);
        });
    },

    getProducts() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readonly');
            const store = transaction.objectStore('products');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject("Error fetching products: " + event.target.error);
        });
    },
    
    getProduct(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['products'], 'readonly');
            const store = transaction.objectStore('products');
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = (event) => reject("Error fetching product: " + event.target.error);
        });
    }
};