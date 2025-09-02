const DB = {
  db: null,
  
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('pika-shot-db', 2);

      request.onupgradeneeded = event => {
        this.db = event.target.result;
        if (!this.db.objectStoreNames.contains('user')) {
          this.db.createObjectStore('user', { keyPath: 'id' });
        }
        if (!this.db.objectStoreNames.contains('products')) {
          const productStore = this.db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
          productStore.createIndex('name', 'name', { unique: false });
        }
        if (!this.db.objectStoreNames.contains('sales')) {
          this.db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = event => {
        this.db = event.target.result;
        resolve();
      };

      request.onerror = event => {
        console.error('Database error:', event.target.error);
        reject(event.target.error);
      };
    });
  },

  async performTransaction(storeName, mode, action) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        return reject('Database is not initialized.');
      }
      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      
      transaction.onerror = (event) => {
        console.error(`Transaction error on ${storeName}:`, event.target.error);
        reject(event.target.error);
      };

      action(store, resolve, reject);
    });
  },

  async saveData(storeName, data) {
    return this.performTransaction(storeName, 'readwrite', (store, resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async getData(storeName, key) {
    return this.performTransaction(storeName, 'readonly', (store, resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },
  
  async getAllData(storeName) {
    return this.performTransaction(storeName, 'readonly', (store, resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async deleteData(storeName, key) {
    return this.performTransaction(storeName, 'readwrite', (store, resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};
