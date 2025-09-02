// db.js
let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PikaShotDB', 1);
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            db.createObjectStore('user', { keyPath: 'id' });
            db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
            db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
        };
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve();
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

function getUser() {
    return new Promise((resolve) => {
        const tx = db.transaction('user', 'readonly');
        const store = tx.objectStore('user');
        const request = store.get(1);
        request.onsuccess = () => resolve(request.result);
    });
}

function saveUser(user) {
    return new Promise((resolve) => {
        const tx = db.transaction('user', 'readwrite');
        const store = tx.objectStore('user');
        store.put({ id: 1, ...user });
        tx.oncomplete = resolve;
    });
}

function addProduct(product) {
    return new Promise((resolve) => {
        const tx = db.transaction('products', 'readwrite');
        const store = tx.objectStore('products');
        const request = store.add(product);
        request.onsuccess = () => {
            product.id = request.result;
            resolve(product);
        };
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
        getProduct(id).then(product => {
            const tx = db.transaction('products', 'readwrite');
            const store = tx.objectStore('products');
            store.put({ ...product, ...updates });
            tx.oncomplete = resolve;
        });
    });
}

function addSale(sale) {
    return new Promise((resolve) => {
        const tx = db.transaction('sales', 'readwrite');
        const store = tx.objectStore('sales');
        store.add(sale);
        tx.oncomplete = resolve;
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