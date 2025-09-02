const DB_NAME = 'pika-shot-db';
const DB_VERSION = 3; // IMPORTANT: Incremented for schema change
let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            let transaction = event.target.transaction;
            
            // Re-evaluate stores to handle upgrades
            if (!db.objectStoreNames.contains('products')) {
                db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
            }
            // Add 'unitType' if it doesn't exist (for users upgrading)
            // Note: IndexedDB doesn't have a direct 'addColumn', this is a simple setup.
            // For complex migrations, data would be read and rewritten.

            if (!db.objectStoreNames.contains('sales')) {
                db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('user_profile')) {
                db.createObjectStore('user_profile', { keyPath: 'key' });
            }
        };

        request.onsuccess = (event) => { db = event.target.result; resolve(db); };
        request.onerror = (event) => reject(event.target.errorCode);
    });
}

function saveData(storeName, data) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (err) => reject(err);
    });
}

function getData(storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (err) => reject(err);
    });
}

function getAllData(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = (err) => reject(err);
    });
}

async function getProductByEmbedding(embeddingToMatch) {
    const products = await getAllData('products');
    if (products.length === 0) return null;
    let bestMatch = null;
    let highestSimilarity = -1;
    for (const product of products) {
        if (product.embedding) {
            const similarity = cosineSimilarity(embeddingToMatch, product.embedding);
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                bestMatch = product;
            }
        }
    }
    if (highestSimilarity > 0.85) { // Stricter threshold for better accuracy
        return bestMatch;
    }
    return null;
}

async function updateProductStock(productId, quantitySold) {
    const product = await getData('products', productId);
    if (product) {
        product.quantity -= quantitySold;
        await saveData('products', product);
    }
}

function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0, normA = 0, normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}