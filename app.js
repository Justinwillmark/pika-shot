document.addEventListener('DOMContentLoaded', () => {
    const App = {
        // --- DOM ELEMENTS ---
        elements: {
            appHeader: document.getElementById('app-header'),
            backBtn: document.getElementById('back-btn'),
            welcomeName: document.getElementById('welcome-name'),
            welcomeDate: document.getElementById('welcome-date'),
            loader: document.getElementById('loader'),
            loaderSpinner: document.querySelector('.spinner'),
            loaderCheck: document.getElementById('loader-check'),
            appContainer: document.getElementById('app-container'),
            views: document.querySelectorAll('.view'),
            mainContent: document.getElementById('main-content'),
            bottomNav: document.getElementById('bottom-nav'),
            navButtons: document.querySelectorAll('.nav-btn'),
            headerTitle: document.getElementById('header-title'),
            onboardingView: document.getElementById('onboarding-view'),
            startOnboardingBtn: document.getElementById('start-onboarding-btn'),
            userNameInput: document.getElementById('user-name'),
            businessNameInput: document.getElementById('business-name'),
            businessLocationInput: document.getElementById('business-location'),
            cameraPermissionView: document.getElementById('camera-permission-view'),
            grantCameraBtn: document.getElementById('grant-camera-btn'),
            homeView: document.getElementById('home-view'),
            totalSalesEl: document.getElementById('total-sales'),
            itemsSoldEl: document.getElementById('items-sold'),
            recentSalesList: document.getElementById('recent-sales-list'),
            seeAllContainer: document.getElementById('see-all-container'),
            seeAllSalesBtn: document.getElementById('see-all-sales-btn'),
            allSalesView: document.getElementById('all-sales-view'),
            allSalesList: document.getElementById('all-sales-list'),
            productsView: document.getElementById('products-view'),
            productSkuCount: document.getElementById('product-sku-count'),
            productGrid: document.getElementById('product-grid'),
            productSearchContainer: document.getElementById('product-search-container'),
            productSearchInput: document.getElementById('product-search-input'),
            addNewProductBtn: document.getElementById('add-new-product-btn'),
            cameraView: document.getElementById('camera-view'),
            cancelScanBtn: document.getElementById('cancel-scan-btn'),
            scanFeedback: document.getElementById('scan-feedback'),
            captureCountdown: document.getElementById('capture-countdown'),
            sellItemBtnMain: document.getElementById('sell-item-btn-main'),
            sellItemBtnText: document.getElementById('sell-item-btn-text'),
            modalContainer: document.getElementById('modal-container'),
            confirmPictureModal: document.getElementById('confirm-picture-modal'),
            capturedImagePreview: document.getElementById('captured-image-preview'),
            cancelPictureBtn: document.getElementById('cancel-picture-btn'),
            retakePictureBtn: document.getElementById('retake-picture-btn'),
            confirmPictureBtn: document.getElementById('confirm-picture-btn'),
            productFormModal: document.getElementById('product-form-modal'),
            productSourceInfo: document.getElementById('product-source-info'),
            productBarcodeDisplay: document.getElementById('product-barcode-display'),
            deleteProductBtn: document.getElementById('delete-product-btn'),
            productForm: document.getElementById('product-form'),
            productFormTitle: document.getElementById('product-form-title'),
            productIdInput: document.getElementById('product-id'),
            changePictureBtn: document.getElementById('change-picture-btn'),
            productNameInput: document.getElementById('product-name'),
            productPriceInput: document.getElementById('product-price'),
            productStockInput: document.getElementById('product-stock'),
            productUnitInput: document.getElementById('product-unit'),
            cancelProductFormBtn: document.getElementById('cancel-product-form-btn'),
            confirmSaleModal: document.getElementById('confirm-sale-modal'),
            saleProductImage: document.getElementById('sale-product-image'),
            saleProductName: document.getElementById('sale-product-name'),
            saleProductStock: document.getElementById('sale-product-stock'),
            saleQuantityInput: document.getElementById('sale-quantity'),
            saleTotalPrice: document.getElementById('sale-total-price'),
            cancelSaleBtn: document.getElementById('cancel-sale-btn'),
            confirmSaleBtn: document.getElementById('confirm-sale-btn'),
            entrySaleBtn: document.getElementById('entry-sale-btn'),
            installBtn: document.getElementById('add-to-homescreen-btn'),
            receiptActions: document.getElementById('receipt-actions'),
            generateReceiptBtn: document.getElementById('generate-receipt-btn'),
            cancelSelectionBtn: document.getElementById('cancel-selection-btn'),
            selectionModeHint: document.getElementById('selection-mode-hint'),
            receiptModal: document.getElementById('receipt-modal'),
            receiptContent: document.getElementById('receipt-content'),
            shareReceiptBtn: document.getElementById('share-receipt-btn'),
            closeReceiptBtn: document.getElementById('close-receipt-btn'),
            shareLogBtn: document.getElementById('share-log-btn'),
            qrCodeModal: document.getElementById('qr-code-modal'),
            qrCanvas: document.getElementById('qr-canvas'),
            closeQrBtn: document.getElementById('close-qr-btn'),
            entryChoiceModal: document.getElementById('entry-choice-modal'),
            cancelEntryChoiceBtn: document.getElementById('cancel-entry-choice-btn'),
            manualEntryBtn: document.getElementById('manual-entry-btn'),
            selectFromProductsBtn: document.getElementById('select-from-products-btn'),
            manualSaleModal: document.getElementById('manual-sale-modal'),
            manualSaleForm: document.getElementById('manual-sale-form'),
            cancelManualSaleBtn: document.getElementById('cancel-manual-sale-btn'),
            manualProductName: document.getElementById('manual-product-name'),
            manualProductPrice: document.getElementById('manual-product-price'),
            manualSaleQuantity: document.getElementById('manual-sale-quantity'),
            manualProductUnit: document.getElementById('manual-product-unit'),
            confirmLogModal: document.getElementById('confirm-log-modal'),
            confirmLogTitle: document.getElementById('confirm-log-title'),
            confirmLogContent: document.getElementById('confirm-log-content'),
            rejectLogBtn: document.getElementById('reject-log-btn'),
            acceptLogBtn: document.getElementById('accept-log-btn'),
        },

        // --- APP STATE ---
        state: {
            navigationHistory: [],
            user: null,
            currentView: 'home-view',
            cameraReady: false,
            capturedBlob: null,
            capturedEmbedding: null,
            capturedBarcode: null,
            editingProduct: null,
            isChangingPicture: false, 
            productSelectionMode: false, 
            sellingProduct: null,
            scannedLogData: null,
            deferredInstallPrompt: null,
            isSelectionMode: false,
            selectedSales: new Set(),
            longPressTimer: null,
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
            this.elements.backBtn.addEventListener('click', this.navigateBack.bind(this));
            this.elements.startOnboardingBtn.addEventListener('click', this.handleOnboarding.bind(this));
            this.elements.grantCameraBtn.addEventListener('click', this.handleCameraPermission.bind(this));
            this.elements.navButtons.forEach(btn => btn.addEventListener('click', () => this.navigateTo(btn.dataset.view)));
            this.elements.sellItemBtnMain.addEventListener('click', this.startSellScan.bind(this));
            this.elements.addNewProductBtn.addEventListener('click', this.startAddProduct.bind(this));
            this.elements.productForm.addEventListener('submit', this.handleSaveProduct.bind(this));
            this.elements.deleteProductBtn.addEventListener('click', this.handleDeleteProduct.bind(this));
            this.elements.cancelProductFormBtn.addEventListener('click', () => this.hideModal());
            this.elements.cancelScanBtn.addEventListener('click', this.cancelScan.bind(this));
            this.elements.retakePictureBtn.addEventListener('click', this.handleRetakePicture.bind(this));
            this.elements.confirmPictureBtn.addEventListener('click', this.handleConfirmPicture.bind(this));
            this.elements.changePictureBtn.addEventListener('click', this.handleChangePicture.bind(this));
            this.elements.cancelPictureBtn.addEventListener('click', this.cancelScan.bind(this));
            this.elements.saleQuantityInput.addEventListener('input', this.updateSaleTotal.bind(this));
            this.elements.cancelSaleBtn.addEventListener('click', this.cancelScan.bind(this));
            this.elements.confirmSaleBtn.addEventListener('click', this.handleConfirmSale.bind(this));
            this.elements.entrySaleBtn.addEventListener('click', () => { this.hideModal(); this.showModal('entry-choice-modal'); });
            window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this));
            this.elements.installBtn.addEventListener('click', this.promptInstall.bind(this));
            this.elements.generateReceiptBtn.addEventListener('click', this.generateReceipt.bind(this));
            this.elements.seeAllSalesBtn.addEventListener('click', () => this.navigateTo('all-sales-view'));
            this.elements.cancelSelectionBtn.addEventListener('click', this.exitSelectionMode.bind(this));
            this.elements.closeReceiptBtn.addEventListener('click', () => this.hideModal());
            this.elements.shareReceiptBtn.addEventListener('click', this.shareReceipt.bind(this));
            this.elements.shareLogBtn.addEventListener('click', this.generateQrLog.bind(this));
            this.elements.closeQrBtn.addEventListener('click', () => this.hideModal());
            this.elements.productSearchInput.addEventListener('input', (e) => this.renderProducts(e.target.value));
            this.elements.cancelEntryChoiceBtn.addEventListener('click', () => this.hideModal());
            this.elements.manualEntryBtn.addEventListener('click', () => { this.hideModal(); this.elements.manualSaleForm.reset(); this.showModal('manual-sale-modal'); });
            this.elements.cancelManualSaleBtn.addEventListener('click', () => this.hideModal());
            this.elements.manualSaleForm.addEventListener('submit', this.handleManualSale.bind(this));
            this.elements.selectFromProductsBtn.addEventListener('click', this.showProductSelection.bind(this));
            this.elements.rejectLogBtn.addEventListener('click', () => { this.hideModal(); this.state.scannedLogData = null; });
            this.elements.acceptLogBtn.addEventListener('click', this.acceptPikaLog.bind(this));
        },
        
        // --- UI & NAVIGATION ---
        showLoader() { this.elements.loader.style.display = 'flex'; this.elements.appContainer.style.display = 'none'; },
        hideLoader() { this.elements.loaderSpinner.style.display = 'none'; this.elements.loaderCheck.style.display = 'block'; setTimeout(() => { this.elements.loader.style.opacity = '0'; this.elements.appContainer.style.display = 'flex'; setTimeout(() => { this.elements.loader.style.display = 'none'; }, 500); }, 500); },
        showView(viewId) { this.elements.views.forEach(view => view.classList.remove('active')); const viewToShow = document.getElementById(viewId); if (viewToShow) { viewToShow.classList.add('active'); this.state.currentView = viewId; if (!['onboarding-view', 'camera-permission-view', 'camera-view'].includes(viewId)) { this.updateHeader(viewId); } } },
        showModal(modalId) { this.elements.modalContainer.style.display = 'flex'; this.elements.modalContainer.querySelectorAll('.modal-content').forEach(m => m.style.display = 'none'); const modalToShow = document.getElementById(modalId); if (modalToShow) { modalToShow.style.display = 'block'; } },
        hideModal() { this.elements.modalContainer.style.display = 'none'; this.elements.modalContainer.querySelectorAll('.modal-content').forEach(m => m.style.display = 'none'); },
        navigateTo(viewId, isBackNavigation = false) {
            if (!isBackNavigation && viewId !== this.state.currentView) { this.state.navigationHistory.push(this.state.currentView); }
            
            if (this.state.productSelectionMode && viewId !== 'products-view') {
                this.state.productSelectionMode = false;
            }

            if (viewId === 'all-sales-view') {
                this.renderAllSales();
            }

            this.showView(viewId);
            this.elements.navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewId));
            
            if (viewId === 'home-view') {
                this.elements.backBtn.style.display = 'none';
                if (!isBackNavigation) this.state.navigationHistory = [];
            } else {
                this.elements.backBtn.style.display = 'block';
            }
            
            this.elements.productsView.classList.toggle('selection-mode', this.state.productSelectionMode);
            this.elements.addNewProductBtn.style.display = this.state.productSelectionMode ? 'none' : 'flex';
            
            this.exitSelectionMode();
        },
        navigateBack() {
            this.state.productSelectionMode = false;
            const previousView = this.state.navigationHistory.pop();
            this.navigateTo(previousView || 'home-view', true);
        },
        updateHeader(viewId) {
            let title = 'pika shot';
            if (this.state.productSelectionMode && viewId === 'products-view') {
                title = 'Select a Product';
            } else {
                const titles = { 'home-view': 'Home', 'products-view': 'My Products', 'all-sales-view': 'All Sales' };
                title = titles[viewId] || 'pika shot';
            }
            this.elements.headerTitle.textContent = title;
        },

        async updateDashboard() {
            if (this.state.user) {
                this.elements.welcomeName.textContent = `Hello, ${this.state.user.name.split(' ')[0]}!`;
            }
            const date = new Date();
            this.elements.welcomeDate.textContent = date.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            const sales = await DB.getSalesToday();
            const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
            const itemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
            this.elements.totalSalesEl.textContent = `₦${totalSales.toLocaleString()}`;
            this.elements.itemsSoldEl.textContent = itemsSold;
            
            this.elements.seeAllContainer.style.display = sales.length > 6 ? 'block' : 'none';
            // Only show the "Long press" hint if there are sales
            this.elements.selectionModeHint.style.display = sales.length > 0 ? 'block' : 'none';

            this.renderSalesList(sales, this.elements.recentSalesList, 6);
        },
        
        renderSalesList(sales, targetElement, limit) {
            targetElement.innerHTML = '';
            const sortedSales = sales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const salesToRender = limit ? sortedSales.slice(0, limit) : sortedSales;

            if (salesToRender.length === 0) {
                targetElement.innerHTML = `<p class="empty-state">No sales recorded yet.</p>`;
                return;
            }
            
            salesToRender.forEach(sale => {
                const saleEl = document.createElement('div');
                saleEl.className = 'sale-item';
                saleEl.dataset.saleId = sale.id;
                const imageUrl = sale.image ? URL.createObjectURL(sale.image) : 'icons/icon-192.png';
                saleEl.innerHTML = `<img src="${imageUrl}" alt="${sale.productName}"><div class="sale-info"><p>${sale.productName}</p><span>${sale.quantity} x ₦${sale.price.toLocaleString()}</span></div><p class="sale-price">₦${sale.total.toLocaleString()}</p>`;
                
                this.addSaleItemEventListeners(saleEl, sale);
                targetElement.appendChild(saleEl);
            });
        },
        
        async renderAllSales() {
            const allSales = await DB.getAllSales();
            const sortedSales = allSales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            this.elements.allSalesList.innerHTML = '';

            if (sortedSales.length === 0) {
                this.elements.allSalesList.innerHTML = `<p class="empty-state">No sales recorded yet.</p>`;
                return;
            }

            const groupedSales = this.groupSalesByDate(sortedSales);
            for (const groupTitle in groupedSales) {
                const groupContainer = document.createElement('div');
                groupContainer.className = 'sales-group';
                
                const dailyTotal = groupedSales[groupTitle].reduce((sum, sale) => sum + sale.total, 0);

                const groupHeader = document.createElement('div');
                groupHeader.className = 'sales-group-header';
                groupHeader.innerHTML = `<h3>${groupTitle}</h3><p class="sales-group-total">₦${dailyTotal.toLocaleString()}</p>`;
                groupContainer.appendChild(groupHeader);

                groupedSales[groupTitle].forEach(sale => {
                    const saleEl = document.createElement('div');
                    saleEl.className = 'sale-item';
                    saleEl.dataset.saleId = sale.id;
                    const imageUrl = sale.image ? URL.createObjectURL(sale.image) : 'icons/icon-192.png';
                    saleEl.innerHTML = `<img src="${imageUrl}" alt="${sale.productName}"><div class="sale-info"><p>${sale.productName}</p><span>${sale.quantity} x ₦${sale.price.toLocaleString()}</span></div><p class="sale-price">₦${sale.total.toLocaleString()}</p>`;
                    this.addSaleItemEventListeners(saleEl, sale);
                    groupContainer.appendChild(saleEl);
                });
                this.elements.allSalesList.appendChild(groupContainer);
            }
        },

        groupSalesByDate(sales) {
            const groups = {};
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());

            sales.forEach(sale => {
                const saleDate = new Date(sale.timestamp);
                saleDate.setHours(0, 0, 0, 0);
                
                let groupTitle;
                if (saleDate.getTime() === today.getTime()) {
                    groupTitle = 'Today';
                } else if (saleDate.getTime() === yesterday.getTime()) {
                    groupTitle = 'Yesterday';
                } else if (saleDate >= startOfWeek) {
                    groupTitle = 'This Week';
                } else {
                    groupTitle = saleDate.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
                }

                if (!groups[groupTitle]) {
                    groups[groupTitle] = [];
                }
                groups[groupTitle].push(sale);
            });
            return groups;
        },

        async renderProducts(filter = '') {
            const allProducts = await DB.getAllProducts();
            this.elements.productGrid.innerHTML = '';
            this.elements.productSkuCount.textContent = `${allProducts.length} SKUs`;

            const products = filter ? allProducts.filter(p => p.name.toLowerCase().includes(filter.toLowerCase())) : allProducts;
            
            if (allProducts.length > 0) {
                this.elements.productSearchContainer.style.display = 'block';
                this.elements.productSkuCount.style.display = 'block';
            } else {
                this.elements.productSearchContainer.style.display = 'none';
                this.elements.productSkuCount.style.display = 'none';
            }

            if (products.length === 0) {
                if (filter) {
                    this.elements.productGrid.innerHTML = '<p class="empty-state">No products match your search.</p>';
                } else {
                    this.elements.productGrid.innerHTML = '<p class="empty-state">No products added yet. Tap the "+" button to add your first product!</p>';
                }
                return;
            }

            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                const imageUrl = product.image ? URL.createObjectURL(product.image) : 'icons/icon-192.png';
                let outOfStockBadge = product.stock <= 0 ? '<div class="out-of-stock-badge">Out of Stock</div>' : '';
                
                const pencilIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
                card.innerHTML = `
                    ${outOfStockBadge}
                    <button class="edit-btn-icon">${pencilIconSVG}</button>
                    <div class="product-card-image-wrapper">
                        <img src="${imageUrl}" alt="${product.name}">
                    </div>
                    <div class="product-card-info">
                        <h4>${product.name}</h4>
                        <p class="product-price">₦${product.price.toLocaleString()}</p>
                        <p class="product-stock">${product.stock > 0 ? `${product.stock} ${product.unit} left` : ''}</p>
                    </div>`;
                
                const editBtn = card.querySelector('.edit-btn-icon');
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleEditProduct(product)
                });

                card.addEventListener('click', () => {
                    if (this.state.productSelectionMode) {
                        this.state.productSelectionMode = false;
                        this.handleProductFound(product);
                        this.elements.productsView.classList.remove('selection-mode');
                        this.elements.addNewProductBtn.style.display = 'flex';
                    }
                });

                this.elements.productGrid.appendChild(card);
            });
        },

        // --- CORE APP LOGIC ---
        async loadMainApp() { this.elements.appHeader.style.display = 'flex'; this.elements.mainContent.style.display = 'block'; this.elements.bottomNav.style.display = 'flex'; this.navigateTo('home-view'); await this.updateDashboard(); await this.renderProducts(); },
        async handleOnboarding(e) { e.preventDefault(); const name = this.elements.userNameInput.value.trim(); const business = this.elements.businessNameInput.value.trim(); const location = this.elements.businessLocationInput.value; if (!name || !business || !location) { alert('Please fill in all fields.'); return; } this.state.user = { name, business, location }; await DB.saveUser(this.state.user); this.showView('camera-permission-view'); },
        async handleCameraPermission() { try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); stream.getTracks().forEach(track => track.stop()); await this.loadMainApp(); } catch (err) { console.error("Camera permission denied:", err); alert("Camera access is required. Please enable it in browser settings."); } },
        async loadCameraModelInBackground() { 
            try { 
                this.elements.sellItemBtnText.textContent = 'Loading...'; 
                this.elements.sellItemBtnMain.classList.add('loading');
                await Camera.init(); 
                this.state.cameraReady = true; 
                this.elements.addNewProductBtn.classList.remove('disabled'); 
                this.elements.sellItemBtnMain.classList.remove('disabled'); 
                this.elements.sellItemBtnText.textContent = 'Sell Item'; 
                console.log("Camera model ready."); 
            } catch (error) { 
                console.error("Failed to load camera model:", error); 
                this.state.cameraReady = false; 
                this.elements.sellItemBtnText.textContent = 'Offline'; 
            } finally {
                this.elements.sellItemBtnMain.classList.remove('loading');
            }
        },
        
        // --- ADD PRODUCT FLOW ---
        startAddProduct() { 
            if (!this.state.cameraReady) { alert("Camera is not ready yet. Please wait or check your connection."); return; }
            if (!Camera.barcodeDetector && !Camera.model) { alert("Scanning is not available. Your browser might not be supported."); return; }
            this.elements.scanFeedback.textContent = 'Scan barcode or product';
            this.elements.captureCountdown.textContent = '';
            this.showView('camera-view');
            Camera.startAddScan(this.handleAddProductScanResult.bind(this), this.elements.captureCountdown);
        },
        
        handleAddProductScanResult(result) {
            switch (result.type) {
                case 'barcode':
                    this.state.capturedBarcode = result.data;
                    this.state.capturedBlob = null;
                    this.state.capturedEmbedding = null;
                    this.state.editingProduct = null;
                    this._openProductForm({ source: 'barcode' });
                    break;
                case 'capture':
                    this.state.capturedBlob = result.blob;
                    this.state.capturedEmbedding = result.embedding;
                    this.elements.capturedImagePreview.src = URL.createObjectURL(result.blob);
                    this.showModal('confirm-picture-modal');
                    break;
                case 'qrlog':
                    this.handlePikaLogScanned(result.data);
                    break;
            }
        },

        // --- SELL ITEM FLOW ---
        startSellScan() {
            if (!this.state.cameraReady) { alert("Camera is not ready yet. Please wait or check your connection."); return; }
             if (!Camera.barcodeDetector && !Camera.model) { alert("Scanning is not available. Your browser might not be supported."); return; }
            this.elements.scanFeedback.textContent = 'Scanning for product...';
            this.elements.captureCountdown.textContent = '';
            this.showView('camera-view');
            Camera.startSellScan(
                this.handleProductFound.bind(this),
                () => { // onNotFound callback
                    alert('Product not found in your inventory.');
                    this.navigateBack();
                },
                this.elements.captureCountdown
            );
        },

        cancelScan() { Camera.stop(); this.hideModal(); this.navigateBack(); },
        handleRetakePicture() { this.hideModal(); this.startAddProduct(); },
        
        handleConfirmPicture() {
            this.state.capturedBarcode = null;
            if (this.state.isChangingPicture) {
                this.state.isChangingPicture = false;
                this.hideModal();
                this.showModal('product-form-modal'); // Re-show form with new picture data
            } else {
                this.state.editingProduct = null;
                this._openProductForm({ source: 'photo' });
            }
        },
        
        _openProductForm(options = {}) {
            this.elements.productForm.reset();
            this.elements.productFormTitle.textContent = 'Add New Product';
            this.elements.deleteProductBtn.style.display = 'none';
            this.elements.changePictureBtn.style.display = 'none'; // Hide by default
            this.elements.productIdInput.value = '';
            this.elements.productBarcodeDisplay.style.display = 'none';
            
            if (options.source === 'barcode') {
                this.elements.productSourceInfo.textContent = 'Added via barcode. No photo.';
                this.elements.productSourceInfo.style.display = 'block';
            } else if (options.source === 'photo') {
                this.elements.productSourceInfo.textContent = 'Added via photo. No barcode.';
                this.elements.productSourceInfo.style.display = 'block';
            } else {
                 this.elements.productSourceInfo.style.display = 'none';
            }
            
            this.hideModal(); // Hide any other open modals
            this.showModal('product-form-modal');
        },

        async handleSaveProduct(e) { 
            e.preventDefault(); 
            const isEditing = !!this.state.editingProduct;
            let source = isEditing ? this.state.editingProduct.source : (this.state.capturedBarcode ? 'barcode' : 'photo');
            
            // Handle "Change Picture" case for a barcode-only product
            if (isEditing && this.state.editingProduct.barcode && this.state.capturedBlob) {
                source = 'hybrid';
            }

            const productData = { 
                id: isEditing ? this.state.editingProduct.id : Date.now(), 
                name: this.elements.productNameInput.value.trim(), 
                price: parseFloat(this.elements.productPriceInput.value), 
                stock: parseInt(this.elements.productStockInput.value), 
                unit: this.elements.productUnitInput.value, 
                image: this.state.capturedBlob || (isEditing ? this.state.editingProduct.image : null), 
                embedding: this.state.capturedEmbedding || (isEditing ? this.state.editingProduct.embedding : null),
                barcode: this.state.capturedBarcode || (isEditing ? this.state.editingProduct.barcode : null),
                source: source,
                createdAt: isEditing ? this.state.editingProduct.createdAt : new Date() 
            }; 

            if (!productData.name || isNaN(productData.price) || isNaN(productData.stock)) { 
                alert('Please fill out all fields correctly.'); return; 
            } 
            await DB.saveProduct(productData); 
            
            this.hideModal(); 
            this.state.capturedBlob = null; 
            this.state.capturedEmbedding = null; 
            this.state.capturedBarcode = null;
            this.state.editingProduct = null; 
            
            this.navigateTo('products-view'); 
            await this.renderProducts(); 
        },

        handleEditProduct(product) { 
            this.state.editingProduct = product; 
            this.elements.productFormTitle.textContent = 'Edit Product'; 
            this.elements.deleteProductBtn.style.display = 'flex'; 
            this.elements.changePictureBtn.style.display = 'block';
            this.elements.productIdInput.value = product.id; 
            this.elements.productNameInput.value = product.name; 
            this.elements.productPriceInput.value = product.price; 
            this.elements.productStockInput.value = product.stock; 
            this.elements.productUnitInput.value = product.unit; 
            
            // Set source info and barcode text
            if (product.source === 'hybrid' || (product.barcode && product.image)) {
                this.elements.productSourceInfo.textContent = 'Barcode and photo active.';
            } else if (product.source === 'barcode' || product.barcode) {
                this.elements.productSourceInfo.textContent = 'Added via barcode. No photo.';
            } else {
                this.elements.productSourceInfo.textContent = 'Added via photo. No barcode.';
            }
            this.elements.productSourceInfo.style.display = 'block';

            if (product.barcode) {
                this.elements.productBarcodeDisplay.textContent = product.barcode;
                this.elements.productBarcodeDisplay.style.display = 'block';
            } else {
                this.elements.productBarcodeDisplay.style.display = 'none';
            }

            this.showModal('product-form-modal'); 
        },

        async handleDeleteProduct() {
            if (!this.state.editingProduct) return;
            const confirmation = confirm(`Are you sure you want to permanently delete "${this.state.editingProduct.name}"? This action cannot be undone.`);
            if (confirmation) {
                await DB.deleteProduct(this.state.editingProduct.id);
                this.hideModal();
                this.state.editingProduct = null;
                await this.renderProducts();
                this.navigateTo('products-view');
                alert('Product deleted successfully.');
            }
        },
        handleChangePicture() { this.state.isChangingPicture = true; this.hideModal(); this.startAddProduct(); },
        handleProductFound(product) { this.state.sellingProduct = product; this.elements.saleProductImage.src = product.image ? URL.createObjectURL(product.image) : 'icons/icon-192.png'; this.elements.saleProductName.textContent = product.name; this.elements.saleProductStock.textContent = `Stock: ${product.stock} ${product.unit}`; this.elements.saleQuantityInput.value = 1; this.elements.saleQuantityInput.max = product.stock; this.updateSaleTotal(); this.showModal('confirm-sale-modal'); },
        updateSaleTotal() { const quantity = parseInt(this.elements.saleQuantityInput.value) || 0; const price = this.state.sellingProduct?.price || 0; const total = quantity * price; this.elements.saleTotalPrice.textContent = `₦${total.toLocaleString()}`; },
        async _processSale() { const quantity = parseInt(this.elements.saleQuantityInput.value); const product = this.state.sellingProduct; if (quantity <= 0 || !product || quantity > product.stock) { alert('Invalid quantity or product not available.'); return false; } product.stock -= quantity; await DB.saveProduct(product); const sale = { id: Date.now(), productId: product.id, productName: product.name, quantity: quantity, price: product.price, total: quantity * product.price, timestamp: new Date(), image: product.image }; await DB.addSale(sale); return true; },
        async handleConfirmSale() { const success = await this._processSale(); if (success) { this.hideModal(); await this.updateDashboard(); await this.renderProducts(); this.navigateBack(); } },
        
        async handleManualSale(e) {
            e.preventDefault();
            const name = this.elements.manualProductName.value.trim();
            const price = parseFloat(this.elements.manualProductPrice.value);
            const quantity = parseInt(this.elements.manualSaleQuantity.value);
            const unit = this.elements.manualProductUnit.value;
            if (!name || isNaN(price) || isNaN(quantity) || quantity <= 0) {
                alert('Please fill in all fields correctly.'); return;
            }
            
            const allProducts = await DB.getAllProducts();
            let productToSell = allProducts.find(p => p.name.toLowerCase() === name.toLowerCase());
            if (productToSell) {
                if (productToSell.stock < quantity) {
                    alert(`Not enough stock for ${name}. Only ${productToSell.stock} available.`);
                    return;
                }
                productToSell.stock -= quantity;
            } else {
                productToSell = { id: Date.now(), name, price, stock: 0, unit, image: null, embedding: null, barcode: null, source: 'manual', createdAt: new Date() };
                alert(`${name} is a new item and will be added to your products list with 0 stock.`);
            }

            await DB.saveProduct(productToSell);
            const sale = { id: Date.now() + 1, productId: productToSell.id, productName: name, quantity, price, total: price * quantity, timestamp: new Date(), image: productToSell.image };
            await DB.addSale(sale);
            this.hideModal();
            await this.updateDashboard();
            await this.renderProducts();
            this.navigateTo('home-view');
        },
        async showProductSelection() {
            this.hideModal();
            this.state.productSelectionMode = true;
            this.navigateTo('products-view');
        },

        // --- RECEIPT & QR LOGIC ---
        addSaleItemEventListeners(element, sale) { const pressDuration = 500; const onTouchStart = () => { this.state.longPressTimer = setTimeout(() => this.enterSelectionMode(element, sale), pressDuration); }; const onTouchEnd = () => clearTimeout(this.state.longPressTimer); element.addEventListener('mousedown', onTouchStart); element.addEventListener('mouseup', onTouchEnd); element.addEventListener('mouseleave', onTouchEnd); element.addEventListener('touchstart', onTouchStart); element.addEventListener('touchend', onTouchEnd); element.addEventListener('click', () => { if(this.state.isSelectionMode) this.toggleSaleSelection(element, sale); }); },
        enterSelectionMode(element, sale) {
            this.state.isSelectionMode = true;
            document.querySelectorAll('.sale-item').forEach(el => el.classList.add('selectable'));
            this.elements.receiptActions.classList.add('visible');
            this.elements.selectionModeHint.textContent = 'Tap to select more items';
            this.toggleSaleSelection(element, sale);
        },
        exitSelectionMode() {
            if (!this.state.isSelectionMode) return;
            this.state.isSelectionMode = false;
            this.state.selectedSales.clear();
            document.querySelectorAll('.sale-item').forEach(el => { el.classList.remove('selectable'); el.classList.remove('selected'); });
            this.elements.receiptActions.classList.remove('visible');
             // Only show hint if there are sales today
            if (this.elements.recentSalesList.children.length > 0 && this.elements.recentSalesList.children[0].className !== 'empty-state') {
                this.elements.selectionModeHint.textContent = 'Long-press to select';
            }
        },
        toggleSaleSelection(element, sale) { if (this.state.selectedSales.has(sale.id)) { this.state.selectedSales.delete(sale.id); element.classList.remove('selected'); } else { this.state.selectedSales.add(sale.id); element.classList.add('selected'); } this.elements.generateReceiptBtn.disabled = this.state.selectedSales.size === 0; },
        async generateReceipt() {
            const allSales = await DB.getAllSales();
            const selectedSaleObjects = allSales.filter(s => this.state.selectedSales.has(s.id));
            if (selectedSaleObjects.length === 0) return;
            const receiptId = `PS-${Date.now().toString().slice(-6)}`;
            const now = new Date();
            let totalAmount = 0;
            let itemsHtml = '';
            selectedSaleObjects.forEach(sale => {
                totalAmount += sale.total;
                itemsHtml += `<tr><td>${sale.productName}</td><td class="col-qty">${sale.quantity}</td><td class="col-price">&#8358;${sale.price.toLocaleString()}</td><td class="col-total">&#8358;${sale.total.toLocaleString()}</td></tr>`;
            });
            const receiptHtml = `<div class="receipt-header"><h3>${this.state.user.business}</h3><p>${this.state.user.location}</p><p><strong>Receipt ID:</strong> ${receiptId}</p></div><div class="receipt-items"><table><thead><tr><th>Item</th><th class="col-qty">Qty</th><th class="col-price">Price</th><th class="col-total">Total</th></tr></thead><tbody>${itemsHtml}</tbody></table></div><div class="receipt-total"><div class="total-row"><span>TOTAL</span><span>&#8358;${totalAmount.toLocaleString()}</span></div></div><div class="receipt-footer"><p>Thank you for your patronage!</p><p>${now.toLocaleDateString('en-NG')} ${now.toLocaleTimeString('en-NG')}</p></div>`;
            this.elements.receiptContent.innerHTML = receiptHtml;
            this.showModal('receipt-modal');
        },
        async shareReceipt() { const receiptElement = this.elements.receiptContent; try { const canvas = await html2canvas(receiptElement, { scale: 2 }); canvas.toBlob(async (blob) => { if (navigator.share && blob) { try { await navigator.share({ files: [new File([blob], 'pika-shot-receipt.png', { type: 'image/png' })], title: 'Your Receipt', text: 'Here is your receipt from ' + this.state.user.business, }); } catch (error) { console.error('Error sharing:', error); } } else { alert('Sharing is not supported on this browser, or there was an error creating the image.'); } }, 'image/png'); } catch (error) { console.error('Error generating receipt image:', error); alert('Could not generate receipt image.'); } },
        async generateQrLog() {
            const allSales = await DB.getAllSales();
            const selectedSaleObjects = allSales.filter(s => this.state.selectedSales.has(s.id));
            if (selectedSaleObjects.length === 0) return;
            
            const logData = {
                pikaLogVersion: 1,
                senderStore: this.state.user.business,
                items: selectedSaleObjects.map(s => ({
                    name: s.productName,
                    price: s.price,
                    quantity: s.quantity,
                    unit: 'pieces'
                }))
            };
            const productIds = selectedSaleObjects.map(s => s.productId);
            const products = await DB.getAllProducts();
            const relevantProducts = products.filter(p => productIds.includes(p.id));
            logData.items.forEach(item => {
                const product = relevantProducts.find(p => p.name === item.name);
                if (product) item.unit = product.unit;
            });

            QRCode.toCanvas(this.elements.qrCanvas, JSON.stringify(logData), { width: 250 }, (error) => {
                if (error) console.error(error);
                this.hideModal();
                this.showModal('qr-code-modal');
            });
        },
        handlePikaLogScanned(logData) {
            this.state.scannedLogData = logData;
            this.elements.confirmLogTitle.textContent = `Accept Log from ${logData.senderStore}?`;

            const totalCost = logData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const dateScanned = new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });

            const itemsHtml = logData.items.map(item => `
                <div class="log-details-row">
                    <div class="log-details-cell item">${item.name} (${item.quantity} ${item.unit})</div>
                    <div class="log-details-cell price">@ ₦${item.price.toLocaleString()}</div>
                    <div class="log-details-cell total">₦${(item.quantity * item.price).toLocaleString()}</div>
                </div>
            `).join('');

            const contentHtml = `
                <div class="log-summary">
                    <p><strong>From:</strong> ${logData.senderStore}</p>
                    <p><strong>Date:</strong> ${dateScanned}</p>
                </div>
                <div class="log-details-table">
                    <div class="log-details-row header">
                        <div class="log-details-cell item">Product</div>
                        <div class="log-details-cell price">Unit Price</div>
                        <div class="log-details-cell total">Subtotal</div>
                    </div>
                    ${itemsHtml}
                    <div class="log-details-row footer">
                        <div class="log-details-cell item">TOTAL PURCHASE</div>
                        <div class="log-details-cell total">₦${totalCost.toLocaleString()}</div>
                    </div>
                </div>
            `;
            
            this.elements.confirmLogContent.innerHTML = contentHtml;
            this.showModal('confirm-log-modal');
        },
        async acceptPikaLog() {
            if (!this.state.scannedLogData) return;
            const allProducts = await DB.getAllProducts();
            const productUpdates = [];

            for (const item of this.state.scannedLogData.items) {
                const existingProduct = allProducts.find(p => p.name.toLowerCase() === item.name.toLowerCase());
                if (existingProduct) {
                    existingProduct.stock += item.quantity;
                    productUpdates.push(DB.saveProduct(existingProduct));
                } else {
                    const newProduct = { id: Date.now() + Math.random(), name: item.name, price: item.price, stock: item.quantity, unit: item.unit, image: null, embedding: null, barcode: null, source: 'log', createdAt: new Date() };
                    productUpdates.push(DB.saveProduct(newProduct));
                }
            }
            await Promise.all(productUpdates);
            this.hideModal();
            this.state.scannedLogData = null;
            alert('Inventory updated successfully!');
            await this.renderProducts();
            this.navigateTo('products-view');
        },

        // --- PWA FEATURES ---
        handleBeforeInstallPrompt(event) { event.preventDefault(); this.state.deferredInstallPrompt = event; this.elements.installBtn.style.display = 'block'; },
        promptInstall() { if (this.state.deferredInstallPrompt) { this.state.deferredInstallPrompt.prompt(); this.state.deferredInstallPrompt.userChoice.then(() => { this.state.deferredInstallPrompt = null; this.elements.installBtn.style.display = 'none'; }); } },
        registerServiceWorker() { if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/serviceworker.js').then(reg => console.log('Service Worker registered.')).catch(err => console.error('Service Worker registration failed:', err)); }); } },
    };

    App.init();
});