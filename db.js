let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PikaShotDB', 1);
        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject(request.error);
        };
        request.onsuccess = () => {
            db = request.result;
            resolve();
        };
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
            db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
            db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
        };
    });
}

function getUser() {
    return new Promise((resolve) => {
        if (!db) return resolve(null);
        const tx = db.transaction('users', 'readonly');
        const store = tx.objectStore('users');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result[0]);
        request.onerror = () => resolve(null);
    });
}

function setUser(user) {
    return new Promise((resolve) => {
        const tx = db.transaction('users', 'readwrite');
        const store = tx.objectStore('users');
        store.clear(); // Ensure only one user profile
        const request = store.add(user);
        request.onsuccess = resolve;
    });
}

function addProduct(product) {
    return new Promise((resolve) => {
        const tx = db.transaction('products', 'readwrite');
        const store = tx.objectStore('products');
        const request = store.add(product);
        request.onsuccess = resolve;
    });
}

function getProducts() {
    return new Promise((resolve) => {
        const tx = db.transaction('products', 'readonly');
        const store = tx.objectStore('products');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
    });
}

function getProduct(id) {
    return new Promise((resolve) => {
        const tx = db.transaction('products', 'readonly');
        const store = tx.objectStore('products');
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
    });
}

function updateProduct(id, updates) {
    return new Promise((resolve) => {
        getProduct(id).then(prod => {
            if (!prod) return resolve();
            // Retain original image and features
            const updated = { ...prod, ...updates, image: prod.image, features: prod.features };
            const tx = db.transaction('products', 'readwrite');
            const store = tx.objectStore('products');
            const request = store.put(updated);
            request.onsuccess = resolve;
        });
    });
}

function updateStock(id, newStock) {
    return updateProduct(id, { stock: newStock });
}

function addSale(sale) {
    return new Promise((resolve) => {
        const tx = db.transaction('sales', 'readwrite');
        const store = tx.objectStore('sales');
        const request = store.add(sale);
        request.onsuccess = resolve;
    });
}

function getSales() {
    return new Promise((resolve) => {
        const tx = db.transaction('sales', 'readonly');
        const store = tx.objectStore('sales');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
    });
}