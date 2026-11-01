// The phone's own copy of the account's data (IndexedDB), kept in step with the cloud.
//
// How the sync works:
// - Everything is saved on the phone first, then sent to the cloud. Without internet the cloud copy catches up later.
// - A phone only asks the cloud for what changed since it last looked (every document carries a `lastUpdate`
//   time), so opening the app costs a handful of reads instead of re-reading everything.
// - Stock only ever moves by the amount sold or received (increment), so two phones selling at once add up correctly.
// - A deleted product stays in the cloud marked `deleted`, which is how the other phones learn about it.
const DB = {
    db: null,
    dbName: 'PikaShotDB',
    dbVersion: 6,
    userPhone: null, // this person's own account (their user document)
    dataPhone: null, // whose products and sales these are: a salesperson works on their admin's
    _salesBy: null, // a salesperson only reads (and keeps) the sales they recorded themselves
    // Kept on this phone only: they say which business confirmed a salesperson, and the cloud copy of that is its own record
    LOCAL_ONLY_USER_FIELDS: ['businessPhone', 'businessName', 'businessType', 'businessLowStock', 'businessAdminName', 'businessLocation', 'geo', 'geoSent'],
    OVERLAP_MS: 2000,                    // each catch-up looks a few seconds back, so nothing slips between two reads
    FULL_CHECK_MS: 24 * 60 * 60 * 1000,  // once a day the product list is compared in full (it is small)
    unsubscribeProducts: null,
    unsubscribeSales: null,
    _listenToken: 0,

    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error("Database error:", event.target.error);
                reject("Database error");
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                // Try to load user to get phone number for cloud sync
                this.getUser().then(user => this.setIdentity(user));
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
                // Where this phone's sync got to. It lives beside the data, so if one is wiped the other goes too.
                if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
            };
        });
    },

    // Who this phone belongs to, and whose products and sales it works on. Call whenever the user or their business changes.
    setIdentity(user) {
        this.userPhone = (user && user.phone) || null;
        const salesperson = !!user && user.type === 'Salesperson';
        this.dataPhone = !user ? null : (salesperson ? (user.businessPhone || null) : user.phone);
        this._salesBy = salesperson ? user.phone : null;
    },

    _dataRoot() {
        return this.dataPhone || this.userPhone;
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

    // --- HELPERS ---
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

    // The time a cloud document was last written, in milliseconds (0 while the cloud has not stamped it yet)
    _stampMs(ts) {
        if (!ts) return 0;
        if (ts.toMillis) return ts.toMillis();
        if (ts.toDate) return ts.toDate().getTime();
        return typeof ts === 'number' ? ts : 0;
    },

    // A small picture sent as text (data:image/jpeg;base64,...) back into a picture
    _dataUrlToBlob(url) {
        if (typeof url !== 'string' || url.length > 300000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(url)) return null;
        try {
            const binary = atob(url.slice(url.indexOf(',') + 1));
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
            return new Blob([bytes], { type: url.slice(5, url.indexOf(';')) });
        } catch (e) { return null; }
    },

    async getMeta(key) {
        try {
            const row = await this._requestToPromise(this._getStore('meta', 'readonly').get(key));
            return row ? row.value : null;
        } catch (e) { return null; }
    },

    setMeta(key, value) {
        return this._requestToPromise(this._getStore('meta', 'readwrite').put({ key, value })).catch(e => console.error('Could not save sync progress:', e));
    },

    _cursorKey(kind, root) {
        return `${kind}:${root}${kind === 'sales' && this._salesBy ? ':' + this._salesBy : ''}`;
    },

    // --- WHAT TO ASK THE CLOUD FOR ---
    _productsQuery(root, since) {
        const ref = window.fb.collection(window.fb.db, `users/${root}/products`);
        return since ? window.fb.query(ref, window.fb.where('lastUpdate', '>', new Date(since - this.OVERLAP_MS))) : ref;
    },

    // All the sales, or for a salesperson only the ones they recorded. Asking only for what changed since `since` needs a
    // composite index for a salesperson; if the project does not have it yet they fall back to reading their own sales in full.
    _salesQuery(root, since) {
        const ref = window.fb.collection(window.fb.db, `users/${root}/sales`);
        const filters = [];
        if (this._salesBy) filters.push(window.fb.where('recordedBy', '==', this._salesBy));
        if (since && !(this._salesBy && this._noSalesIndex)) filters.push(window.fb.where('lastUpdate', '>', new Date(since - this.OVERLAP_MS)));
        return filters.length ? window.fb.query(ref, ...filters) : ref;
    },

    // --- PUTTING WHAT THE CLOUD SENT ON THIS PHONE ---
    _putSalePreservingImage(store, sale) {
        const getReq = store.get(sale.id);
        getReq.onsuccess = () => {
            const existing = getReq.result;
            if (existing && existing.image && !sale.image) sale.image = existing.image;
            store.put(sale);
        };
    },

    _applySale(store, raw) {
        const s = { ...raw };
        if (typeof s.id === 'string' && !isNaN(s.id)) s.id = Number(s.id);
        s.timestamp = this._normalizeTimestamp(s.timestamp);
        this._putSalePreservingImage(store, s);
    },

    _applyProduct(store, raw) {
        const p = { ...raw };
        if (typeof p.id === 'string' && !isNaN(p.id)) p.id = Number(p.id);
        if (p.deleted) { store.delete(p.id); return; }
        const getReq = store.get(p.id);
        getReq.onsuccess = () => {
            const existing = getReq.result;
            if (existing && existing.image && (!p.thumb || p.thumb === existing.thumb)) {
                p.image = existing.image; // the full picture taken on this phone stays
            } else if (p.thumb) {
                const picture = this._dataUrlToBlob(p.thumb); // a new phone, cleared data, or the picture was changed elsewhere
                if (picture) p.image = picture;
            }
            p._seenInCloud = true;
            store.put(p);
        };
    },

    // Reads what changed in `kind` since the last look and puts it on this phone. `full` reads everything.
    async _pull(kind, phone, full) {
        const key = this._cursorKey(kind, phone);
        const since = full ? 0 : (Number(await this.getMeta(key)) || 0);
        const target = kind === 'products' ? this._productsQuery(phone, since) : this._salesQuery(phone, since);
        let snaps;
        try {
            snaps = await window.fb.getDocs(target);
        } catch (error) {
            if (kind === 'sales' && this._salesBy && error && error.code === 'failed-precondition' && !this._noSalesIndex) {
                this._noSalesIndex = true; // no index for "only what changed": read this salesperson's own sales in full instead
                return this._pull(kind, phone, full);
            }
            throw error;
        }
        let newest = since;
        await new Promise((resolve, reject) => {
            const tx = this.db.transaction(kind, 'readwrite');
            const store = tx.objectStore(kind);
            snaps.forEach(doc => {
                const data = doc.data();
                newest = Math.max(newest, this._stampMs(data.lastUpdate));
                if (kind === 'products') this._applyProduct(store, data); else this._applySale(store, data);
            });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
        if (newest > since || full) await this.setMeta(key, Math.max(newest, since));
        return snaps;
    },

    // Products that exist only on this phone (they never reached the cloud) are sent up; products another phone deleted
    // while this one was away are removed here. Run once a day: the product list is small.
    async _reconcileProducts(phone) {
        const snaps = await this._pull('products', phone, true);
        const inCloud = new Set();
        snaps.forEach(doc => { const d = doc.data(); if (!d.deleted) inCloud.add(String(doc.id)); });
        const local = await this.getAllProducts();
        for (const p of local) {
            if (inCloud.has(String(p.id))) continue;
            if (p._seenInCloud) { await this._requestToPromise(this._getStore('products', 'readwrite').delete(p.id)); continue; }
            if (!this._salesBy) this._syncToCloud('products', p.id, p, { thumb: true }); // never reached the cloud: send it now
        }
        await this.setMeta(`fullProducts:${phone}`, Date.now());
    },

    // --- CLOUD SYNC ---
    _syncToCloud(collectionName, docId, data, options) {
        const root = collectionName ? this._dataRoot() : this.userPhone;
        if (!root || !window.fb) return Promise.resolve(); // Need the phone to know where to save
        const path = `users/${root}${collectionName ? '/' + collectionName : ''}`;

        try {
            const ref = docId
                ? window.fb.doc(window.fb.db, path, String(docId))
                : window.fb.doc(window.fb.db, path);

            // Pictures stay on the phone (a small copy travels only when asked); nothing undefined may be sent
            const cleanData = {};
            Object.keys(data).forEach(k => {
                const v = data[k];
                if (v !== undefined && !(v instanceof Blob) && k !== 'image' && k !== '_seenInCloud') cleanData[k] = v;
            });
            if (collectionName === 'products' && !(options && options.thumb)) delete cleanData.thumb;
            if (window.fb.serverTimestamp) cleanData.lastUpdate = window.fb.serverTimestamp(); // how the other phones know it changed

            return window.fb.setDoc(ref, cleanData, { merge: true })
                .catch(err => console.error("Cloud sync failed:", err));
        } catch (e) {
            console.error("Error initiating cloud sync:", e);
            return Promise.resolve();
        }
    },

    // Everything for a phone that has just logged in
    async syncDataFromCloud(phoneNumber) {
        if (!window.fb) return false;
        this.userPhone = phoneNumber;

        try {
            // 1. Sync User Profile (what only this phone knows about the business stays)
            const userRef = window.fb.doc(window.fb.db, 'users', phoneNumber);
            const userSnap = await window.fb.getDoc(userRef);
            if (userSnap.exists()) {
                const cloudUserData = userSnap.data();
                const existing = await this.getUser();
                this.LOCAL_ONLY_USER_FIELDS.forEach(k => { if (existing && existing[k] !== undefined) cloudUserData[k] = existing[k]; });
                await this.saveUser(cloudUserData, false); // false = don't sync back to cloud
            }

            // 2. Products and sales in full (the next times only what changed)
            const root = this._dataRoot();
            await this._pull('products', root, true);
            await this.setMeta(`fullProducts:${root}`, Date.now());
            await this._pull('sales', root, true);
            return true;
        } catch (error) {
            console.error("Sync from cloud failed:", error);
            return false;
        }
    },

    // --- REALTIME SYNC ---
    // `phoneNumber` is whose data to follow: the user's own, or for a salesperson their admin's
    setupRealtimeListeners(phoneNumber, onProductsChange, onSalesChange) {
        if (!window.fb || !phoneNumber) return;
        this.stopRealtimeListeners(); // Ensure clean slate
        this.dataPhone = phoneNumber;
        this._realtimePhone = phoneNumber;
        this._realtimeCallbacks = { onProductsChange, onSalesChange };
        this._noSalesIndex = false;

        this._listen('products', phoneNumber, onProductsChange);
        this._listen('sales', phoneNumber, onSalesChange);
    },

    async _listen(kind, phone, onChange, retryDelay) {
        if (this._realtimePhone !== phone) return; // User changed, don't reconnect
        const token = this._listenToken;
        try {
            // A new phone, or one that has not compared the whole product list today, does that first
            if (kind === 'products') {
                const last = Number(await this.getMeta(`fullProducts:${phone}`)) || 0;
                if (Date.now() - last > this.FULL_CHECK_MS) {
                    try { await this._reconcileProducts(phone); if (onChange) onChange(); } catch (e) { console.error('Daily product check failed:', e); }
                }
            }
        } catch (e) { /* the listener below still starts */ }
        if (token !== this._listenToken || this._realtimePhone !== phone) return;

        const key = this._cursorKey(kind, phone);
        let cursor = Number(await this.getMeta(key)) || 0;
        if (token !== this._listenToken) return;
        const target = kind === 'products' ? this._productsQuery(phone, cursor) : this._salesQuery(phone, cursor);

        const unsubscribe = window.fb.onSnapshot(target, (snapshot) => {
            const tx = this.db.transaction(kind, 'readwrite');
            const store = tx.objectStore(kind);
            let changed = false;
            let newest = cursor;

            snapshot.docChanges().forEach((change) => {
                changed = true;
                if (change.type === 'removed') {
                    store.delete(Number(change.doc.id));
                    return;
                }
                const data = change.doc.data();
                newest = Math.max(newest, this._stampMs(data.lastUpdate));
                if (kind === 'products') this._applyProduct(store, data); else this._applySale(store, data);
            });

            tx.oncomplete = () => {
                if (newest > cursor) { cursor = newest; this.setMeta(key, cursor); }
                if (changed && onChange) onChange();
            };
        }, (error) => {
            console.error(`${kind} listener error, will reconnect:`, error);
            if (kind === 'sales' && this._salesBy && error && error.code === 'failed-precondition' && !this._noSalesIndex) {
                this._noSalesIndex = true; // no index for "only what changed": follow this salesperson's own sales in full
                this._listen(kind, phone, onChange, retryDelay);
                return;
            }
            const delay = Math.min(retryDelay || 2000, 30000);
            setTimeout(() => this._listen(kind, phone, onChange, delay * 2), delay);
        });
        if (token !== this._listenToken) { unsubscribe(); return; }
        if (kind === 'products') this.unsubscribeProducts = unsubscribe; else this.unsubscribeSales = unsubscribe;
    },

    // The phone came back to the foreground: pick up anything the live connection missed. Only changes are read.
    async catchUp() {
        const phone = this._dataRoot();
        if (!window.fb || !phone || !this.db) return false;
        try {
            await this._pull('products', phone);
            await this._pull('sales', phone);
            return true;
        } catch (error) {
            console.error("Catch-up failed:", error);
            return false;
        }
    },

    resyncSalesFromCloud() { return this.catchUp(); },

    stopRealtimeListeners() {
        this._realtimePhone = null; // Prevent auto-reconnect after stop
        this._listenToken++;        // anything still starting up sees a new token and gives up
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
            const cloudCopy = { ...userData };
            this.LOCAL_ONLY_USER_FIELDS.forEach(k => delete cloudCopy[k]);
            this._syncToCloud(null, null, cloudCopy); // Save to users/{phone}
        }
        return this._requestToPromise(store.put(user));
    },

    async clearUser() {
        this.stopRealtimeListeners(); // Stop syncing
        const store = this._getStore('user', 'readwrite');
        // Clear all stores on logout
        ['products', 'sales', 'scan_counts', 'meta'].forEach(name => this._getStore(name, 'readwrite').clear());
        this.userPhone = null;
        this.dataPhone = null;
        this._salesBy = null;
        return this._requestToPromise(store.clear());
    },

    getUser() {
        const store = this._getStore('user', 'readonly');
        return this._requestToPromise(store.get(1));
    },

    // --- PRODUCTS ---
    // `options` (or a number, meaning `delta`) says what to send to the cloud:
    //   delta: the stock moved by this much (never the total, so two phones selling at once add up correctly)
    //   only:  just these fields (so a change on one phone never undoes a different change on another)
    //   thumb: the small picture changed, so send it too
    // With neither delta nor only, the whole product goes (a new product, or one the cloud has not seen yet).
    // What goes online when a product changes: only the fields that changed (the stock as a "+/- n", never "set to"),
    // or the whole product if the cloud has never seen it
    _pushProduct(product, options) {
        options = options || {};
        let cloudData;
        const partial = (options.only || typeof options.delta === 'number') && product._seenInCloud; // never leave a half-empty product behind
        if (partial) {
            cloudData = {};
            (options.only || []).forEach(k => { if (product[k] !== undefined) cloudData[k] = product[k]; });
            if (typeof options.delta === 'number') cloudData.stock = window.fb.increment(options.delta);
            cloudData.id = product.id;
        } else {
            cloudData = product;
        }
        return this._syncToCloud('products', product.id, cloudData, { thumb: !!options.thumb || !partial && !!product.thumb && !product._seenInCloud });
    },
    saveProduct(product, options) {
        if (typeof options === 'number') options = { delta: options };
        options = options || {};
        const store = this._getStore('products', 'readwrite');
        this._pushProduct(product, options);
        return this._requestToPromise(store.put(product));
    },

    getProduct(id) {
        const store = this._getStore('products', 'readonly');
        return this._requestToPromise(store.get(id));
    },

    async getProductByBarcode(barcode) {
        const store = this._getStore('products', 'readonly');
        const index = store.index('barcode');
        const found = await this._requestToPromise(index.get(barcode));
        if (found || typeof barcode !== 'string' || !/^\d+$/.test(barcode)) return found;

        // The same retail code can be read as UPC-A (12 digits) or EAN-13 with a leading zero depending on the
        // decoder, so try the equivalent form before concluding the product is unknown.
        let alternate = null;
        if (barcode.length === 12) alternate = '0' + barcode;
        else if (barcode.length === 13 && barcode[0] === '0') alternate = barcode.slice(1);
        if (!alternate) return found;
        return this._requestToPromise(this._getStore('products', 'readonly').index('barcode').get(alternate));
    },

    getAllProducts() {
        const store = this._getStore('products', 'readonly');
        return this._requestToPromise(store.getAll());
    },

    // The product stays in the cloud marked deleted, so every other phone removes it too
    deleteProduct(id) {
        const store = this._getStore('products', 'readwrite');
        this._syncToCloud('products', id, { id, deleted: true, thumb: window.fb.deleteField() }, { thumb: true }); // (the small picture goes too: it only takes up room)
        return this._requestToPromise(store.delete(id));
    },

    // --- SALES ---
    addSale(sale) {
        const store = this._getStore('sales', 'readwrite');
        const saleWithLogStatus = { ...sale, sharedAsLog: false };
        this._syncToCloud('sales', sale.id, saleWithLogStatus);
        return this._requestToPromise(store.put(saleWithLogStatus));
    },

    // `fields` (a list of names) sends only those to the cloud, so a change on one phone never undoes another phone's
    // Records a NEW sale and takes its quantity out of stock in one step on this phone. The sale's id is what makes it one sale:
    // if that id is already here (a second tap, a retry after a slow connection) nothing changes and { inserted: false } comes back.
    // The stock is changed by what was sold, read from what is stored now (not from a screen that may be out of date).
    recordSale(sale, productId, delta) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['sales', 'products'], 'readwrite');
            const sales = tx.objectStore('sales'), products = tx.objectStore('products');
            const result = { inserted: false, product: null, sale: null };
            const existing = sales.get(sale.id);
            existing.onsuccess = () => {
                if (existing.result) return; // already recorded
                const record = { ...sale, sharedAsLog: false };
                sales.put(record);
                result.inserted = true;
                result.sale = record;
                const found = products.get(productId);
                found.onsuccess = () => {
                    const product = found.result;
                    if (!product) return;
                    product.stock = (Number(product.stock) || 0) + delta;
                    products.put(product);
                    result.product = product;
                };
            };
            tx.oncomplete = () => {
                if (result.inserted) { // online only after it is safe here; the same id means the cloud copy can never be a second sale
                    this._syncToCloud('sales', sale.id, result.sale);
                    if (result.product) this._pushProduct(result.product, { delta });
                }
                resolve(result);
            };
            tx.onerror = tx.onabort = () => reject(tx.error || new Error('Could not save the sale'));
        });
    },

    // Saves a change to a sale already recorded, and moves the stock by the DIFFERENCE between the quantity stored and the new one.
    // Doing the same edit again changes nothing (the difference is then zero).
    editSale(sale, productId) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(['sales', 'products'], 'readwrite');
            const sales = tx.objectStore('sales'), products = tx.objectStore('products');
            const result = { delta: 0, product: null };
            const before = sales.get(sale.id);
            before.onsuccess = () => {
                const was = before.result ? Number(before.result.quantity) || 0 : Number(sale.quantity) || 0;
                result.delta = was - (Number(sale.quantity) || 0);
                sales.put(sale);
                if (!result.delta) return;
                const found = products.get(productId);
                found.onsuccess = () => {
                    const product = found.result;
                    if (!product) return;
                    product.stock = (Number(product.stock) || 0) + result.delta;
                    products.put(product);
                    result.product = product;
                };
            };
            tx.oncomplete = () => {
                this._syncToCloud('sales', sale.id, sale);
                if (result.product) this._pushProduct(result.product, { delta: result.delta });
                resolve(result);
            };
            tx.onerror = tx.onabort = () => reject(tx.error || new Error('Could not save the sale'));
        });
    },

    updateSale(sale, fields) {
        const store = this._getStore('sales', 'readwrite');
        let cloudData = sale;
        if (Array.isArray(fields)) {
            cloudData = {};
            fields.forEach(k => { if (sale[k] !== undefined) cloudData[k] = sale[k]; });
        }
        this._syncToCloud('sales', sale.id, cloudData);
        return this._requestToPromise(store.put(sale));
    },

    // Changes only these fields of a sale (here and in the cloud), leaving the rest as the other phone last wrote it
    async patchSale(id, fields) {
        const sale = await this._requestToPromise(this._getStore('sales', 'readonly').get(id));
        if (sale) await this._requestToPromise(this._getStore('sales', 'readwrite').put({ ...sale, ...fields }));
        return this._syncToCloud('sales', id, fields);
    },

    getAllSales() {
        const store = this._getStore('sales', 'readonly');
        return this._requestToPromise(store.getAll());
    },
    countSales() {
        return this._requestToPromise(this._getStore('sales', 'readonly').count());
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
                    const saleDate = this._normalizeTimestamp(sale.timestamp);
                    return saleDate >= today;
                });
                resolve(todaysSales);
            };
            allSalesRequest.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    // --- SCAN COUNTS (per day, on this phone; the app adds up the other phones' counts from the account) ---
    _today() { return new Date().toISOString().split('T')[0]; },

    async getScanCountForToday() {
        const data = await this._requestToPromise(this._getStore('scan_counts', 'readonly').get(this._today()));
        return data ? data.count : 0;
    },

    async incrementScanCount() {
        const store = this._getStore('scan_counts', 'readwrite');
        const data = await this._requestToPromise(store.get(this._today()));
        const currentCount = data ? data.count : 0;
        return this._requestToPromise(store.put({ date: this._today(), count: currentCount + 1 }));
    },

    // Another phone scanned too: show the bigger of the two totals
    async raiseScanCount(day, count) {
        const store = this._getStore('scan_counts', 'readwrite');
        const data = await this._requestToPromise(store.get(day));
        if (!data || data.count < count) await this._requestToPromise(store.put({ date: day, count }));
    },
};
