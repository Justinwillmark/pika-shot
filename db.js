const DB = {
    userPhone: null,
    wholesalerPhone: null,
    unsubscribeProducts: null,
    unsubscribeSales: null,

    async init() {
        return Promise.resolve();
    },

    _normalizeTimestamp(ts) {
        if (!ts) return new Date();
        if (ts.toDate && typeof ts.toDate === 'function') return ts.toDate();
        if (ts instanceof Date) return ts;
        if (typeof ts === 'number') return new Date(ts);
        if (typeof ts === 'string') {
            const d = new Date(ts);
            return isNaN(d.getTime()) ? new Date() : d;
        }
        if (ts.seconds !== undefined) return new Date(ts.seconds * 1000);
        return new Date();
    },

    getProductsPath() {
        if (this.wholesalerPhone) {
            return `users/${this.wholesalerPhone}/products`;
        }
        return `users/${this.userPhone}/products`;
    },

    getSalesPath() {
        return `users/${this.userPhone}/sales`;
    },

    // --- USER ---
    async saveUser(userData, sync = true) {
        this.userPhone = userData.phone;
        this.wholesalerPhone = userData.wholesalerPhone || null;
        
        localStorage.setItem('pika_user', JSON.stringify(userData));

        if (sync && userData.phone) {
            try {
                await window.fb.setDoc(window.fb.doc(window.fb.db, 'users', userData.phone), userData, { merge: true });
            } catch(e) { console.error("Error saving user to cloud", e); }
        }
        return userData;
    },

    async clearUser() {
        this.stopRealtimeListeners();
        localStorage.removeItem('pika_user');
        this.userPhone = null;
        this.wholesalerPhone = null;
        return Promise.resolve();
    },

    async getUser() {
        const local = localStorage.getItem('pika_user');
        if (local) {
            const user = JSON.parse(local);
            this.userPhone = user.phone;
            this.wholesalerPhone = user.wholesalerPhone || null;
            return user;
        }
        return null;
    },

    async syncDataFromCloud(phoneNumber) {
        this.userPhone = phoneNumber;
        try {
            const userRef = window.fb.doc(window.fb.db, 'users', phoneNumber);
            const userSnap = await window.fb.getDoc(userRef);
            if (userSnap.exists()) {
                const cloudUserData = userSnap.data();
                await this.saveUser(cloudUserData, false);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Sync from cloud failed:", error);
            return false;
        }
    },

    // --- REALTIME SYNC ---
    setupRealtimeListeners(phoneNumber, onProductsChange, onSalesChange) {
        if (!window.fb || !phoneNumber) return;
        this.stopRealtimeListeners();
        this.userPhone = phoneNumber;
        
        const local = localStorage.getItem('pika_user');
        if (local) {
            const user = JSON.parse(local);
            this.wholesalerPhone = user.wholesalerPhone || null;
        }

        const productsRef = window.fb.collection(window.fb.db, this.getProductsPath());
        this.unsubscribeProducts = window.fb.onSnapshot(productsRef, { includeMetadataChanges: true }, (snapshot) => {
            if (onProductsChange) onProductsChange();
        }, (error) => {
            console.error("Products listener error:", error);
        });

        const salesRef = window.fb.collection(window.fb.db, this.getSalesPath());
        this.unsubscribeSales = window.fb.onSnapshot(salesRef, { includeMetadataChanges: true }, (snapshot) => {
            if (onSalesChange) onSalesChange();
        }, (error) => {
            console.error("Sales listener error:", error);
        });
    },

    async resyncSalesFromCloud() {
        return Promise.resolve();
    },

    stopRealtimeListeners() {
        if (this.unsubscribeProducts) {
            this.unsubscribeProducts();
            this.unsubscribeProducts = null;
        }
        if (this.unsubscribeSales) {
            this.unsubscribeSales();
            this.unsubscribeSales = null;
        }
    },

    // --- HELPER: Blob to Base64 ---
    _blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            if (!blob) { resolve(null); return; }
            if (typeof blob === 'string') { resolve(blob); return; } // Already base64
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },
    
    _base64ToBlob(base64) {
        if (!base64 || typeof base64 !== 'string') return base64; // already a blob or null
        const parts = base64.split(';base64,');
        if (parts.length !== 2) return null;
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        return new Blob([uInt8Array], { type: contentType });
    },

    // --- PRODUCTS ---
    async saveProduct(product) {
        if (!this.userPhone) return;
        try {
            const cleanData = { ...product };
            if (cleanData.image && typeof cleanData.image !== 'string') {
                cleanData.imageBase64 = await this._blobToBase64(cleanData.image);
            } else if (cleanData.image && typeof cleanData.image === 'string') {
                cleanData.imageBase64 = cleanData.image;
            }
            delete cleanData.image; 
            cleanData.lastUpdate = window.fb.serverTimestamp();
            
            const ref = window.fb.doc(window.fb.db, this.getProductsPath(), String(product.id));
            await window.fb.setDoc(ref, cleanData, { merge: true });
        } catch(e) {
            console.error("Save product failed", e);
            throw e;
        }
    },

    async getProduct(id) {
        try {
            const ref = window.fb.doc(window.fb.db, this.getProductsPath(), String(id));
            const snap = await window.fb.getDoc(ref);
            if (snap.exists()) {
                const data = snap.data();
                if (data.imageBase64) {
                    data.image = this._base64ToBlob(data.imageBase64);
                }
                return data;
            }
            return null;
        } catch(e) { console.error(e); return null; }
    },

    async getProductByBarcode(barcode) {
        try {
            const q = window.fb.query(window.fb.collection(window.fb.db, this.getProductsPath()), window.fb.where('barcode', '==', barcode));
            const snaps = await window.fb.getDocs(q);
            if (!snaps.empty) {
                const data = snaps.docs[0].data();
                if (data.imageBase64) data.image = this._base64ToBlob(data.imageBase64);
                return data;
            }
            return null;
        } catch(e) { console.error(e); return null; }
    },

    async getAllProducts() {
        try {
            const snaps = await window.fb.getDocs(window.fb.collection(window.fb.db, this.getProductsPath()));
            const products = [];
            snaps.forEach(doc => {
                const data = doc.data();
                if (data.imageBase64) data.image = this._base64ToBlob(data.imageBase64);
                products.push(data);
            });
            return products;
        } catch(e) { console.error(e); return []; }
    },

    async deleteProduct(id) {
        if (!this.userPhone) return;
        try {
            await window.fb.deleteDoc(window.fb.doc(window.fb.db, this.getProductsPath(), String(id)));
        } catch(e) { console.error(e); throw e; }
    },

    // --- SALES ---
    async addSale(sale) {
        if (!this.userPhone) return;
        try {
            const saleWithLogStatus = { ...sale, sharedAsLog: false };
            if (saleWithLogStatus.image && typeof saleWithLogStatus.image !== 'string') {
                saleWithLogStatus.imageBase64 = await this._blobToBase64(saleWithLogStatus.image);
            } else if (saleWithLogStatus.image && typeof saleWithLogStatus.image === 'string') {
                saleWithLogStatus.imageBase64 = saleWithLogStatus.image;
            }
            delete saleWithLogStatus.image;
            if (!saleWithLogStatus.timestamp) saleWithLogStatus.timestamp = window.fb.serverTimestamp();
            
            const ref = window.fb.doc(window.fb.db, this.getSalesPath(), String(sale.id));
            await window.fb.setDoc(ref, saleWithLogStatus, { merge: true });
        } catch(e) { console.error("Add sale failed", e); throw e; }
    },

    async updateSale(sale) {
        if (!this.userPhone) return;
        try {
            const cleanData = { ...sale };
            if (cleanData.image && typeof cleanData.image !== 'string') {
                cleanData.imageBase64 = await this._blobToBase64(cleanData.image);
            } else if (cleanData.image && typeof cleanData.image === 'string') {
                cleanData.imageBase64 = cleanData.image;
            }
            delete cleanData.image;
            cleanData.lastUpdate = window.fb.serverTimestamp();

            const ref = window.fb.doc(window.fb.db, this.getSalesPath(), String(sale.id));
            await window.fb.setDoc(ref, cleanData, { merge: true });
        } catch(e) { console.error("Update sale failed", e); throw e; }
    },

    async getAllSales() {
        try {
            const snaps = await window.fb.getDocs(window.fb.collection(window.fb.db, this.getSalesPath()));
            const sales = [];
            snaps.forEach(doc => {
                const data = doc.data();
                if (data.imageBase64) data.image = this._base64ToBlob(data.imageBase64);
                sales.push(data);
            });
            return sales;
        } catch(e) { console.error(e); return []; }
    },

    async getSalesByProductId(productId) {
        try {
            const q = window.fb.query(window.fb.collection(window.fb.db, this.getSalesPath()), window.fb.where('productId', '==', productId));
            const snaps = await window.fb.getDocs(q);
            const sales = [];
            snaps.forEach(doc => {
                const data = doc.data();
                if (data.imageBase64) data.image = this._base64ToBlob(data.imageBase64);
                sales.push(data);
            });
            return sales;
        } catch(e) { console.error(e); return []; }
    },

    async getSalesToday() {
        try {
            const allSales = await this.getAllSales();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            return allSales.filter(sale => {
                const saleDate = this._normalizeTimestamp(sale.timestamp);
                return saleDate >= today;
            });
        } catch(e) { console.error(e); return []; }
    },

    // --- SCAN COUNTS ---
    async getScanCountForToday() {
        const today = new Date().toISOString().split('T')[0];
        const count = localStorage.getItem(`scan_count_${today}`);
        return count ? parseInt(count, 10) : 0;
    },

    async incrementScanCount() {
        const today = new Date().toISOString().split('T')[0];
        let count = await this.getScanCountForToday();
        count++;
        localStorage.setItem(`scan_count_${today}`, count.toString());
        return count;
    }
};
