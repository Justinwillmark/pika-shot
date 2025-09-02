document.addEventListener('DOMContentLoaded', () => {
    const App = {
        // State
        isCameraOn: false,
        currentScanMode: null, // 'add' or 'sell'
        capturedImageData: null,
        editingProductId: null,
        deferredInstallPrompt: null,
        salesData: [], // To hold today's sales

        // UI Elements
        elements: {
            loader: document.getElementById('loader'),
            appContainer: document.getElementById('app-container'),
            views: document.querySelectorAll('.view'),
            onboardingView: document.getElementById('onboarding-view'),
            cameraPermissionView: document.getElementById('camera-permission-view'),
            mainApp: document.getElementById('main-app'),
            homeView: document.getElementById('home-view'),
            productsView: document.getElementById('products-view'),
            cameraView: document.getElementById('camera-view'),
            
            finishOnboardingBtn: document.getElementById('finish-onboarding-btn'),
            grantCameraBtn: document.getElementById('grant-camera-btn'),
            
            navButtons: document.querySelectorAll('.nav-btn'),
            backButtons: document.querySelectorAll('.back-btn'),
            installBtn: document.getElementById('install-btn'),

            // Modals & Backdrop
            modalBackdrop: document.getElementById('modal-backdrop'),
            confirmCaptureModal: document.getElementById('confirm-capture-modal'),
            productDetailsModal: document.getElementById('product-details-modal'),
            sellItemModal: document.getElementById('sell-item-modal'),
            communalBookingModal: document.getElementById('communal-booking-modal'),

            // Home
            welcomeMessage: document.getElementById('welcome-message'),
            businessNameHeader: document.getElementById('business-name-header'),
            totalSalesEl: document.getElementById('total-sales'),
            itemsSoldEl: document.getElementById('items-sold'),
            recentSalesList: document.getElementById('recent-sales-list'),
            sellItemHomeBtn: document.getElementById('sell-item-home-btn'),
            addProductHomeBtn: document.getElementById('add-product-home-btn'),

            // Products
            productList: document.getElementById('product-list'),
            addNewProductFab: document.getElementById('add-new-product-btn-fab'),
            productForm: document.getElementById('product-form'),
            modalTitle: document.getElementById('modal-title'),

            // Camera
            cameraStatus: document.getElementById('camera-status'),
            cancelScanBtn: document.getElementById('cancel-scan-btn'),

            // Product capture
            capturedImagePreview: document.getElementById('captured-image-preview'),
            retakePhotoBtn: document.getElementById('retake-photo-btn'),
            confirmPhotoBtn: document.getElementById('confirm-photo-btn'),

            // Sell item modal
            sellProductName: document.getElementById('sell-product-name'),
            sellProductImage: document.getElementById('sell-product-image'),
            sellQuantityInput: document.getElementById('sell-quantity'),
            sellTotalPrice: document.getElementById('sell-total-price'),
            confirmSellBtn: document.getElementById('confirm-sell-btn'),
            cancelSellBtn: document.getElementById('cancel-sell-btn'),

            // Toast
            toast: document.getElementById('toast'),
        },

        init() {
            this.registerServiceWorker();
            DB.init().then(() => {
                this.bindEvents();
                this.checkOnboarding();
                // Simulate communal bookkeeping
                setTimeout(() => this.showCommunalBookingToast(), 15000);
            });
        },

        bindEvents() {
            this.elements.finishOnboardingBtn.addEventListener('click', () => this.finishOnboarding());
            this.elements.grantCameraBtn.addEventListener('click', () => this.requestCameraPermission());

            // Navigation
            this.elements.navButtons.forEach(btn => {
                btn.addEventListener('click', () => this.navigateTo(btn.dataset.view));
            });
            this.elements.backButtons.forEach(btn => {
                btn.addEventListener('click', () => this.navigateTo(btn.dataset.target));
            });
            
            // Core Actions
            this.elements.sellItemHomeBtn.addEventListener('click', () => this.startScan('sell'));
            this.elements.addProductHomeBtn.addEventListener('click', () => this.startScan('add'));
            this.elements.addNewProductFab.addEventListener('click', () => this.startScan('add'));
            this.elements.cancelScanBtn.addEventListener('click', () => this.stopScan());

            // Modals
            this.elements.retakePhotoBtn.addEventListener('click', () => {
                this.hideModal('confirm-capture-modal');
                this.startScan(this.currentScanMode, true); // Restart scan without hiding camera view
            });
            this.elements.confirmPhotoBtn.addEventListener('click', () => {
                this.hideModal('confirm-capture-modal');
                this.showModal('product-details-modal');
            });

            // Product Form
            this.elements.productForm.addEventListener('submit', (e) => this.saveProduct(e));
            document.getElementById('cancel-product-form-btn').addEventListener('click', () => {
                this.hideModal('product-details-modal');
                this.navigateTo('products-view'); // Go back to products list
                this.stopScan(); // Ensure camera is fully off
            });

            // Sell Form
            this.elements.sellQuantityInput.addEventListener('input', () => this.updateSellTotal());
            this.elements.confirmSellBtn.addEventListener('click', () => this.processSale());
            this.elements.cancelSellBtn.addEventListener('click', () => this.cancelSale());

            // PWA Install
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                this.deferredInstallPrompt = e;
                this.elements.installBtn.classList.remove('hidden');
            });
            this.elements.installBtn.addEventListener('click', () => this.promptInstall());

            // Communal Booking
            this.elements.toast.addEventListener('click', () => {
                this.hideToast();
                this.showModal('communal-booking-modal');
            });
            document.getElementById('accept-booking-btn').addEventListener('click', () => this.hideModal('communal-booking-modal'));
            document.getElementById('decline-booking-btn').addEventListener('click', () => this.hideModal('communal-booking-modal'));
        },
        
        async checkOnboarding() {
            const userInfo = await DB.getUserInfo();
            this.elements.loader.classList.add('hidden');
            this.elements.appContainer.classList.remove('hidden');

            if (userInfo) {
                this._launchApp(userInfo);
            } else {
                this.showView('onboarding-view');
            }
        },

        async _launchApp(userInfo) {
            this.elements.welcomeMessage.textContent = `Welcome, ${userInfo.name}!`;
            this.elements.businessNameHeader.textContent = userInfo.businessName;

            // Hide all potential onboarding views
            this.elements.onboardingView.classList.remove('active-view');
            this.elements.cameraPermissionView.classList.remove('active-view');
            
            // Show the main application interface
            this.elements.mainApp.classList.remove('hidden');
            
            this.navigateTo('home-view');
            this.refreshDashboard();
            this.renderProducts();
        },

        async finishOnboarding() {
            const name = document.getElementById('user-name').value.trim();
            const businessName = document.getElementById('business-name').value.trim();
            if (!name || !businessName) {
                this.showToast("Please enter your name and business name.");
                return;
            }
            await DB.setUserInfo({ id: 'user', name, businessName });
            this.showView('camera-permission-view');
        },

        async requestCameraPermission() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                // Immediately stop the stream; we only wanted to trigger the permission prompt.
                stream.getTracks().forEach(track => track.stop());
                
                // Now that permission is granted, complete the onboarding by launching the app
                const userInfo = await DB.getUserInfo();
                this._launchApp(userInfo);

            } catch (error) {
                alert("Camera access is required to scan products. Please enable it in your browser settings.");
            }
        },
        
        showView(viewId) {
            this.elements.views.forEach(view => {
                view.classList.remove('active-view');
            });
            document.getElementById(viewId).classList.add('active-view');
        },
        
        navigateTo(viewId) {
            this.showView(viewId);
            this.elements.mainApp.classList.remove('hidden');
            this.elements.cameraView.classList.remove('active-view');

            this.elements.navButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === viewId);
            });
        },

        async startScan(mode, isRetake = false) {
            this.currentScanMode = mode;
            if (!isRetake) {
                this.elements.mainApp.classList.add('hidden');
                this.elements.cameraView.classList.add('active-view');
            }
            this.elements.cameraStatus.textContent = mode === 'add' ? 'Position product to add' : 'Scanning for product...';
            
            try {
                await Camera.start(
                    (imageData) => this.handleCapture(imageData),
                    (matchedProduct) => this.handleProductMatch(matchedProduct)
                );
                this.isCameraOn = true;
            } catch (error) {
                console.error("Failed to start camera:", error);
                alert("Could not start the camera. Please ensure you've granted permission.");
                this.stopScan();
            }
        },

        stopScan() {
            if (this.isCameraOn) {
                Camera.stop();
                this.isCameraOn = false;
            }
            this.elements.mainApp.classList.remove('hidden');
            this.elements.cameraView.classList.remove('active-view');
            // Default back to the home view after any cancellation
            this.navigateTo('home-view');
        },

        handleCapture(imageData) {
            this.capturedImageData = imageData;
            this.elements.capturedImagePreview.src = this.capturedImageData;
            
            if (this.currentScanMode === 'sell') {
                this.showToast("Product not found. Let's add it!");
                this.currentScanMode = 'add'; 
                this.showModal('product-details-modal');
            } else {
                this.showModal('confirm-capture-modal');
            }
        },

        handleProductMatch(product) {
            this.stopScan();
            this.prepareSellModal(product);
            this.showModal('sell-item-modal');
        },

        async saveProduct(event) {
            event.preventDefault();
            const product = {
                id: this.editingProductId || Date.now(),
                name: document.getElementById('product-name').value.trim(),
                price: parseFloat(document.getElementById('product-price').value),
                stock: parseInt(document.getElementById('product-stock').value),
                unit: document.getElementById('product-unit').value.trim(),
                imageData: this.capturedImageData,
            };

            if (!product.name || isNaN(product.price) || isNaN(product.stock) || !product.unit) {
                this.showToast("Please fill all fields correctly.");
                return;
            }

            await DB.saveProduct(product);
            this.showToast(this.editingProductId ? 'Product Updated!' : 'Product Added!');
            
            this.editingProductId = null;
            this.capturedImageData = null;
            document.getElementById('product-form').reset();
            this.hideModal('product-details-modal');
            this.stopScan(); 
            this.navigateTo('products-view');
            this.renderProducts();
        },
        
        async renderProducts() {
            const products = await DB.getProducts();
            const list = this.elements.productList;
            list.innerHTML = '';
            if (products.length === 0) {
                list.innerHTML = `<p class="empty-state" style="grid-column: 1 / -1;">No products yet. Tap the '+' button to add your first product.</p>`;
                return;
            }
            products.forEach(p => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${p.imageData}" alt="${p.name}" class="product-card-image">
                    <div class="product-card-info">
                        <h3>${p.name}</h3>
                        <p class="price">₦${p.price.toLocaleString()}</p>
                        <p class="stock">${p.stock} ${p.unit} left</p>
                    </div>
                    <div class="product-card-actions">
                        <button class="edit-product-btn" data-id="${p.id}">Edit</button>
                    </div>
                `;
                list.appendChild(card);
            });
            
            document.querySelectorAll('.edit-product-btn').forEach(btn => {
                btn.addEventListener('click', (e) => this.editProduct(e.currentTarget.dataset.id));
            });
        },

        async editProduct(id) {
            const product = await DB.getProduct(Number(id));
            if (!product) return;
            
            this.editingProductId = product.id;
            this.capturedImageData = product.imageData;
            
            this.elements.modalTitle.textContent = "Edit Product";
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-stock').value = product.stock;
            document.getElementById('product-unit').value = product.unit;

            this.showModal('product-details-modal');
        },

        prepareSellModal(product) {
            this.elements.confirmSellBtn.dataset.productId = product.id;
            this.elements.sellProductImage.src = product.imageData;
            this.elements.sellProductName.textContent = product.name;
            this.elements.sellQuantityInput.value = 1;
            this.elements.sellQuantityInput.max = product.stock;
            this.updateSellTotal();
        },
        
        async updateSellTotal() {
            const productId = this.elements.confirmSellBtn.dataset.productId;
            const product = await DB.getProduct(Number(productId));
            const quantity = parseInt(this.elements.sellQuantityInput.value) || 0;
            const total = (product.price * quantity).toLocaleString();
            this.elements.sellTotalPrice.textContent = `₦${total}`;
        },

        async processSale() {
            const productId = Number(this.elements.confirmSellBtn.dataset.productId);
            const quantitySold = parseInt(this.elements.sellQuantityInput.value);
            const product = await DB.getProduct(productId);

            if (quantitySold <= 0) {
                this.showToast("Quantity must be at least 1.");
                return;
            }
            if (quantitySold > product.stock) {
                this.showToast("Not enough stock!");
                return;
            }

            product.stock -= quantitySold;
            await DB.saveProduct(product);
            
            this.salesData.push({ name: product.name, quantity: quantitySold, total: product.price * quantitySold });

            this.hideModal('sell-item-modal');
            this.showToast("Sale recorded!");
            this.refreshDashboard();
            this.renderProducts();
            
            this.startScan('sell');
        },

        cancelSale() {
            this.hideModal('sell-item-modal');
            this.navigateTo('home-view');
        },
        
        refreshDashboard() {
            const totalSales = this.salesData.reduce((sum, sale) => sum + sale.total, 0);
            const itemsSold = this.salesData.reduce((sum, sale) => sum + sale.quantity, 0);

            this.elements.totalSalesEl.textContent = `₦${totalSales.toLocaleString()}`;
            this.elements.itemsSoldEl.textContent = itemsSold;

            const list = this.elements.recentSalesList;
            if (this.salesData.length === 0) {
                 list.innerHTML = `<p class="empty-state">No sales recorded yet.</p>`;
                 return;
            }
            list.innerHTML = this.salesData.slice(-5).reverse().map(sale => `
                <div class="sale-item">
                    <span class="sale-item-info">${sale.quantity}x ${sale.name}</span>
                    <span class="sale-item-price">+₦${sale.total.toLocaleString()}</span>
                </div>
            `).join('');
        },
        
        showModal(modalId) {
            this.elements.modalBackdrop.classList.remove('hidden');
            this.elements[modalId].classList.remove('hidden');
        },

        hideModal(modalId) {
            this.elements.modalBackdrop.classList.add('hidden');
            this.elements[modalId].classList.add('hidden');
        },

        showToast(message) {
            const toast = this.elements.toast;
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        },
        
        showCommunalBookingToast() {
            const toast = this.elements.toast;
            toast.innerHTML = "Incoming Purchase from Tolu! <strong>[View Items]</strong>";
            toast.classList.add('show');
        },
        
        hideToast() {
            this.elements.toast.classList.remove('show');
        },

        promptInstall() {
            if (this.deferredInstallPrompt) {
                this.deferredInstallPrompt.prompt();
                this.deferredInstallPrompt.userChoice.then(choiceResult => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    }
                    this.deferredInstallPrompt = null;
                });
                this.elements.installBtn.classList.add('hidden');
            }
        },

        registerServiceWorker() {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/serviceworker.js')
                    .then(registration => console.log('Service Worker registered with scope:', registration.scope))
                    .catch(error => console.log('Service Worker registration failed:', error));
            }
        },
    };

    App.init();
});