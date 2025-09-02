document.addEventListener('DOMContentLoaded', () => {
    const App = {
        // --- DOM ELEMENTS ---
        elements: {
            // ... (most elements are the same)
            backBtn: document.getElementById('back-btn'), // New back button
            welcomeName: document.getElementById('welcome-name'), // New home elements
            welcomeDate: document.getElementById('welcome-date'),
            // ... (rest of elements from previous version)
            loader: document.getElementById('loader'), loaderSpinner: document.querySelector('.spinner'), loaderCheck: document.getElementById('loader-check'), appContainer: document.getElementById('app-container'), views: document.querySelectorAll('.view'), mainContent: document.getElementById('main-content'), bottomNav: document.getElementById('bottom-nav'), navButtons: document.querySelectorAll('.nav-btn'), headerTitle: document.getElementById('header-title'), onboardingView: document.getElementById('onboarding-view'), startOnboardingBtn: document.getElementById('start-onboarding-btn'), userNameInput: document.getElementById('user-name'), businessNameInput: document.getElementById('business-name'), businessLocationInput: document.getElementById('business-location'), cameraPermissionView: document.getElementById('camera-permission-view'), grantCameraBtn: document.getElementById('grant-camera-btn'), homeView: document.getElementById('home-view'), totalSalesEl: document.getElementById('total-sales'), itemsSoldEl: document.getElementById('items-sold'), recentSalesList: document.getElementById('recent-sales-list'), productsView: document.getElementById('products-view'), productGrid: document.getElementById('product-grid'), addNewProductBtn: document.getElementById('add-new-product-btn'), cameraView: document.getElementById('camera-view'), cancelScanBtn: document.getElementById('cancel-scan-btn'), scanFeedback: document.getElementById('scan-feedback'), captureCountdown: document.getElementById('capture-countdown'), sellItemBtnMain: document.getElementById('sell-item-btn-main'), sellItemBtnText: document.getElementById('sell-item-btn-text'), modalContainer: document.getElementById('modal-container'), confirmPictureModal: document.getElementById('confirm-picture-modal'), capturedImagePreview: document.getElementById('captured-image-preview'), retakePictureBtn: document.getElementById('retake-picture-btn'), confirmPictureBtn: document.getElementById('confirm-picture-btn'), productFormModal: document.getElementById('product-form-modal'), productForm: document.getElementById('product-form'), productFormTitle: document.getElementById('product-form-title'), productIdInput: document.getElementById('product-id'), productNameInput: document.getElementById('product-name'), productPriceInput: document.getElementById('product-price'), productStockInput: document.getElementById('product-stock'), productUnitInput: document.getElementById('product-unit'), cancelProductFormBtn: document.getElementById('cancel-product-form-btn'), confirmSaleModal: document.getElementById('confirm-sale-modal'), saleProductImage: document.getElementById('sale-product-image'), saleProductName: document.getElementById('sale-product-name'), saleProductStock: document.getElementById('sale-product-stock'), saleQuantityInput: document.getElementById('sale-quantity'), saleTotalPrice: document.getElementById('sale-total-price'), cancelSaleBtn: document.getElementById('cancel-sale-btn'), confirmSaleBtn: document.getElementById('confirm-sale-btn'), installBtn: document.getElementById('add-to-homescreen-btn'),
        },

        // --- APP STATE ---
        state: {
            navigationHistory: [], // ✨ NEW: For back button functionality
            user: null,
            // ... (rest of state from previous version)
            currentView: 'home-view', cameraReady: false, cameraMode: null, capturedBlob: null, capturedEmbedding: null, editingProduct: null, sellingProduct: null, deferredInstallPrompt: null,
        },

        // --- INITIALIZATION ---
        async init() {
            this.showLoader();
            this.registerServiceWorker();
            this.setupEventListeners();

            try {
                await DB.init();
                this.state.user = await DB.getUser();

                if (!this.state.user) {
                    this.showView('onboarding-view');
                } else {
                    await this.loadMainApp();
                }
                
                this.loadCameraModelInBackground();
            } catch (error) {
                console.error("Critical initialization failed:", error);
                alert("App could not start due to a storage issue. Please ensure you're not in private browsing mode and have available space.");
            } finally {
                this.hideLoader();
            }
        },

        // --- EVENT LISTENERS ---
        setupEventListeners() {
            // ✨ NEW: Back button listener
            this.elements.backBtn.addEventListener('click', this.navigateBack.bind(this));
            
            // ... (all other event listeners are the same as the previous version)
            this.elements.startOnboardingBtn.addEventListener('click', this.handleOnboarding.bind(this)); this.elements.grantCameraBtn.addEventListener('click', this.handleCameraPermission.bind(this)); this.elements.navButtons.forEach(btn => btn.addEventListener('click', () => this.navigateTo(btn.dataset.view))); this.elements.sellItemBtnMain.addEventListener('click', this.startSellScan.bind(this)); this.elements.addNewProductBtn.addEventListener('click', this.startAddProduct.bind(this)); this.elements.productForm.addEventListener('submit', this.handleSaveProduct.bind(this)); this.elements.cancelProductFormBtn.addEventListener('click', () => this.hideModal()); this.elements.cancelScanBtn.addEventListener('click', this.cancelScan.bind(this)); this.elements.retakePictureBtn.addEventListener('click', this.handleRetakePicture.bind(this)); this.elements.confirmPictureBtn.addEventListener('click', this.handleConfirmPicture.bind(this)); this.elements.saleQuantityInput.addEventListener('input', this.updateSaleTotal.bind(this)); this.elements.cancelSaleBtn.addEventListener('click', () => { this.hideModal(); if (this.state.cameraMode === 'sell') this.startSellScan(true); }); this.elements.confirmSaleBtn.addEventListener('click', this.handleConfirmSale.bind(this)); window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this)); this.elements.installBtn.addEventListener('click', this.promptInstall.bind(this));
        },
        
        // --- NAVIGATION & VIEW MANAGEMENT ---
        // ✨ MODIFIED: Now handles navigation history and back button visibility
        navigateTo(viewId, isBackNavigation = false) {
            if (!isBackNavigation && viewId !== this.state.currentView) {
                this.state.navigationHistory.push(this.state.currentView);
            }

            this.showView(viewId);
            this.elements.navButtons.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === viewId);
            });

            // Update back button visibility
            if (viewId === 'home-view') {
                this.elements.backBtn.style.display = 'none';
                // Clear history when we land on home
                if (!isBackNavigation) this.state.navigationHistory = [];
            } else {
                this.elements.backBtn.style.display = 'block';
            }
        },
        
        // ✨ NEW: Function to handle back navigation
        navigateBack() {
            const previousView = this.state.navigationHistory.pop();
            if (previousView) {
                this.navigateTo(previousView, true);
            } else {
                this.navigateTo('home-view', true); // Fallback to home
            }
        },

        // ✨ MODIFIED: Now always returns to the home screen
        cancelScan() {
            Camera.stop();
            this.navigateTo('home-view');
        },
        
        async handleOnboarding(e) {
            e.preventDefault();
            const name = this.elements.userNameInput.value.trim();
            const business = this.elements.businessNameInput.value.trim();
            const location = this.elements.businessLocationInput.value;
            if (!name || !business || !location) {
                alert('Please fill in all fields.'); return;
            }
            this.state.user = { name, business, location };
            await DB.saveUser(this.state.user);
            this.showView('camera-permission-view');
        },

        // --- UI RENDERING ---
        // ✨ MODIFIED: Updates the new home screen elements
        async updateDashboard() {
            if (this.state.user) {
                this.elements.welcomeName.textContent = `Hello, ${this.state.user.name.split(' ')[0]}!`;
            }
            this.elements.welcomeDate.textContent = new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            const sales = await DB.getSalesToday();
            const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
            const itemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);

            this.elements.totalSalesEl.textContent = `₦${totalSales.toLocaleString()}`;
            this.elements.itemsSoldEl.textContent = itemsSold;

            this.renderRecentSales(sales);
        },

        // --- (All other functions from the previous version remain the same) ---
        // For brevity, I've omitted the unchanged code. Copy the full functions for the following from the previous version:
        // loadCameraModelInBackground, showLoader, hideLoader, loadMainApp, showView, hideModal, updateHeader, handleCameraPermission, startAddProduct, startSellScan, handlePictureTaken, handleRetakePicture, handleConfirmPicture, handleSaveProduct, handleEditProduct, handleProductFound, updateSaleTotal, handleConfirmSale, renderRecentSales, renderProducts, handleBeforeInstallPrompt, promptInstall, registerServiceWorker.
        loadCameraModelInBackground: async function() { try { this.elements.sellItemBtnText.textContent = 'Loading...'; await Camera.init(); this.state.cameraReady = true; this.elements.addNewProductBtn.classList.remove('disabled'); this.elements.sellItemBtnMain.classList.remove('disabled'); this.elements.sellItemBtnText.textContent = 'Sell Item'; console.log("Camera model ready."); } catch (error) { console.error("Failed to load camera model:", error); this.state.cameraReady = false; this.elements.sellItemBtnText.textContent = 'Offline'; } },
        showLoader: function() { this.elements.loader.style.display = 'flex'; this.elements.appContainer.style.display = 'none'; },
        hideLoader: function() { this.elements.loaderSpinner.style.display = 'none'; this.elements.loaderCheck.style.display = 'block'; setTimeout(() => { this.elements.loader.style.opacity = '0'; this.elements.appContainer.style.display = 'flex'; setTimeout(() => { this.elements.loader.style.display = 'none'; }, 500); }, 500); },
        loadMainApp: async function() { this.elements.mainContent.style.display = 'flex'; this.elements.bottomNav.style.display = 'flex'; this.showView('home-view'); await this.updateDashboard(); await this.renderProducts(); },
        showView: function(viewId) { this.elements.views.forEach(view => view.classList.remove('active')); const viewToShow = document.getElementById(viewId); if (viewToShow) { viewToShow.classList.add('active'); this.state.currentView = viewId; if (!['onboarding-view', 'camera-permission-view', 'camera-view'].includes(viewId)) this.updateHeader(viewId); } },
        hideModal: function() { this.elements.modalContainer.style.display = 'none'; this.elements.modalContainer.querySelectorAll('.modal-content').forEach(m => m.style.display = 'none'); },
        updateHeader: function(viewId) { const titles = { 'home-view': 'Home', 'products-view': 'My Products' }; this.elements.headerTitle.textContent = titles[viewId] || 'pika shot'; },
        handleCameraPermission: async function() { try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); stream.getTracks().forEach(track => track.stop()); await this.loadMainApp(); } catch (err) { console.error("Camera permission denied:", err); alert("Camera access is required. Please enable it in browser settings."); } },
        startAddProduct: function() { if (!this.state.cameraReady) { alert("Camera is not ready. Connect to the internet for initial setup."); return; } this.state.cameraMode = 'add'; this.elements.scanFeedback.textContent = 'Hold steady to capture'; this.showView('camera-view'); Camera.start(this.handlePictureTaken.bind(this), this.elements.captureCountdown); },
        startSellScan: async function(isRestart = false) { if (!this.state.cameraReady) { alert("Camera is not ready. Connect to the internet for initial setup."); return; } this.state.cameraMode = 'sell'; this.elements.scanFeedback.textContent = 'Scanning for product...'; this.elements.captureCountdown.textContent = ''; this.showView('camera-view'); if (!isRestart) { const scanBox = document.querySelector('.scan-box'); scanBox.style.borderColor = 'var(--secondary-color)'; setTimeout(() => { scanBox.style.borderColor = 'rgba(255, 255, 255, 0.8)'; }, 500); } try { const result = await Camera.startScan(this.handleProductFound.bind(this)); if (result && result.reason === 'notFound') { this.state.cameraMode = 'add'; this.handlePictureTaken(result.blob, result.embedding); } } catch (error) { console.error('Error during scanning:', error); this.cancelScan(); alert('Could not start scanning.'); } },
        handlePictureTaken: function(blob, embedding) { this.state.capturedBlob = blob; this.state.capturedEmbedding = embedding; this.elements.capturedImagePreview.src = URL.createObjectURL(blob); this.showView('confirm-picture-modal', true); },
        handleRetakePicture: function() { this.hideModal(); if (this.state.cameraMode === 'add') this.startAddProduct(); else this.startSellScan(); },
        handleConfirmPicture: function() { this.state.editingProduct = null; this.elements.productForm.reset(); this.elements.productFormTitle.textContent = 'Add New Product'; this.elements.productIdInput.value = ''; this.hideModal(); this.showView('product-form-modal', true); },
        handleSaveProduct: async function(e) { e.preventDefault(); const productData = { id: this.state.editingProduct ? this.state.editingProduct.id : Date.now(), name: this.elements.productNameInput.value.trim(), price: parseFloat(this.elements.productPriceInput.value), stock: parseInt(this.elements.productStockInput.value), unit: this.elements.productUnitInput.value, image: this.state.capturedBlob || this.state.editingProduct?.image, embedding: this.state.capturedEmbedding || this.state.editingProduct?.embedding, createdAt: this.state.editingProduct?.createdAt || new Date() }; if (!productData.name || isNaN(productData.price) || isNaN(productData.stock)) { alert('Please fill out all fields correctly.'); return; } await DB.saveProduct(productData); this.hideModal(); this.state.capturedBlob = null; this.state.capturedEmbedding = null; this.state.editingProduct = null; this.navigateTo('products-view'); await this.renderProducts(); },
        handleEditProduct: function(product) { this.state.editingProduct = product; this.elements.productFormTitle.textContent = 'Edit Product'; this.elements.productIdInput.value = product.id; this.elements.productNameInput.value = product.name; this.elements.productPriceInput.value = product.price; this.elements.productStockInput.value = product.stock; this.elements.productUnitInput.value = product.unit; this.showView('product-form-modal', true); },
        handleProductFound: function(product) { this.state.sellingProduct = product; this.elements.saleProductImage.src = URL.createObjectURL(product.image); this.elements.saleProductName.textContent = product.name; this.elements.saleProductStock.textContent = `Stock: ${product.stock} ${product.unit}`; this.elements.saleQuantityInput.value = 1; this.elements.saleQuantityInput.max = product.stock; this.updateSaleTotal(); this.showView('confirm-sale-modal', true); },
        updateSaleTotal: function() { const quantity = parseInt(this.elements.saleQuantityInput.value) || 0; const price = this.state.sellingProduct?.price || 0; const total = quantity * price; this.elements.saleTotalPrice.textContent = `₦${total.toLocaleString()}`; },
        handleConfirmSale: async function() { const quantity = parseInt(this.elements.saleQuantityInput.value); const product = this.state.sellingProduct; if (quantity <= 0 || !product || quantity > product.stock) { alert('Invalid quantity or product not available.'); return; } product.stock -= quantity; await DB.saveProduct(product); const sale = { id: Date.now(), productId: product.id, productName: product.name, quantity: quantity, price: product.price, total: quantity * product.price, timestamp: new Date(), image: product.image }; await DB.addSale(sale); this.hideModal(); await this.updateDashboard(); this.startSellScan(true); },
        renderRecentSales: function(sales) { this.elements.recentSalesList.innerHTML = ''; if (sales.length === 0) { this.elements.recentSalesList.innerHTML = '<p class="empty-state">No sales recorded yet today.</p>'; return; } sales.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5).forEach(sale => { const saleEl = document.createElement('div'); saleEl.className = 'sale-item'; const imageUrl = URL.createObjectURL(sale.image); saleEl.innerHTML = `<img src="${imageUrl}" alt="${sale.productName}"><div class="sale-info"><p>${sale.productName}</p><span>${sale.quantity} x ₦${sale.price.toLocaleString()}</span></div><p class="sale-price">₦${sale.total.toLocaleString()}</p>`; this.elements.recentSalesList.appendChild(saleEl); }); },
        renderProducts: async function() { const products = await DB.getAllProducts(); this.elements.productGrid.innerHTML = ''; if (products.length === 0) { this.elements.productGrid.innerHTML = '<p class="empty-state">No products added yet. Tap the "+" button to add your first product!</p>'; return; } products.forEach(product => { const card = document.createElement('div'); card.className = 'product-card'; const imageUrl = URL.createObjectURL(product.image); card.innerHTML = `<img src="${imageUrl}" alt="${product.name}"><div class="product-card-info"><h4>${product.name}</h4><p class="product-price">₦${product.price.toLocaleString()}</p><p class="product-stock">${product.stock} ${product.unit} left</p></div><div class="product-card-actions"><button class="btn btn-secondary edit-btn">Edit</button></div>`; card.querySelector('.edit-btn').addEventListener('click', () => this.handleEditProduct(product)); this.elements.productGrid.appendChild(card); }); },
        handleBeforeInstallPrompt: function(event) { event.preventDefault(); this.state.deferredInstallPrompt = event; this.elements.installBtn.style.display = 'block'; },
        promptInstall: function() { if (this.state.deferredInstallPrompt) { this.state.deferredInstallPrompt.prompt(); this.state.deferredInstallPrompt.userChoice.then(choiceResult => { this.state.deferredInstallPrompt = null; this.elements.installBtn.style.display = 'none'; }); } },
        registerServiceWorker: function() { if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/serviceworker.js').then(reg => console.log('SW registered.')).catch(err => console.error('SW registration failed:', err)); }); } },
    };

    App.init();
});