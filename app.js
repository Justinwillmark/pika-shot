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
            userPhoneInput: document.getElementById('user-phone'),
            businessTypeInput: document.getElementById('business-type'),
            businessLocationInput: document.getElementById('business-location'),
            locationPermissionView: document.getElementById('location-permission-view'),
            grantLocationBtn: document.getElementById('grant-location-btn'),
            cameraPermissionView: document.getElementById('camera-permission-view'),
            grantCameraBtn: document.getElementById('grant-camera-btn'),
            homeView: document.getElementById('home-view'),
            homeContent: document.getElementById('home-content'),
            homeDashboardContent: document.getElementById('home-dashboard-content'),
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
            scanTimerDisplay: document.getElementById('scan-timer-display'),
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
            addChangePictureBtn: document.getElementById('add-change-picture-btn'),
            scanNewBarcodeBtn: document.getElementById('scan-new-barcode-btn'),
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
            installBtn: document.getElementById('add-to-homescreen-btn'),
            receiptActions: document.getElementById('receipt-actions'),
            generateReceiptBtn: document.getElementById('generate-receipt-btn'),
            cancelSelectionBtn: document.getElementById('cancel-selection-btn'),
            selectionModeHint: document.getElementById('selection-mode-hint'),
            receiptModal: document.getElementById('receipt-modal'),
            receiptContent: document.getElementById('receipt-content'),
            shareReceiptBtn: document.getElementById('share-receipt-btn'),
            printReceiptBtn: document.getElementById('print-receipt-btn'),
            closeReceiptBtn: document.getElementById('close-receipt-btn'),
            shareLogBtn: document.getElementById('share-log-btn'),
            qrCodeModal: document.getElementById('qr-code-modal'),
            qrCanvas: document.getElementById('qr-canvas'),
            closeQrBtn: document.getElementById('close-qr-btn'),
            entryChoiceModal: document.getElementById('entry-choice-modal'),
            entryChoiceTitle: document.getElementById('entry-choice-title'),
            entryChoiceParagraph: document.getElementById('entry-choice-p'),
            cancelEntryChoiceBtn: document.getElementById('cancel-entry-choice-btn'),
            manualEntryBtn: document.getElementById('manual-entry-btn'),
            retrySellScanBtn: document.getElementById('retry-sell-scan-btn'),
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
            addProductFailedModal: document.getElementById('add-product-failed-modal'),
            retryAddScanBtn: document.getElementById('retry-add-scan-btn'),
            cancelAddScanBtn: document.getElementById('cancel-add-scan-btn'),
            productExistsModal: document.getElementById('product-exists-modal'),
            productExistsMessage: document.getElementById('product-exists-message'),
            productExistsOkBtn: document.getElementById('product-exists-ok-btn'),
            seeStockLevelsContainer: document.getElementById('see-stock-levels-container'),
            seeStockLevelsBtn: document.getElementById('see-stock-levels-btn'),
            stockLevelsView: document.getElementById('stock-levels-view'),
            retailerStockView: document.getElementById('retailer-stock-view'),
            refreshStocksBtn: document.getElementById('refresh-stocks-btn'),
            cartonDetailsModal: document.getElementById('carton-details-modal'),
            cartonDetailsForm: document.getElementById('carton-details-form'),
            cancelCartonDetailsBtn: document.getElementById('cancel-carton-details-btn'),
            cartonSubunitTypeInput: document.getElementById('carton-subunit-type'),
            cartonSubunitQuantityInput: document.getElementById('carton-subunit-quantity'),
            cartonQuantityLabel: document.getElementById('carton-quantity-label'),
            privacyLink: document.getElementById('privacy-link'),
            privacyOkBtn: document.getElementById('privacy-ok-btn'),
        },

        // --- APP STATE ---
        state: {
            user: null,
            currentView: null,
            cameraReady: false,
            capturedBlob: null,
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
            firebaseReady: false,
            retailerListener: null, // For unsubscribing from Firestore listener
            tempProductDataForCarton: null,
        },

        // --- INITIALIZATION ---
        async init() {
            this.showLoader();
            this.registerServiceWorker();
            this.setupEventListeners();

            try {
                await DB.init();
                await this.initFirebase();
                this.state.user = await DB.getUser();

                if (!this.state.user) {
                    this.showView('onboarding-view');
                } else {
                    await this.loadMainApp();
                }
                this.loadCameraScannerInBackground();
            } catch (error) {
                console.error("Critical initialization failed:", error);
                alert("App could not start due to a storage issue. Please ensure you're not in private browsing mode and have available space.");
            } finally {
                this.hideLoader();
            }
        },

        async initFirebase() {
            try {
                await window.fb.signInAnonymously(window.fb.auth);
                this.state.firebaseReady = true;
                console.log("Firebase anonymous sign-in successful. UID:", window.fb.auth.currentUser.uid);
                const localUser = await DB.getUser();
                if (localUser && !localUser.uid) {
                    localUser.uid = window.fb.auth.currentUser.uid;
                    await DB.saveUser(localUser);
                    this.state.user = localUser;
                }
            } catch (error) {
                console.error("Firebase initialization failed:", error);
                this.state.firebaseReady = false;
                alert("Could not connect to online services. Some features may be unavailable.");
            }
        },

        // --- EVENT LISTENERS ---
        setupEventListeners() {
            this.elements.backBtn.addEventListener('click', () => history.back());
            window.addEventListener('popstate', this.handlePopState.bind(this));

            this.elements.startOnboardingBtn.addEventListener('click', this.handleOnboarding.bind(this));
            this.elements.privacyLink.addEventListener('click', (e) => { e.preventDefault(); this.showModal('privacy-policy-modal'); });
            this.elements.privacyOkBtn.addEventListener('click', () => this.hideModal());

            this.elements.grantLocationBtn.addEventListener('click', this.handleLocationPermission.bind(this));
            this.elements.grantCameraBtn.addEventListener('click', this.handleCameraPermission.bind(this));
            this.elements.navButtons.forEach(btn => btn.addEventListener('click', () => this.navigateTo(btn.dataset.view)));
            this.elements.sellItemBtnMain.addEventListener('click', this.startSellScan.bind(this));
            this.elements.addNewProductBtn.addEventListener('click', this.startAddProduct.bind(this));
            this.elements.productForm.addEventListener('submit', this.handleSaveProduct.bind(this));
            this.elements.deleteProductBtn.addEventListener('click', this.handleDeleteProduct.bind(this));
            this.elements.cancelProductFormBtn.addEventListener('click', () => this.hideModal());
            this.elements.cancelScanBtn.addEventListener('click', () => { Camera.stop(); history.back(); });
            this.elements.retakePictureBtn.addEventListener('click', this.handleRetakePicture.bind(this));
            this.elements.confirmPictureBtn.addEventListener('click', this.handleConfirmPicture.bind(this));
            this.elements.addChangePictureBtn.addEventListener('click', this.handleAddOrChangePicture.bind(this));
            this.elements.scanNewBarcodeBtn.addEventListener('click', this.startBarcodeAssignmentScan.bind(this));
            this.elements.cancelPictureBtn.addEventListener('click', () => this.hideModal());
            this.elements.saleQuantityInput.addEventListener('input', this.updateSaleTotal.bind(this));
            this.elements.cancelSaleBtn.addEventListener('click', () => this.hideModal());
            this.elements.confirmSaleBtn.addEventListener('click', this.handleConfirmSale.bind(this));
            window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this));
            this.elements.installBtn.addEventListener('click', this.promptInstall.bind(this));
            this.elements.generateReceiptBtn.addEventListener('click', this.generateReceipt.bind(this));
            this.elements.seeAllSalesBtn.addEventListener('click', () => this.navigateTo('all-sales-view'));
            this.elements.cancelSelectionBtn.addEventListener('click', this.exitSelectionMode.bind(this));
            this.elements.closeReceiptBtn.addEventListener('click', () => this.hideModal());
            this.elements.shareReceiptBtn.addEventListener('click', this.shareReceipt.bind(this));
            this.elements.printReceiptBtn.addEventListener('click', () => window.print());
            this.elements.shareLogBtn.addEventListener('click', this.generateQrLog.bind(this));
            this.elements.closeQrBtn.addEventListener('click', () => this.hideModal());
            this.elements.productSearchInput.addEventListener('input', (e) => this.renderProducts(e.target.value));
            this.elements.cancelEntryChoiceBtn.addEventListener('click', () => this.hideModal());
            this.elements.manualEntryBtn.addEventListener('click', () => { this.hideModal(); this.elements.manualSaleForm.reset(); this.showModal('manual-sale-modal'); });
            this.elements.retrySellScanBtn.addEventListener('click', () => { this.hideModal(); this.startSellScan(); });
            this.elements.cancelManualSaleBtn.addEventListener('click', () => this.hideModal());
            this.elements.manualSaleForm.addEventListener('submit', this.handleManualSale.bind(this));
            this.elements.selectFromProductsBtn.addEventListener('click', this.showProductSelection.bind(this));
            this.elements.rejectLogBtn.addEventListener('click', () => { this.hideModal(); this.state.scannedLogData = null; });
            this.elements.acceptLogBtn.addEventListener('click', this.acceptPikaLog.bind(this));
            this.elements.retryAddScanBtn.addEventListener('click', () => { this.hideModal(); this.startAddProduct(); });
            this.elements.cancelAddScanBtn.addEventListener('click', () => this.hideModal());
            this.elements.productExistsOkBtn.addEventListener('click', () => this.hideModal());
            this.elements.seeStockLevelsBtn.addEventListener('click', () => this.navigateTo('stock-levels-view'));
            this.elements.refreshStocksBtn.addEventListener('click', this.renderRetailerStocks.bind(this));
            this.elements.cartonDetailsForm.addEventListener('submit', this.handleSaveCartonDetails.bind(this));
            this.elements.cancelCartonDetailsBtn.addEventListener('click', () => { this.hideModal(); this.showModal('product-form-modal'); });
            this.elements.cartonSubunitTypeInput.addEventListener('input', (e) => {
                const selectedUnit = e.target.value;
                if (selectedUnit) {
                    this.elements.cartonQuantityLabel.textContent = `How many ${selectedUnit} per carton?`;
                } else {
                    this.elements.cartonQuantityLabel.textContent = `Quantity of items per carton`;
                }
            });

            // Number formatting listeners
            const fieldsToFormat = [
                this.elements.productPriceInput, this.elements.productStockInput,
                this.elements.saleQuantityInput, this.elements.manualProductPrice,
                this.elements.manualSaleQuantity, this.elements.cartonSubunitQuantityInput
            ];
            fieldsToFormat.forEach(input => {
                input.addEventListener('input', (e) => {
                    const originalValue = this.unformatNumber(e.target.value);
                    const formattedValue = this.formatNumber(originalValue);
                    if (e.target.value !== formattedValue) {
                        e.target.value = formattedValue;
                    }
                });
            });

            // Phone number validation
            this.elements.userPhoneInput.addEventListener('input', (e) => {
                const input = e.target;
                let value = input.value.replace(/\D/g, ''); // Remove non-digit characters
                if (value.length > 11) {
                    value = value.slice(0, 11); // Truncate to 11 digits
                }
                input.value = value;
            });
        },
        
        // --- UI & NAVIGATION ---
        showLoader() { this.elements.loader.style.display = 'flex'; this.elements.appContainer.style.display = 'none'; },
        hideLoader() { this.elements.loaderSpinner.style.display = 'none'; this.elements.loaderCheck.style.display = 'block'; setTimeout(() => { this.elements.loader.style.opacity = '0'; this.elements.appContainer.style.display = 'flex'; setTimeout(() => { this.elements.loader.style.display = 'none'; }, 500); }, 500); },
        showView(viewId) { 
            if (this.state.currentView === viewId) return;
            this.elements.views.forEach(view => view.classList.remove('active')); 
            const viewToShow = document.getElementById(viewId); 
            if (viewToShow) { 
                viewToShow.classList.add('active'); 
                this.state.currentView = viewId; 
                if (!['onboarding-view', 'camera-permission-view', 'location-permission-view'].includes(viewId)) { 
                    this.updateHeader(viewId); 
                } 
            } 
        },
        showModal(modalId) { this.elements.modalContainer.style.display = 'flex'; this.elements.modalContainer.querySelectorAll('.modal-content').forEach(m => m.style.display = 'none'); const modalToShow = document.getElementById(modalId); if (modalToShow) { modalToShow.style.display = 'block'; } },
        hideModal() { this.elements.modalContainer.style.display = 'none'; this.elements.modalContainer.querySelectorAll('.modal-content').forEach(m => m.style.display = 'none'); },
        
        navigateTo(viewId, isBackNavigation = false) {
            if (this.state.currentView === viewId && !isBackNavigation) return;
            
            if (!isBackNavigation) {
                history.pushState({ view: viewId }, '', `#${viewId}`);
            }

            if (this.state.productSelectionMode && viewId !== 'products-view') {
                this.state.productSelectionMode = false;
            }

            if (viewId === 'all-sales-view') {
                this.renderAllSales();
            }
            
            if (viewId === 'stock-levels-view') {
                this.renderRetailerStocks();
            } else {
                if (this.state.retailerListener) {
                    this.state.retailerListener(); 
                    this.state.retailerListener = null;
                }
            }

            this.showView(viewId);
            this.elements.navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewId));
            
            const isHomePage = viewId === 'home-view' || !document.getElementById(viewId)?.classList.contains('page');
            this.elements.backBtn.style.display = isHomePage ? 'none' : 'block';
            
            this.elements.productsView.classList.toggle('selection-mode', this.state.productSelectionMode);
            this.elements.addNewProductBtn.style.display = (this.state.productSelectionMode || viewId !== 'products-view') ? 'none' : 'flex';
            
            this.exitSelectionMode();
        },
        
        handlePopState(event) {
            const viewId = (event.state && event.state.view) || 'home-view';
            this.navigateTo(viewId, true);
        },

        updateHeader(viewId) {
            let title = 'pika shot';
            if (this.state.productSelectionMode && viewId === 'products-view') {
                title = 'Select a Product';
            } else {
                const titles = { 'home-view': 'Home', 'products-view': 'My Products', 'all-sales-view': 'All Sales', 'stock-levels-view': 'Customer Stocks' };
                title = titles[viewId] || 'pika shot';
            }
            this.elements.headerTitle.textContent = title;
        },

        async updateDashboard() {
            if (this.state.user) {
                this.elements.welcomeName.textContent = `Hello, ${this.state.user.name.split(' ')[0]}!`;
                if (this.state.user.type === 'Wholesaler') {
                    this.elements.seeStockLevelsContainer.style.display = 'block';
                    this.elements.shareLogBtn.style.display = 'block';
                } else {
                    this.elements.seeStockLevelsContainer.style.display = 'none';
                    this.elements.shareLogBtn.style.display = 'none';
                }
            }
            const date = new Date();
            this.elements.welcomeDate.textContent = date.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            const sales = await DB.getSalesToday();
            const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
            const itemsSold = sales.reduce((sum, sale) => sum + sale.quantity, 0);
            this.elements.totalSalesEl.textContent = `₦${this.formatNumber(totalSales)}`;
            this.elements.itemsSoldEl.textContent = this.formatNumber(itemsSold);
            
            this.elements.seeAllContainer.style.display = sales.length > 6 ? 'block' : 'none';
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
                saleEl.innerHTML = `<img src="${imageUrl}" alt="${sale.productName}"><div class="sale-info"><p>${sale.productName}</p><span>${this.formatNumber(sale.quantity)} x &#8358;${this.formatNumber(sale.price)}</span></div><p class="sale-price">&#8358;${this.formatNumber(sale.total)}</p>`;
                
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
                groupHeader.innerHTML = `<h3>${groupTitle}</h3><p class="sales-group-total">&#8358;${this.formatNumber(dailyTotal)}</p>`;
                groupContainer.appendChild(groupHeader);

                groupedSales[groupTitle].forEach(sale => {
                    const saleEl = document.createElement('div');
                    saleEl.className = 'sale-item';
                    saleEl.dataset.saleId = sale.id;
                    const imageUrl = sale.image ? URL.createObjectURL(sale.image) : 'icons/icon-192.png';
                    saleEl.innerHTML = `<img src="${imageUrl}" alt="${sale.productName}"><div class="sale-info"><p>${sale.productName}</p><span>${this.formatNumber(sale.quantity)} x &#8358;${this.formatNumber(sale.price)}</span></div><p class="sale-price">&#8358;${this.formatNumber(sale.total)}</p>`;
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
                
                let badgeHtml = '';
                if (product.stock <= 0) {
                    badgeHtml = '<div class="out-of-stock-badge">Out of Stock</div>';
                } else if (product.needsSetup === 'barcode-and-price') {
                    badgeHtml = '<div class="setup-badge">Set barcode & price</div>';
                } else if (product.needsSetup === 'price') {
                    badgeHtml = '<div class="setup-badge">Set price & image</div>';
                } else if (product.stock < 7) {
                    badgeHtml = '<div class="restock-badge">Restock now!</div>';
                }

                const words = product.name.split(' ');
                const displayName = words.length > 2 ? words.slice(0, 2).join(' ') + '...' : product.name;

                const pencilIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
                card.innerHTML = `
                    ${badgeHtml}
                    <button class="edit-btn-icon">${pencilIconSVG}</button>
                    <div class="product-card-image-wrapper">
                        <img src="${imageUrl}" alt="${product.name}">
                    </div>
                    <div class="product-card-info">
                        <h4>${displayName}</h4>
                        <p class="product-price">&#8358;${this.formatNumber(product.price)}</p>
                        <p class="product-stock">${product.stock > 0 ? `${this.formatNumber(product.stock)} ${product.unit} left` : ''}</p>
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
                    } else {
                        if (product.needsSetup || this.state.user.type === 'Wholesaler') {
                            this.handleEditProduct(product);
                        }
                    }
                });

                this.elements.productGrid.appendChild(card);
            });
        },

        // --- CORE APP LOGIC ---
        async loadMainApp() {
            this.elements.appHeader.style.display = 'flex';
            this.elements.mainContent.style.display = 'block';
            this.elements.bottomNav.style.display = 'flex';
        
            const initialView = window.location.hash.substring(1) || 'home-view';
            history.replaceState({ view: initialView }, '', `#${initialView}`);
            this.navigateTo(initialView, true);
        
            await this.updateDashboard();
            await this.renderProducts();
        },
        async handleOnboarding(e) { e.preventDefault(); const name = this.elements.userNameInput.value.trim(); const business = this.elements.businessNameInput.value.trim(); const phone = this.elements.userPhoneInput.value.trim(); const type = this.elements.businessTypeInput.value; const location = this.elements.businessLocationInput.value; if (!name || !business || !phone || !type || !location) { alert('Please fill in all fields.'); return; } const uid = this.state.firebaseReady ? window.fb.auth.currentUser.uid : null; this.state.user = { id: 1, name, business, phone, type, location, uid }; await DB.saveUser(this.state.user); this.showView('location-permission-view'); },
        handleLocationPermission() {
             navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('Location permission granted:', position.coords);
                    this.showView('camera-permission-view');
                },
                (error) => {
                    console.warn('Location permission denied:', error.message);
                    alert("Location access is optional but recommended. You can enable it later in your browser settings.");
                    this.showView('camera-permission-view');
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        },
        async handleCameraPermission() { try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); stream.getTracks().forEach(track => track.stop()); await this.loadMainApp(); } catch (err) { console.error("Camera permission denied:", err); alert("Camera access is required for barcode scanning. Please enable it in browser settings."); } },
        async loadCameraScannerInBackground() { 
            try { 
                this.elements.sellItemBtnText.textContent = 'Loading...'; 
                this.elements.sellItemBtnMain.classList.add('loading');
                await Camera.init(); 
                this.state.cameraReady = true; 
                this.elements.addNewProductBtn.classList.remove('disabled'); 
                this.elements.sellItemBtnMain.classList.remove('disabled'); 
                this.elements.sellItemBtnText.textContent = 'Sell Item'; 
                console.log("Barcode scanner ready."); 
            } catch (error) { 
                console.error("Failed to initialize scanner:", error); 
                this.state.cameraReady = false; 
                this.elements.sellItemBtnText.textContent = 'Offline'; 
            } finally {
                this.elements.sellItemBtnMain.classList.remove('loading');
            }
        },
        
        // --- ADD PRODUCT FLOW ---
        startAddProduct() { 
            if (!this.state.cameraReady) { alert("Scanner is not ready yet. Please wait or check your connection."); return; }
            if (!Camera.barcodeDetector) { alert("Barcode scanning is not available on this browser."); return; }
            this.elements.scanFeedback.textContent = 'Scan product barcode';
            this.navigateTo('camera-view');
            Camera.startScan(
                this.handleAddProductScanResult.bind(this), 
                () => { // onTimeout callback
                    this.elements.scanFeedback.textContent = 'No barcode found.';
                    setTimeout(() => { 
                        history.back();
                        this.showModal('add-product-failed-modal');
                    }, 500);
                },
                this.elements.scanTimerDisplay
            );
        },
        
        async handleAddProductScanResult(result) {
            switch (result.type) {
                case 'barcode':
                    history.back();
                    const existingProduct = await DB.getProductByBarcode(result.data);
                    if (existingProduct) {
                        this.elements.productExistsMessage.textContent = `Product already exists as "${existingProduct.name}" in inventory.`;
                        this.showModal('product-exists-modal');
                    } else {
                        this.state.capturedBarcode = result.data;
                        this.state.capturedBlob = null;
                        this.state.editingProduct = null;
                        this._openProductForm({ source: 'barcode' });
                    }
                    break;
                case 'qrlog':
                    history.back();
                    this.handlePikaLogScanned(result.data);
                    break;
            }
        },

        // --- SELL ITEM FLOW ---
        startSellScan() {
            if (!this.state.cameraReady) { alert("Scanner is not ready yet. Please wait or check your connection."); return; }
            if (!Camera.barcodeDetector) { alert("Barcode scanning is not available on this browser."); return; }
            this.elements.scanFeedback.textContent = 'Scanning for product...';
            this.navigateTo('camera-view');
            Camera.startScan(
                async (result) => { // onResult
                    history.back();
                    if (result.type === 'barcode') {
                        const product = await DB.getProductByBarcode(result.data);
                        if (product) {
                            this.handleProductFound(product);
                        } else {
                            this.handleSellScanNotFound();
                        }
                    } else if (result.type === 'qrlog') {
                        this.handlePikaLogScanned(result.data);
                    }
                },
                this.handleSellScanNotFound.bind(this), // onTimeout
                this.elements.scanTimerDisplay
            );
        },
        
        showNewSaleEntryChoice() {
            this.hideModal();
            this.elements.entryChoiceTitle.textContent = 'New Sale Entry';
            this.elements.entryChoiceParagraph.textContent = 'How would you like to log this sale?';
            this.elements.manualEntryBtn.style.display = 'block';
            this.elements.retrySellScanBtn.style.display = 'none';
            this.showModal('entry-choice-modal');
        },

        handleSellScanNotFound() {
            this.elements.scanFeedback.textContent = 'Product not found.';
            setTimeout(() => {
                history.back();
                this.elements.entryChoiceTitle.textContent = 'Item Not Found';
                this.elements.entryChoiceParagraph.textContent = 'This product is not in your inventory.';
                this.elements.manualEntryBtn.style.display = 'none';
                this.elements.retrySellScanBtn.style.display = 'block';
                this.showModal('entry-choice-modal');
            }, 1000);
        },

        async handleRetakePicture() { this.hideModal(); await this.handleAddOrChangePicture(); },
        
        handleConfirmPicture() {
            this.hideModal();
            this.elements.addChangePictureBtn.textContent = 'New product image added';
            this.showModal('product-form-modal');
        },
        
        _openProductForm(options = {}) {
            this.elements.productForm.reset();
            this.elements.productFormTitle.textContent = 'Add New Product';
            this.elements.deleteProductBtn.style.display = 'none';
            this.elements.addChangePictureBtn.style.display = 'block';
            this.elements.addChangePictureBtn.textContent = 'Add / Change Image';
            this.elements.scanNewBarcodeBtn.style.display = 'none';
            this.elements.productIdInput.value = '';
            this.elements.productBarcodeDisplay.style.display = 'none';
            this.elements.productSourceInfo.style.display = 'none';
            this.state.capturedBlob = null;
            
            const cartonOption = this.elements.productUnitInput.querySelector('.wholesaler-only');
            if (this.state.user && this.state.user.type === 'Wholesaler') {
                cartonOption.style.display = 'block';
            } else {
                cartonOption.style.display = 'none';
            }
            
            if (options.source === 'barcode' && this.state.capturedBarcode) {
                this.elements.productBarcodeDisplay.textContent = this.state.capturedBarcode;
                this.elements.productBarcodeDisplay.style.display = 'block';
            }
            
            this.hideModal();
            this.showModal('product-form-modal');
        },

        async handleSaveProduct(e) { 
            e.preventDefault(); 
            const isEditing = !!this.state.editingProduct;
            
            let productData = { 
                id: isEditing ? this.state.editingProduct.id : Date.now(), 
                name: this.elements.productNameInput.value.trim(), 
                price: this.unformatNumber(this.elements.productPriceInput.value), 
                stock: this.unformatNumber(this.elements.productStockInput.value), 
                unit: this.elements.productUnitInput.value, 
                image: this.state.capturedBlob || (isEditing ? this.state.editingProduct.image : null), 
                barcode: this.state.capturedBarcode || (isEditing ? this.state.editingProduct.barcode : null),
                createdAt: isEditing ? this.state.editingProduct.createdAt : new Date(),
                supplierId: isEditing ? this.state.editingProduct.supplierId : null,
                needsSetup: null, // Clear setup flag on any edit/save
            }; 

            if (!productData.name || isNaN(productData.price) || isNaN(productData.stock)) { 
                alert('Please fill out all fields correctly.'); return; 
            } 
            
            if (productData.unit === 'cartons' && this.state.user.type === 'Wholesaler') {
                this.elements.cartonDetailsForm.reset();
                this.elements.cartonQuantityLabel.textContent = 'Quantity of items per carton';
                this.state.tempProductDataForCarton = productData;
                this.hideModal();
                this.showModal('carton-details-modal');
                return; 
            }
            
            await this._commitProductSave(productData);
        },

        async handleSaveCartonDetails(e) {
            e.preventDefault();
            if (!this.state.tempProductDataForCarton) return;

            const subUnitType = this.elements.cartonSubunitTypeInput.value;
            const subUnitQuantity = this.unformatNumber(this.elements.cartonSubunitQuantityInput.value);

            if (!subUnitType || isNaN(subUnitQuantity) || subUnitQuantity <= 0) {
                alert('Please fill in the carton details correctly.');
                return;
            }
            
            let productData = this.state.tempProductDataForCarton;
            productData.subUnitType = subUnitType;
            productData.subUnitQuantity = subUnitQuantity;

            await this._commitProductSave(productData);
            this.state.tempProductDataForCarton = null;
        },

        async _commitProductSave(productData) {
            await DB.saveProduct(productData); 
            
            this.hideModal(); 
            this.state.capturedBlob = null; 
            this.state.capturedBarcode = null;
            this.state.editingProduct = null; 
            
            this.navigateTo('products-view'); 
            await this.renderProducts(); 
        },

        handleEditProduct(product) { 
            this.state.editingProduct = product; 
            this.state.capturedBarcode = product.barcode;
            this.elements.productForm.reset();
            this.elements.productFormTitle.textContent = 'Edit Product'; 
            this.elements.deleteProductBtn.style.display = 'flex'; 
            this.elements.addChangePictureBtn.style.display = 'block';
            this.elements.addChangePictureBtn.textContent = 'Add / Change Image';
            this.elements.productIdInput.value = product.id; 
            this.elements.productNameInput.value = product.name; 
            this.elements.productPriceInput.value = this.formatNumber(product.price); 
            this.elements.productStockInput.value = this.formatNumber(product.stock); 
            this.elements.productUnitInput.value = product.unit; 
            this.state.capturedBlob = product.image;

            const cartonOption = this.elements.productUnitInput.querySelector('.wholesaler-only');
            if (this.state.user && this.state.user.type === 'Wholesaler') {
                cartonOption.style.display = 'block';
            } else {
                cartonOption.style.display = 'none';
            }
            
            this.elements.productSourceInfo.style.display = 'none'; // Hide by default
            if (product.needsSetup === 'barcode-and-price') {
                this.elements.scanNewBarcodeBtn.style.display = 'block';
                this.elements.productSourceInfo.textContent = 'This product needs a barcode. Scan one now.';
                this.elements.productSourceInfo.style.display = 'block';
                this.elements.productBarcodeDisplay.style.display = 'none';
            } else {
                this.elements.scanNewBarcodeBtn.style.display = 'none';
                if (product.barcode) {
                    this.elements.productBarcodeDisplay.textContent = product.barcode;
                    this.elements.productBarcodeDisplay.style.display = 'block';
                } else {
                    this.elements.productSourceInfo.textContent = 'No barcode assigned.';
                    this.elements.productSourceInfo.style.display = 'block';
                    this.elements.productBarcodeDisplay.style.display = 'none';
                }
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
        
        async handleAddOrChangePicture() {
            this.hideModal();
            this.navigateTo('camera-view');
            try {
                const { blob } = await Camera.capturePhoto();
                history.back();
                if (blob) {
                    this.state.capturedBlob = blob;
                    this.elements.capturedImagePreview.src = URL.createObjectURL(blob);
                    this.showModal('confirm-picture-modal');
                }
            } catch (error) {
                console.error("Error capturing image:", error);
                alert("Could not capture image.");
                history.back();
            }
        },

        startBarcodeAssignmentScan() {
            this.hideModal();
            this.elements.scanFeedback.textContent = 'Scan new barcode...';
            this.navigateTo('camera-view');
            Camera.startScan(
                this.handleBarcodeAssignmentResult.bind(this),
                () => {
                    this.elements.scanFeedback.textContent = 'Scan failed.';
                    setTimeout(() => {
                        history.back();
                        this.showModal('product-form-modal'); // Re-show form
                        alert('No barcode found. Please try again.');
                    }, 500);
                },
                this.elements.scanTimerDisplay
            );
        },

        async handleBarcodeAssignmentResult(result) {
            history.back();
            if (result.type !== 'barcode') return;

            const existingProduct = await DB.getProductByBarcode(result.data);
            if (existingProduct && existingProduct.id !== this.state.editingProduct.id) {
                alert(`This barcode is already assigned to "${existingProduct.name}".`);
                this.showModal('product-form-modal');
                return;
            }

            this.state.capturedBarcode = result.data;
            this.elements.productBarcodeDisplay.textContent = result.data;
            this.elements.productBarcodeDisplay.style.display = 'block';
            this.elements.productSourceInfo.style.display = 'none';
            this.showModal('product-form-modal');
        },

        handleProductFound(product) { this.state.sellingProduct = product; this.elements.saleProductImage.src = product.image ? URL.createObjectURL(product.image) : 'icons/icon-192.png'; this.elements.saleProductName.textContent = product.name; this.elements.saleProductStock.textContent = `Stock: ${this.formatNumber(product.stock)} ${product.unit}`; this.elements.saleQuantityInput.value = '1'; this.updateSaleTotal(); this.showModal('confirm-sale-modal'); },
        updateSaleTotal() { const quantity = this.unformatNumber(this.elements.saleQuantityInput.value); const price = this.state.sellingProduct?.price || 0; const total = quantity * price; this.elements.saleTotalPrice.textContent = `₦${this.formatNumber(total)}`; },
        async _processSale() { 
            const quantity = this.unformatNumber(this.elements.saleQuantityInput.value); 
            const product = this.state.sellingProduct; 
            if (quantity <= 0 || !product || quantity > product.stock) { alert('Invalid quantity or product not available.'); return false; } 
            
            product.stock -= quantity; 
            
            await DB.saveProduct(product); 
            const sale = { id: Date.now(), productId: product.id, productName: product.name, quantity: quantity, price: product.price, total: quantity * product.price, timestamp: new Date(), image: product.image }; 
            await DB.addSale(sale); 

            if (this.state.firebaseReady && product.supplierId && this.state.user.uid) {
                try {
                    const retailerDocRef = window.fb.doc(window.fb.db, `retailer_stocks/${product.supplierId}/supplied_retailers/${this.state.user.uid}`);
                    const updateData = {};
                    updateData[`products.${product.name}.stock`] = product.stock;
                    updateData.lastUpdate = window.fb.serverTimestamp();
                    
                    await window.fb.updateDoc(retailerDocRef, updateData);
                } catch (error) {
                    console.error("Failed to sync sale to Firebase:", error);
                }
            }
            
            return true; 
        },
        async handleConfirmSale() { 
            const success = await this._processSale(); 
            if (success) { 
                this.hideModal(); 
                await this.updateDashboard(); 
                await this.renderProducts(); 
                this.navigateTo('home-view'); 
            } 
        },
        
        async handleManualSale(e) {
            e.preventDefault();
            const name = this.elements.manualProductName.value.trim();
            const price = this.unformatNumber(this.elements.manualProductPrice.value);
            const quantity = this.unformatNumber(this.elements.manualSaleQuantity.value);
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
                productToSell = { id: Date.now(), name, price, stock: 0, unit, image: null, barcode: null, createdAt: new Date(), supplierId: null };
                alert(`${name} is a new item and will be added to your products list with 0 stock.`);
            }

            await DB.saveProduct(productToSell);
            const sale = { id: Date.now() + 1, productId: productToSell.id, productName: name, quantity, price, total: price * quantity, timestamp: new Date(), image: productToSell.image };
            await DB.addSale(sale);

            if (this.state.firebaseReady && productToSell.supplierId && this.state.user.uid) {
                try {
                    const retailerDocRef = window.fb.doc(window.fb.db, `retailer_stocks/${productToSell.supplierId}/supplied_retailers/${this.state.user.uid}`);
                    const updateData = {};
                    updateData[`products.${productToSell.name}.stock`] = productToSell.stock;
                    updateData.lastUpdate = window.fb.serverTimestamp();
    
                    await window.fb.updateDoc(retailerDocRef, updateData);
                } catch (error) {
                    console.error("Failed to sync manual sale to Firebase:", error);
                }
            }

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
                itemsHtml += `<tr><td>${sale.productName}</td><td class="col-qty">${this.formatNumber(sale.quantity)}</td><td class="col-price">&#8358;${this.formatNumber(sale.price)}</td><td class="col-total">&#8358;${this.formatNumber(sale.total)}</td></tr>`;
            });
            const receiptHtml = `<div class="receipt-header"><h3>${this.state.user.business}</h3><p>${this.state.user.location}</p><p><strong>Receipt ID:</strong> ${receiptId}</p></div><div class="receipt-items"><table><thead><tr><th>Item</th><th class="col-qty">Qty</th><th class="col-price">Price</th><th class="col-total">Total</th></tr></thead><tbody>${itemsHtml}</tbody></table></div><div class="receipt-total"><div class="total-row"><span>TOTAL</span><span>&#8358;${this.formatNumber(totalAmount)}</span></div></div><div class="receipt-footer"><p>Thank you for your patronage!</p><p>${now.toLocaleDateString('en-NG')} ${now.toLocaleTimeString('en-NG')}</p></div>`;
            this.elements.receiptContent.innerHTML = receiptHtml;
            this.showModal('receipt-modal');
        },
        async shareReceipt() { const receiptElement = this.elements.receiptContent; try { const canvas = await html2canvas(receiptElement, { scale: 2 }); canvas.toBlob(async (blob) => { if (navigator.share && blob) { try { await navigator.share({ files: [new File([blob], 'pika-shot-receipt.png', { type: 'image/png' })], title: 'Your Receipt', text: 'Here is your receipt from ' + this.state.user.business, }); } catch (error) { console.error('Error sharing:', error); } } else { alert('Sharing is not supported on this browser, or there was an error creating the image.'); } }, 'image/png'); } catch (error) { console.error('Error generating receipt image:', error); alert('Could not generate receipt image.'); } },
        async generateQrLog() {
            if (!this.state.firebaseReady || !this.state.user.uid) {
                alert("Cannot generate log: not connected to online services.");
                return;
            }
            const allSales = await DB.getAllSales();
            const selectedSaleObjects = allSales.filter(s => this.state.selectedSales.has(s.id));
            if (selectedSaleObjects.length === 0) return;

            const allProducts = await DB.getAllProducts();
            
            const logData = {
                pikaLogVersion: 1,
                senderStore: this.state.user.business,
                senderId: this.state.user.uid,
                items: selectedSaleObjects.map(sale => {
                    const product = allProducts.find(p => p.id === sale.productId);
                    const item = {
                        name: sale.productName,
                        price: sale.price,
                        quantity: sale.quantity,
                        unit: product ? product.unit : 'pieces',
                        barcode: product ? product.barcode : null
                    };
                    if (product && product.unit === 'cartons') {
                        item.subUnitType = product.subUnitType;
                        item.subUnitQuantity = product.subUnitQuantity;
                    }
                    return item;
                })
            };

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

            const itemsHtml = logData.items.map(item => {
                const isCarton = item.unit === 'cartons' && item.subUnitType;
                const displayName = isCarton 
                    ? `${item.name} (${this.formatNumber(item.quantity)} ${item.unit} -> ${this.formatNumber(item.quantity * item.subUnitQuantity)} ${item.subUnitType})`
                    : `${item.name} (${this.formatNumber(item.quantity)} ${item.unit})`;
                
                return `
                <div class="log-details-row">
                    <div class="log-details-cell item">${displayName}</div>
                    <div class="log-details-cell price">@ &#8358;${this.formatNumber(item.price)}</div>
                    <div class="log-details-cell total">&#8358;${this.formatNumber(item.quantity * item.price)}</div>
                </div>
            `}).join('');

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
                        <div class="log-details-cell total">&#8358;${this.formatNumber(totalCost)}</div>
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
            let updatedProductsForFirebase = {};
            const supplierId = this.state.scannedLogData.senderId;

            for (const item of this.state.scannedLogData.items) {
                const isCarton = item.unit === 'cartons' && item.subUnitType && item.subUnitQuantity > 0;
                
                const stockToAdd = isCarton ? item.quantity * item.subUnitQuantity : item.quantity;
                const unitType = isCarton ? item.subUnitType : item.unit;
                const costPrice = isCarton ? item.price / item.subUnitQuantity : item.price;
                const needsSetup = isCarton ? 'barcode-and-price' : 'price';
                const barcode = isCarton ? null : item.barcode;

                const existingProduct = allProducts.find(p => p.name.toLowerCase() === item.name.toLowerCase());
                let finalProduct;

                if (existingProduct) {
                    existingProduct.stock += stockToAdd;
                    existingProduct.supplierId = supplierId;
                    existingProduct.needsSetup = needsSetup;
                    if (barcode) existingProduct.barcode = barcode; 
                    finalProduct = existingProduct;
                } else {
                    finalProduct = { 
                        id: Date.now() + Math.random(), 
                        name: item.name, 
                        price: costPrice,
                        stock: stockToAdd, 
                        unit: unitType, 
                        image: null, 
                        barcode: barcode, 
                        createdAt: new Date(),
                        supplierId: supplierId,
                        needsSetup: needsSetup
                    };
                }
                productUpdates.push(DB.saveProduct(finalProduct));
                updatedProductsForFirebase[finalProduct.name] = { stock: finalProduct.stock, unit: finalProduct.unit };
            }

            await Promise.all(productUpdates);

            if (this.state.firebaseReady && supplierId && this.state.user.uid) {
                try {
                    const retailerDocRef = window.fb.doc(window.fb.db, `retailer_stocks/${supplierId}/supplied_retailers/${this.state.user.uid}`);
                    await window.fb.setDoc(retailerDocRef, {
                        retailerName: this.state.user.business,
                        retailerLocation: this.state.user.location,
                        retailerPhone: this.state.user.phone,
                        products: updatedProductsForFirebase,
                        lastUpdate: window.fb.serverTimestamp()
                    }, { merge: true });
                } catch (error) {
                    console.error("Error updating stock to Firebase:", error);
                    alert("Local inventory updated, but failed to sync online.");
                }
            }
            
            this.hideModal();
            this.state.scannedLogData = null;
            alert('Inventory updated successfully! Check "My Products" to set prices.');
            await this.renderProducts();
            this.navigateTo('products-view');
        },

        // --- WHOLESALER VIEW ---
        renderRetailerStocks() {
            this.elements.retailerStockView.innerHTML = '<div class="spinner"></div>';
            if (!this.state.firebaseReady || !this.state.user.uid) {
                this.elements.retailerStockView.innerHTML = `<p class="empty-state">Could not connect to online services.</p>`;
                return;
            }

            try {
                if (this.state.retailerListener) {
                    this.state.retailerListener();
                }
                const retailersRef = window.fb.collection(window.fb.db, `retailer_stocks/${this.state.user.uid}/supplied_retailers`);
                const q = window.fb.query(retailersRef);

                this.state.retailerListener = window.fb.onSnapshot(q, (querySnapshot) => {
                    if (querySnapshot.empty) {
                        this.elements.retailerStockView.innerHTML = `<p class="empty-state">No retailer data found. Share a log with a retailer to see their stock here.</p>`;
                        return;
                    }

                    let contentHtml = '';
                    const retailersData = [];
                    querySnapshot.forEach(doc => retailersData.push(doc.data()));
                    
                    retailersData.sort((a, b) => (b.lastUpdate?.toDate() || 0) - (a.lastUpdate?.toDate() || 0));

                    retailersData.forEach(retailer => {
                        let productsHtml = '';
                        if (retailer.products && Object.keys(retailer.products).length > 0) {
                            for (const productName in retailer.products) {
                                const product = retailer.products[productName];
                                productsHtml += `<div class="retailer-product-item"><span>${productName}</span><strong>${this.formatNumber(product.stock)} ${product.unit}</strong></div>`;
                            }
                        } else {
                            productsHtml = `<div class="retailer-product-item"><span>No product data available.</span></div>`;
                        }
                        
                        const phoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
                        const callButton = retailer.retailerPhone ? `<a href="tel:${retailer.retailerPhone}" class="retailer-call-btn" title="Call ${retailer.retailerName}">${phoneIcon}</a>` : '';
                        
                        let lastUpdateDate = '';
                        if (retailer.lastUpdate && retailer.lastUpdate.toDate) {
                            lastUpdateDate = retailer.lastUpdate.toDate().toLocaleDateString('en-NG', {
                                day: 'numeric', month: 'short', year: 'numeric'
                            });
                        }

                        contentHtml += `
                            <div class="card">
                                <div class="retailer-header">
                                    <div style="flex-grow: 1;">
                                        <h4>${retailer.retailerName} (${retailer.retailerLocation})</h4>
                                        ${lastUpdateDate ? `<p style="font-size: 0.8rem; color: var(--text-light); margin-top: 2px;">Last Update: ${lastUpdateDate}</p>` : ''}
                                    </div>
                                    ${callButton}
                                </div>
                                <div class="retailer-product-list">${productsHtml}</div>
                            </div>
                        `;
                    });
                    this.elements.retailerStockView.innerHTML = contentHtml;
                }, (error) => {
                     console.error("Error fetching retailer stocks in real-time:", error);
                     this.elements.retailerStockView.innerHTML = `<p class="empty-state">Error loading retailer data.</p>`;
                });
            } catch (error) {
                console.error("Error setting up retailer stocks listener:", error);
                this.elements.retailerStockView.innerHTML = `<p class="empty-state">Error loading retailer data.</p>`;
            }
        },
        
        // --- HELPERS ---
        formatNumber(value) {
            if (value === null || value === undefined) return '';
            const num = parseFloat(this.unformatNumber(value));
            if (isNaN(num)) return '';
            return num.toLocaleString('en-US');
        },
        unformatNumber(value) {
            if (typeof value !== 'string') {
                value = String(value);
            }
            return parseFloat(value.replace(/,/g, '')) || 0;
        },

        // --- PWA FEATURES ---
        handleBeforeInstallPrompt(event) { event.preventDefault(); this.state.deferredInstallPrompt = event; this.elements.installBtn.style.display = 'block'; },
        promptInstall() { if (this.state.deferredInstallPrompt) { this.state.deferredInstallPrompt.prompt(); this.state.deferredInstallPrompt.userChoice.then(() => { this.state.deferredInstallPrompt = null; this.elements.installBtn.style.display = 'none'; }); } },
        registerServiceWorker() { if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/serviceworker.js').then(reg => console.log('Service Worker registered.')).catch(err => console.error('Service Worker registration failed:', err)); }); } },
    };

    App.init();
});