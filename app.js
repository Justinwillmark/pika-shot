document.addEventListener('DOMContentLoaded', () => {
    // Messages and questions use PikaShot's own pop-up (App._dialog), never the browser's alert/confirm
    const say = (text, title) => App._say(text, title);
    const ask = (options) => App._ask(options);
    window.pikaSay = say;

    const App = {
        // --- DOM ELEMENTS ---
        elements: {
            appHeader: document.getElementById('app-header'),
            menuBtn: document.getElementById('menu-btn'),
            backArrowBtn: document.getElementById('back-arrow-btn'),
            welcomeName: document.getElementById('welcome-name'),
            homeScanMenuTrigger: document.getElementById('home-scan-menu-trigger'),
            homeScanCount: document.getElementById('home-scan-count'),
            todaysSalesCard: document.getElementById('todays-sales-card'),
            itemsSoldCard: document.getElementById('items-sold-card'),
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

            // Onboarding Elements (UPDATED)
            onboardingStep1: document.getElementById('onboarding-step-1'),
            checkPhoneInput: document.getElementById('check-phone'),
            checkPhoneBtn: document.getElementById('check-phone-btn'),

            onboardingStepLogin: document.getElementById('onboarding-step-login'),
            loginPinInput: document.getElementById('login-pin'),
            loginBtn: document.getElementById('login-btn'),
            toggleLoginPinBtn: document.getElementById('toggle-login-pin'),
            copyLoginPinBtn: document.getElementById('copy-login-pin'),
            backToPhoneBtn: document.getElementById('back-to-phone-btn'),

            onboardingStepRegister: document.getElementById('onboarding-step-register'),
            firstNameInput: document.getElementById('first-name'),
            lastNameInput: document.getElementById('last-name'),
            genderInput: document.getElementById('gender'),
            businessNameInput: document.getElementById('business-name'),
            businessTypeInput: document.getElementById('business-type'),
            businessLocationInput: document.getElementById('business-location'),
            createPinInput: document.getElementById('create-pin'),
            toggleCreatePinBtn: document.getElementById('toggle-create-pin'),
            copyCreatePinBtn: document.getElementById('copy-create-pin'),
            completeRegistrationBtn: document.getElementById('complete-registration-btn'),
            goBackRegisterBtn: document.getElementById('go-back-register-btn'),

            locationPermissionView: document.getElementById('location-permission-view'),
            grantLocationBtn: document.getElementById('grant-location-btn'),
            cameraPermissionView: document.getElementById('camera-permission-view'),
            grantCameraBtn: document.getElementById('grant-camera-btn'),
            homeView: document.getElementById('home-view'),
            homeContent: document.getElementById('home-content'),
            homeDashboardContent: document.getElementById('home-dashboard-content'),
            totalSalesEl: document.getElementById('total-sales'),
            itemsSoldEl: document.getElementById('items-sold'),
            toggleFiguresBtn: document.getElementById('toggle-figures-btn'),
            toggleInventoryFiguresBtn: document.getElementById('toggle-inventory-figures-btn'),
            productTotalValue: document.getElementById('product-total-value'),
            recentSalesList: document.getElementById('recent-sales-list'),
            seeAllContainer: document.getElementById('see-all-container'),
            seeAllSalesBtn: document.getElementById('see-all-sales-btn'),
            seeLastSalesContainer: document.getElementById('see-last-sales-container'),
            seeLastSalesBtn: document.getElementById('see-last-sales-btn'),
            allSalesView: document.getElementById('all-sales-view'),
            allSalesList: document.getElementById('all-sales-list'),
            salesLegend: document.getElementById('sales-legend'),
            productsView: document.getElementById('products-view'),
            productSkuCount: document.getElementById('product-sku-count'),
            productGrid: document.getElementById('product-grid'),
            productSearchContainer: document.getElementById('product-search-container'),
            productSearchInput: document.getElementById('product-search-input'),
            productFilterTabs: document.querySelectorAll('#products-view .product-filter-tabs .filter-tab-btn'),
            addNewProductBtn: document.getElementById('add-new-product-btn'),
            cameraView: document.getElementById('camera-view'),
            cancelScanBtn: document.getElementById('cancel-scan-btn'),
            torchBtn: document.getElementById('torch-btn'),
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
            stockVisibilityRow: document.getElementById('stock-visibility-row'),
            stockVisibilityToggle: document.getElementById('stock-visibility-toggle'),
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
            saveProductBtn: document.getElementById('save-product-btn'),
            confirmSaleModal: document.getElementById('confirm-sale-modal'),
            saleProductImage: document.getElementById('sale-product-image'),
            saleModalTitle: document.getElementById('sale-modal-title'),
            saleProductName: document.getElementById('sale-product-name'),
            saleProductStock: document.getElementById('sale-product-stock'),
            saleQuantityInput: document.getElementById('sale-quantity'),
            saleQuantityLabel: document.getElementById('sale-quantity-label'),
            decreaseQuantityBtn: document.getElementById('decrease-quantity-btn'),
            increaseQuantityBtn: document.getElementById('increase-quantity-btn'),
            saleTotalPrice: document.getElementById('sale-total-price'),
            cancelSaleBtn: document.getElementById('cancel-sale-btn'),
            confirmSaleBtn: document.getElementById('confirm-sale-btn'),
            saleOfflineNotice: document.getElementById('sale-offline-notice'),
            // NEW DOM ELEMENTS FOR TRIPLE TOGGLE
            saleTypeRadios: document.querySelectorAll('input[name="sale_type"]'),
            discountInputContainer: document.getElementById('discount-input-container'),
            discountAmountInput: document.getElementById('discount-amount'),
            discountInputLabel: document.getElementById('discount-input-label'),
            discountInputWrapper: document.getElementById('discount-input-wrapper'),
            inputContactWrapper: document.getElementById('input-contact-wrapper'),
            selectContactBtn: document.getElementById('select-contact-btn'),
            selectedContactName: document.getElementById('selected-contact-name'),
            labelDiscount: document.getElementById('label-discount'),
            labelCredit: document.getElementById('label-credit'),

            installBtn: document.getElementById('add-to-homescreen-btn'),
            receiptActions: document.getElementById('receipt-actions'),
            generateReceiptBtn: document.getElementById('generate-receipt-btn'),
            editSaleBtn: document.getElementById('edit-sale-btn'),
            cancelSelectionBtn: document.getElementById('cancel-selection-btn'),
            selectionModeHint: document.getElementById('selection-mode-hint'),
            receiptModal: document.getElementById('receipt-modal'),
            receiptContent: document.getElementById('receipt-content'),
            shareReceiptBtn: document.getElementById('share-receipt-btn'),
            printReceiptBtn: document.getElementById('print-receipt-btn'),
            closeReceiptBtn: document.getElementById('close-receipt-btn'),
            shareLogBtn: document.getElementById('share-log-btn'),
            phoneTransferModal: document.getElementById('phone-transfer-modal'),
            transferPhoneInput: document.getElementById('transfer-phone-input'),
            cancelPhoneTransferBtn: document.getElementById('cancel-phone-transfer-btn'),
            transferSummary: document.getElementById('transfer-summary'),
            transferInputWrap: document.getElementById('transfer-input-wrap'),
            transferDigitCount: document.getElementById('transfer-digit-count'),
            transferMessage: document.getElementById('transfer-message'),
            transferMessageText: document.getElementById('transfer-message-text'),
            transferUserDetails: document.getElementById('transfer-user-details'),
            transferUserAvatar: document.getElementById('transfer-user-avatar'),
            transferUserName: document.getElementById('transfer-user-name'),
            transferUserBusiness: document.getElementById('transfer-user-business'),
            confirmPhoneTransferBtn: document.getElementById('confirm-phone-transfer-btn'),
            incomingTransferContent: document.getElementById('incoming-transfer-content'),
            incomingTransferChip: document.getElementById('incoming-transfer-chip'),
            declineTransferBtn: document.getElementById('decline-transfer-btn'),
            acceptTransferBtn: document.getElementById('accept-transfer-btn'),
            pinConfirmText: document.getElementById('pin-confirm-text'),
            pinInputWrap: document.getElementById('pin-input-wrap'),
            pinConfirmInput: document.getElementById('pin-confirm-input'),
            pinConfirmError: document.getElementById('pin-confirm-error'),
            pinConfirmOkBtn: document.getElementById('pin-confirm-ok-btn'),
            pinConfirmCancelBtn: document.getElementById('pin-confirm-cancel-btn'),
            inviteCustomerModal: document.getElementById('invite-customer-modal'),
            cancelInviteBtn: document.getElementById('cancel-invite-btn'),
            sendInviteBtn: document.getElementById('send-invite-btn'),
            entryChoiceModal: document.getElementById('entry-choice-modal'),
            entryChoiceTitle: document.getElementById('entry-choice-title'),
            entryChoiceParagraph: document.getElementById('entry-choice-p'),
            cancelEntryChoiceBtn: document.getElementById('cancel-entry-choice-btn'),
            manualEntryBtn: document.getElementById('manual-entry-btn'),
            retrySellScanBtn: document.getElementById('retry-sell-scan-btn'),
            selectFromProductsBtn: document.getElementById('select-from-products-btn'),
            scanSelectFromProductsBtn: document.getElementById('scan-select-from-products-btn'),
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
            stockFilterTabs: document.querySelectorAll('#stock-levels-view .product-filter-tabs .filter-tab-btn'),
            stockViewFilterTabs: document.getElementById('stock-view-filter-tabs'),
            retailerStockView: document.getElementById('retailer-stock-view'),
            salespeopleView: document.getElementById('salespeople-view'),
            refreshStocksBtn: document.getElementById('refresh-stocks-btn'),
            internetNotice: document.getElementById('internet-notice'),
            cartonDetailsModal: document.getElementById('carton-details-modal'),
            cartonDetailsForm: document.getElementById('carton-details-form'),
            cancelCartonDetailsBtn: document.getElementById('cancel-carton-details-btn'),
            allSalesTimeFilter: document.getElementById('all-sales-time-filter'),
            cartonProductNameLabel: document.getElementById('carton-product-name-label'),
            cartonSubunitTypeInput: document.getElementById('carton-subunit-type'),
            cartonSubunitQuantityInput: document.getElementById('carton-subunit-quantity'),
            cartonQuantityLabel: document.getElementById('carton-quantity-label'),
            privacyLink: document.getElementById('privacy-link'), // Original link
            privacyLinkTriggers: document.querySelectorAll('.privacy-link-trigger'), // New class for multiple links
            privacyOkBtn: document.getElementById('privacy-ok-btn'),
            profileModal: document.getElementById('profile-modal'),
            profileName: document.getElementById('profile-name'),
            profileBusiness: document.getElementById('profile-business'),
            profileLocation: document.getElementById('profile-location'),
            profilePhone: document.getElementById('profile-phone'),
            profileRole: document.getElementById('profile-role'),
            getHelpBtn: document.getElementById('get-help-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            cancelProfileBtn: document.getElementById('cancel-profile-btn'),
            toast: document.getElementById('toast'),
            scanTrackerContainer: document.getElementById('scan-tracker-container'),
            scanProgress: document.getElementById('scan-progress'),
            scanCount: document.getElementById('scan-count'),
            scanReward: document.getElementById('scan-reward'),
        },

        // --- APP STATE ---
        state: {
            user: null,
            tempPhone: null, // For onboarding flow
            tempUserCloudData: null, // To store data during login before sync
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
            selectedSaleData: new Map(),
            editingSale: null,
            receiptModel: null, // the receipt on screen, kept as data for sharing
            figuresHidden: false,
            dashFigures: null,
            longPressTimer: null,
            firebaseReady: false,
            retailerListener: null,
            tempProductDataForCarton: null,
            productFilter: 'all',
            stockViewFilter: 'customers',
            acknowledgedSalesData: {},
        },

        // --- INITIALIZATION ---
        async init() {
            this.showLoader();
            this.registerServiceWorker();
            this.handleOnlineStatusChange = this.handleOnlineStatusChange.bind(this);
            window.addEventListener('online', () => {
                if (!this.state.user) return;
                this.ensureFirebase().then(() => { this.checkIncomingTransfers(); this.watchPendingTransfers(); });
            });
            this.setupEventListeners();

            try {
                await DB.init();
                this._requestPersistentStorage();
                await this.initFirebase();

                // Check if user is already logged in locally
                this.state.user = await DB.getUser();

                if (!this.state.user) {
                    this.showView('onboarding-step-1');
                    this.setupInstallBox();
                    this._restorePhoneVerification();
                } else {
                    await this.loadMainApp();
                    this.startRealtimeSync(); // Start listeners for active user
                }
                this.loadCameraScannerInBackground();
            } catch (error) {
                console.error("Critical initialization failed:", error);
                say("Turn off private browsing, then open PikaShot again.", "Cannot start");
            } finally {
                this.hideLoader();
            }
        },

        async initFirebase() {
            try {
                // We use anonymous auth for the connection, but the "user" is defined by phone+pin
                await window.fb.signInAnonymously(window.fb.auth);
                this.state.firebaseReady = true;
                console.log("Firebase anonymous sign-in successful.");
            } catch (error) {
                console.error("Firebase initialization failed:", error);
                this.state.firebaseReady = false;
                say("Some features need internet. Check your connection.", "No internet");
            }
        },

        // --- EVENT LISTENERS ---
        setupEventListeners() {
            this.elements.menuBtn.addEventListener('click', this.showProfileModal.bind(this));
            if (this.elements.homeScanMenuTrigger) {
                this.elements.homeScanMenuTrigger.addEventListener('click', this.showProfileModal.bind(this));
            }
            if (this.elements.todaysSalesCard) {
                this.elements.todaysSalesCard.addEventListener('click', () => this.navigateTo('all-sales-view'));
            }
            if (this.elements.itemsSoldCard) {
                this.elements.itemsSoldCard.addEventListener('click', () => this.navigateTo('all-sales-view'));
            }
            this.elements.backArrowBtn.addEventListener('click', () => history.back());
            window.addEventListener('popstate', this.handlePopState.bind(this));

            // Onboarding Listeners
            this.elements.checkPhoneBtn.addEventListener('click', this.handleCheckPhone.bind(this));

            // Login Screen Listeners
            this.elements.loginBtn.addEventListener('click', this.handleLogin.bind(this));
            this.elements.toggleLoginPinBtn.addEventListener('click', () => this.togglePinVisibility('login-pin', 'toggle-login-pin'));
            this.elements.copyLoginPinBtn.addEventListener('click', () => this.copyPin('login-pin'));
            this.elements.backToPhoneBtn.addEventListener('click', () => {
                this.elements.loginPinInput.value = '';
                this.showView('onboarding-step-1');
            });

            // Registration Screen Listeners
            this.elements.completeRegistrationBtn.addEventListener('click', this.handleRegistration.bind(this));
            this.elements.goBackRegisterBtn.addEventListener('click', () => {
                this._resetVerificationUI();
                this.showView('onboarding-step-1');
            });
            document.getElementById('forgot-pin-btn').addEventListener('click', () => this.handleForgotPin());
            document.getElementById('save-new-pin-btn').addEventListener('click', () => this.handleSaveNewPin());
            document.getElementById('toggle-new-pin').addEventListener('click', () => this.togglePinVisibility('new-pin', 'toggle-new-pin'));
            document.getElementById('wa-new-code').addEventListener('click', async () => {
                const phone = this.state.tempPhone;
                if (!phone) return;
                const purpose = (this._pending && this._pending.purpose) || 'signup';
                try { this._showVerification(await this._newSignupCode(phone, purpose)); }
                catch (error) { console.error('Could not make a new code:', error); say('Check your internet and try again.', 'No internet'); }
            });
            document.getElementById('wa-change').addEventListener('click', () => {
                this._pending = null;
                this._savePending(null);
                this._resetVerificationUI();
                this.elements.checkPhoneInput.value = '';
                this.elements.checkPhoneInput.focus();
            });
            // Business type is picked with three buttons; the choice is kept in the hidden #business-type field
            const typeButtons = document.querySelectorAll('#business-type-options button');
            typeButtons.forEach(btn => btn.addEventListener('click', () => {
                this.elements.businessTypeInput.value = btn.dataset.value;
                btn.parentElement.classList.add('chosen'); // stops the "you can tap these" animation
                typeButtons.forEach(b => {
                    b.classList.toggle('selected', b === btn);
                    b.setAttribute('aria-checked', String(b === btn));
                });
            }));
            this.elements.toggleCreatePinBtn.addEventListener('click', () => this.togglePinVisibility('create-pin', 'toggle-create-pin'));
            this.elements.copyCreatePinBtn.addEventListener('click', () => this.copyPin('create-pin'));

            // Privacy Policy Links
            this.elements.privacyLinkTriggers.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showModal('privacy-policy-modal');
                });
            });
            // Also keep old listener if modal was opened differently
            if (this.elements.privacyLink) {
                this.elements.privacyLink.addEventListener('click', (e) => { e.preventDefault(); this.showModal('privacy-policy-modal'); });
            }
            this.elements.privacyOkBtn.addEventListener('click', () => this.hideModal());

            // ... (Rest of event listeners) ...
            this.elements.grantLocationBtn.addEventListener('click', this.handleLocationPermission.bind(this));
            this.elements.grantCameraBtn.addEventListener('click', this.handleCameraPermission.bind(this));
            this.elements.navButtons.forEach(btn => btn.addEventListener('click', () => this.navigateTo(btn.dataset.view)));
            this.elements.sellItemBtnMain.addEventListener('click', this.startSellScan.bind(this));
            this.elements.addNewProductBtn.addEventListener('click', this.startAddProduct.bind(this));
            this.elements.productForm.addEventListener('submit', this.handleSaveProduct.bind(this));
            this.elements.deleteProductBtn.addEventListener('click', this.handleDeleteProduct.bind(this));
            this.elements.cancelProductFormBtn.addEventListener('click', () => this.hideModal());
            this.elements.cancelScanBtn.addEventListener('click', () => { this.state.isScanCanceled = true; Camera.stop(); history.back(); });
            this.elements.retakePictureBtn.addEventListener('click', this.handleRetakePicture.bind(this));
            this.elements.confirmPictureBtn.addEventListener('click', this.handleConfirmPicture.bind(this));
            this.elements.addChangePictureBtn.addEventListener('click', this.handleAddOrChangePicture.bind(this));
            this.elements.scanNewBarcodeBtn.addEventListener('click', this.startBarcodeAssignmentScan.bind(this));
            this.elements.cancelPictureBtn.addEventListener('click', () => this.hideModal());
            if(this.elements.torchBtn) this.elements.torchBtn.addEventListener('click', () => { Camera.toggleTorch(); });
            this.elements.saleQuantityInput.addEventListener('input', this.updateSaleTotal.bind(this));
            // TRIPLE TOGGLE LISTENERS
            this.elements.saleTypeRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    const saleType = e.target.value;
                    
                    this.elements.labelDiscount.classList.toggle('active', saleType === 'discount');
                    this.elements.labelDiscount.classList.toggle('text-muted', saleType !== 'discount');
                    
                    this.elements.labelCredit.classList.toggle('active', saleType === 'credit');
                    this.elements.labelCredit.classList.toggle('text-muted', saleType !== 'credit');

                    if (saleType === 'default') {
                        this.elements.discountInputContainer.style.display = 'none';
                        this.elements.discountAmountInput.value = '';
                        this.elements.selectedContactName.style.display = 'none';
                        this.elements.selectedContactName.textContent = '';
                        this.state.selectedContact = null;
                        this.updateSaleTotal();
                    } else {
                        this.elements.discountInputContainer.style.display = 'block';
                        if (saleType === 'discount') {
                            this.elements.discountInputLabel.textContent = 'Discount';
                            this.elements.inputContactWrapper.classList.remove('credit-mode');
                            this.elements.selectedContactName.style.display = 'none';
                            this.elements.selectedContactName.textContent = '';
                            this.state.selectedContact = null;
                        } else if (saleType === 'credit') {
                            this.elements.discountInputLabel.textContent = 'Part payment';
                            this.elements.inputContactWrapper.classList.add('credit-mode');
                        }
                        this.elements.discountAmountInput.value = '';
                        this.updateSaleTotal();
                    }
                });
            });
            
            // Contacts API interaction
            this.elements.selectContactBtn.addEventListener('click', async () => {
                const showContactSuccess = () => {
                    this.elements.selectContactBtn.classList.add('success');
                    setTimeout(() => this.elements.selectContactBtn.classList.remove('success'), 2000);
                };
                
                try {
                    const props = ['name', 'tel'];
                    const opts = { multiple: false };
                    if ('contacts' in navigator && 'ContactsManager' in window) {
                        const contacts = await navigator.contacts.select(props, opts);
                        if (contacts.length > 0) {
                            const contactName = contacts[0].name[0];
                            this.state.selectedContact = { name: contactName, phone: contacts[0].tel ? contacts[0].tel[0] : '' };
                            this.elements.selectedContactName.textContent = contactName;
                            this.elements.selectedContactName.style.display = 'block';
                            showContactSuccess();
                        }
                    } else {
                        const name = prompt("Enter customer name:");
                        if (name) {
                            this.state.selectedContact = { name };
                            this.elements.selectedContactName.textContent = name;
                            this.elements.selectedContactName.style.display = 'block';
                            showContactSuccess();
                        }
                    }
                } catch (ex) {
                    console.error("Contacts selection failed", ex);
                    const name = prompt("Enter customer name:");
                    if (name) {
                        this.state.selectedContact = { name };
                        this.elements.selectedContactName.textContent = name;
                        this.elements.selectedContactName.style.display = 'block';
                        showContactSuccess();
                    }
                }
            });

            this.elements.discountAmountInput.addEventListener('input', this.updateSaleTotal.bind(this));

            this.elements.cancelSaleBtn.addEventListener('click', () => {
                const wasEditing = !!this.state.editingSale;
                this.state.editingSale = null;
                this.hideModal();
                if (!wasEditing) this.navigateTo('home-view');
            });
            this.elements.confirmSaleBtn.addEventListener('click', this.handleConfirmSale.bind(this));
            window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt.bind(this));
            this.elements.installBtn.addEventListener('click', this.promptInstall.bind(this));
            this.elements.generateReceiptBtn.addEventListener('click', this.generateReceipt.bind(this));
            this.elements.editSaleBtn.addEventListener('click', this.handleEditSale.bind(this));
            setInterval(() => this.tickEditWindows(), 1000);
            try { this.state.figuresHidden = localStorage.getItem('pikashot_hide_figures') === '1'; } catch (e) { /* storage unavailable */ }
            [this.elements.toggleFiguresBtn, this.elements.toggleInventoryFiguresBtn].forEach(btn => {
                if (btn) btn.addEventListener('click', this.toggleFigures.bind(this));
            });
            Camera.onTorchChange = (on) => { if (this.elements.torchBtn) this.elements.torchBtn.classList.toggle('torch-on', on); };
            // Browsers only allow sound after a user gesture, so unlock audio on the first touch/click.
            ['pointerdown', 'touchstart', 'keydown'].forEach(evt => document.addEventListener(evt, () => this._unlockAudio(), { passive: true }));
            // Call buttons are drawn inside lists that are rebuilt often, so listen once at the top
            document.addEventListener('click', (e) => {
                const link = e.target.closest && e.target.closest('a.retailer-call-btn');
                if (link) this._logCall(link);
            });
            this.elements.seeAllSalesBtn.addEventListener('click', () => this.navigateTo('all-sales-view'));
            this.elements.seeLastSalesBtn.addEventListener('click', () => this.navigateTo('all-sales-view'));
            if(document.getElementById('add-salesperson-fab')) {
                document.getElementById('add-salesperson-fab').addEventListener('click', () => say('This is coming soon.', 'Coming soon'));
            }
            this.elements.allSalesTimeFilter.addEventListener('change', () => {
                if (this.elements.allSalesTimeFilter.value === 'expenses') {
                    say('This is coming soon.', 'Coming soon');
                    this.elements.allSalesTimeFilter.value = 'all';
                }
                this.updateHeader(this.state.currentView);
                this.renderAllSales();
            });
            this.elements.cancelSelectionBtn.addEventListener('click', this.exitSelectionMode.bind(this));
            this.elements.closeReceiptBtn.addEventListener('click', () => this.hideModal());
            this.elements.shareReceiptBtn.addEventListener('click', this.shareReceipt.bind(this));
            this.elements.printReceiptBtn.addEventListener('click', () => window.print());
            this.elements.shareLogBtn.addEventListener('click', this.initiatePhoneTransfer.bind(this));
            this.elements.confirmPhoneTransferBtn.addEventListener('click', this.processPhoneTransfer.bind(this));
            this.elements.cancelPhoneTransferBtn.addEventListener('click', this.closePhoneTransfer.bind(this));
            this.elements.transferMessage.addEventListener('click', () => {
                if (this.elements.transferMessage.classList.contains('error')) this.findUserForTransfer();
            });
            this.elements.transferPhoneInput.addEventListener('input', (e) => {
                const digits = this._localPhone(e.target.value);
                if (e.target.value !== digits) e.target.value = digits;
                this._setTransferState('idle');

                if (digits.length === 11) {
                    e.target.blur(); // a full number needs no more typing: put the keyboard away so Send is in plain view
                    this.findUserForTransfer();
                }
            });
            this.elements.cancelInviteBtn.addEventListener('click', () => {
                this.hideModal();
                this.showModal('phone-transfer-modal');
            });
            this.elements.sendInviteBtn.addEventListener('click', () => {
                this.hideModal();
                this.showToast("Download link sent!");
            });

            // PIN check (used before something is removed for good)
            this.elements.pinConfirmInput.addEventListener('input', (e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                if (e.target.value !== digits) e.target.value = digits;
                this.elements.pinConfirmError.textContent = '';
                this.elements.pinConfirmOkBtn.disabled = digits.length !== 6;
            });
            this.elements.pinConfirmInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this._submitPin(); } });
            this.elements.pinConfirmOkBtn.addEventListener('click', () => this._submitPin());
            this.elements.pinConfirmCancelBtn.addEventListener('click', () => this._finishPin(false));
            this.elements.productSearchInput.addEventListener('input', (e) => this.renderProducts(e.target.value));
            this.elements.cancelEntryChoiceBtn.addEventListener('click', () => this.hideModal());
            this.elements.manualEntryBtn.addEventListener('click', () => { this.hideModal(); this.elements.manualSaleForm.reset(); this.showModal('manual-sale-modal'); });
            this.elements.retrySellScanBtn.addEventListener('click', () => { this.hideModal(); this.startSellScan(); });
            this.elements.cancelManualSaleBtn.addEventListener('click', () => this.hideModal());
            this.elements.manualSaleForm.addEventListener('submit', this.handleManualSale.bind(this));
            this.elements.selectFromProductsBtn.addEventListener('click', this.showProductSelection.bind(this));
            if (this.elements.scanSelectFromProductsBtn) {
                this.elements.scanSelectFromProductsBtn.addEventListener('click', () => {
                    this.state.isScanCanceled = true;
                    Camera.stop();
                    this.showProductSelection();
                });
            }
            // The - and + buttons count in halves (1, 1.5, 2, 2.5 ...) and stop at what is in stock
            const stepSaleQuantity = (direction) => {
                const input = this.elements.saleQuantityInput;
                const current = Math.round(this.unformatNumber(input.value) * 2) / 2;
                const product = this.state.sellingProduct;
                const inStock = product ? product.stock + (this.state.editingSale ? this.state.editingSale.quantity : 0) : Infinity;
                const next = direction < 0 ? Math.max(0.5, current - 0.5) : (current < 0.5 ? 1 : current + 0.5);
                if (direction > 0 && next > inStock) {
                    const box = input.closest('.quantity-stepper');
                    if (box && !box.classList.contains('input-error-shake')) {
                        box.classList.add('input-error-shake');
                        setTimeout(() => box.classList.remove('input-error-shake'), 500);
                    }
                    return;
                }
                input.value = this.formatNumber(next);
                input.dispatchEvent(new Event('input'));
            };
            this._bindHoldRepeat(this.elements.decreaseQuantityBtn, () => stepSaleQuantity(-1));
            this._bindHoldRepeat(this.elements.increaseQuantityBtn, () => stepSaleQuantity(1));
            this.elements.rejectLogBtn.addEventListener('click', () => { this.hideModal(); this.state.scannedLogData = null; });
            this.elements.acceptLogBtn.addEventListener('click', this.acceptPikaLog.bind(this));
            this.elements.declineTransferBtn.addEventListener('click', () => { this.hideModal(); this.state.scannedLogData = null; });
            this.elements.acceptTransferBtn.addEventListener('click', this.acceptPikaLog.bind(this));
            this.elements.retryAddScanBtn.addEventListener('click', () => { this.hideModal(); this.startAddProduct(); });
            this.elements.cancelAddScanBtn.addEventListener('click', () => this.hideModal());
            this.elements.productExistsOkBtn.addEventListener('click', () => this.hideModal());
            this.elements.seeStockLevelsBtn.addEventListener('click', () => this.navigateTo('stock-levels-view'));
            this.elements.refreshStocksBtn.addEventListener('click', this.renderRetailerStocks.bind(this));
            this.elements.cartonDetailsForm.addEventListener('submit', this.handleSaveCartonDetails.bind(this));
            this.elements.cancelCartonDetailsBtn.addEventListener('click', () => { this.hideModal(); this.showModal('product-form-modal'); });
            this.elements.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
            this.elements.cancelProfileBtn.addEventListener('click', () => this.hideModal());

            this.elements.cartonSubunitTypeInput.addEventListener('input', (e) => {
                const selectedUnit = e.target.value;
                if (selectedUnit) {
                    this.elements.cartonQuantityLabel.textContent = `How many ${selectedUnit} per carton?`;
                } else {
                    this.elements.cartonQuantityLabel.textContent = 'How many per carton?';
                }
            });

            this.elements.productFilterTabs.forEach(btn => btn.addEventListener('click', (e) => {
                this.elements.productFilterTabs.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.state.productFilter = e.target.dataset.filter;
                this.renderProducts(this.elements.productSearchInput.value);
            }));

            this.elements.stockFilterTabs.forEach(btn => btn.addEventListener('click', (e) => {
                this.elements.stockFilterTabs.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.state.stockViewFilter = e.target.dataset.filter;
                this.renderRetailerStocks();
            }));

            const fieldsToFormat = [
                this.elements.productPriceInput, this.elements.manualProductPrice,
                this.elements.cartonSubunitQuantityInput,
                this.elements.discountAmountInput // Added discount input
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

            // Stock and quantities can end in ".5" for "and a half" (1.5); any other decimal is ignored
            [this.elements.productStockInput, this.elements.saleQuantityInput, this.elements.manualSaleQuantity].forEach(input => {
                input.addEventListener('input', (e) => {
                    const formatted = this._formatHalves(e.target.value, e.data);
                    if (e.target.value !== formatted) e.target.value = formatted;
                });
                input.addEventListener('blur', (e) => { e.target.value = e.target.value.replace(/\.$/, ''); });
            });

            this.elements.checkPhoneInput.addEventListener('input', (e) => {
                const digits = this._localPhone(e.target.value);
                if (e.target.value !== digits) e.target.value = digits;
            });
            // Enter on the keyboard does the obvious next step
            this.elements.checkPhoneInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.handleCheckPhone(); } });
            this.elements.loginPinInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.handleLogin(); } });
            const newPin = document.getElementById('new-pin');
            newPin.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); });
            newPin.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.handleSaveNewPin(); } });
            this.elements.loginPinInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
            });
            this.elements.createPinInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
            });
        },

        // Any way a Nigerian number gets typed or pasted (+234 803 123 4567, 2348031234567, 803...) becomes 08031234567
        _localPhone(value) {
            let d = String(value || '').replace(/\D/g, '');
            if (d.startsWith('234') && d.length > 11) d = d.slice(3);
            if (d.length === 10 && /^[789]/.test(d)) d = '0' + d;
            return d.slice(0, 11);
        },

        // "1234.5" -> "1,234.5". Only a half may follow the dot ("1." stays while typing, "1.3" drops the 3).
        // `typed` is what was just typed: a comma at the end counts as the dot (some keypads show a comma instead).
        _formatHalves(raw, typed) {
            let text = String(raw);
            if (typed === ',' && text.endsWith(',')) text = text.slice(0, -1) + '.';
            text = text.replace(/,/g, '');
            const dot = text.indexOf('.');
            const whole = (dot < 0 ? text : text.slice(0, dot)).replace(/\D/g, '');
            const shown = whole === '' ? '' : Number(whole).toLocaleString('en-US');
            if (dot < 0) return shown;
            return `${shown || '0'}.${text.slice(dot + 1).replace(/\D/g, '').startsWith('5') ? '5' : ''}`;
        },

        // Runs `action` once on press; if the button stays held down it repeats 14 times a second after a short pause.
        _bindHoldRepeat(btn, action) {
            if (!btn) return;
            const HOLD_MS = 250;
            const REPEAT_MS = Math.round(1000 / 14);
            let pause = null, timer = null;
            const stop = () => { clearTimeout(pause); clearInterval(timer); pause = timer = null; };
            btn.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                stop();
                action();
                pause = setTimeout(() => {
                    timer = setInterval(() => {
                        if (!btn.offsetParent) { stop(); return; } // the modal went away while the button was held
                        action();
                    }, REPEAT_MS);
                }, HOLD_MS);
            });
            ['pointerup', 'pointercancel', 'pointerleave'].forEach(evt => btn.addEventListener(evt, stop));
            btn.addEventListener('blur', stop);
            btn.addEventListener('contextmenu', (e) => e.preventDefault()); // a long press must not open a menu
            // Taps and holds are handled above; a click without a pointer press (keyboard, screen reader) steps once.
            btn.addEventListener('click', (e) => { if (e.detail === 0) action(); });
        },

        // --- AUTH & ONBOARDING LOGIC ---

        async handleCheckPhone() {
            const phone = this.elements.checkPhoneInput.value.trim();
            if (!/^0\d{10}$/.test(phone)) {
                say("Enter your 11-digit WhatsApp number, like 08012345678.", "Check your number");
                return;
            }

            this.showLoader();
            this.state.tempPhone = phone;

            try {
                // Check if user exists in Firestore
                const docRef = window.fb.doc(window.fb.db, 'users', phone);
                const docSnap = await window.fb.getDoc(docRef);

                if (docSnap.exists()) {
                    this.state.tempUserCloudData = docSnap.data();
                    this.showView('onboarding-step-login');
                } else if (this._verifiedOnThisPhone(phone)) {
                    this.showView('onboarding-step-register');
                } else {
                    await this.startPhoneVerification(phone);
                }
            } catch (error) {
                console.error("Error checking phone:", error);
                say("Check your internet and try again.", "No internet");
            } finally {
                this.hideLoader();
            }
        },

        // --- WhatsApp number check for new sign-ups ---
        // The new user sends a 4-digit code to PikaShot on WhatsApp. The admin confirms it on the dashboard,
        // which marks signup_verifications/{phone} as verified and opens Create Account here.
        WA_NUMBER: '2347089319883',
        CODE_TTL_MS: 20 * 60 * 1000,

        _pendingVerification() {
            try { return JSON.parse(localStorage.getItem('pika_signup_code')); } catch (e) { return null; }
        },
        _savePending(pending) {
            try {
                if (pending) localStorage.setItem('pika_signup_code', JSON.stringify(pending));
                else localStorage.removeItem('pika_signup_code');
            } catch (e) { /* private mode: the code just isn't remembered */ }
        },
        _verifiedOnThisPhone(phone) {
            try {
                const v = JSON.parse(localStorage.getItem('pika_verified_phone'));
                return !!v && v.phone === phone && Date.now() - v.at < 24 * 3600000;
            } catch (e) { return false; }
        },
        _verificationRef(phone) { return window.fb.doc(window.fb.db, 'signup_verifications', phone); },

        // purpose: 'signup' (new account) or 'reset' (Forgot PIN). The dashboard shows which one it is.
        async startPhoneVerification(phone, purpose = 'signup') {
            let pending = this._pendingVerification();
            if (!pending || pending.phone !== phone || (pending.purpose || 'signup') !== purpose || Date.now() - pending.createdAt > this.CODE_TTL_MS) pending = null;
            if (pending) {
                const snap = await window.fb.getDoc(this._verificationRef(phone));
                const d = snap.exists() ? snap.data() : null;
                if (d && d.verified && d.code === pending.code) { this._pending = pending; return this._phoneVerified(phone); }
                if (!d || d.code !== pending.code) pending = null; // replaced since: start over
            }
            if (!pending) pending = await this._newSignupCode(phone, purpose);
            this._showVerification(pending);
        },

        async _newSignupCode(phone, purpose = 'signup') {
            const code = String(1000 + (crypto.getRandomValues(new Uint32Array(1))[0] % 9000));
            await window.fb.setDoc(this._verificationRef(phone), { phone, code, purpose, createdAt: window.fb.serverTimestamp(), verified: false });
            const pending = { phone, code, purpose, createdAt: Date.now() };
            this._savePending(pending);
            return pending;
        },

        _showVerification(pending) {
            const el = (id) => document.getElementById(id);
            this.state.tempPhone = pending.phone;
            this.elements.checkPhoneInput.value = pending.phone;
            ['phone-entry', 'signup-intro', 'signup-privacy'].forEach((id) => { el(id).hidden = true; });
            el('wa-verify').hidden = false;
            el('wa-title').textContent = pending.purpose === 'reset' ? 'Reset your PIN' : 'Confirm your number';
            el('wa-phone').textContent = pending.phone;
            // The code is never shown: it travels inside the prefilled WhatsApp message
            el('wa-link').href = `https://wa.me/${this.WA_NUMBER}?text=${encodeURIComponent(`Verify ${pending.code} for PikaShot`)}`;
            this._pending = pending;
            this._verifiedDone = false;
            if (this.state.currentView !== 'onboarding-step-1') this.showView('onboarding-step-1');
            this._tickVerification();
            clearInterval(this._waTimer);
            this._waTimer = setInterval(() => this._tickVerification(), 15000);
            if (this._waUnsub) this._waUnsub();
            this._waUnsub = window.fb.onSnapshot(this._verificationRef(pending.phone), (snap) => {
                const d = snap.exists() ? snap.data() : null;
                if (d && d.verified && d.code === pending.code) this._phoneVerified(pending.phone);
            }, (error) => console.error('Could not watch the number check:', error));
        },

        _tickVerification() {
            const p = this._pending;
            if (!p) return;
            const left = this.CODE_TTL_MS - (Date.now() - p.createdAt);
            const expired = left <= 0;
            document.getElementById('wa-link').classList.toggle('disabled', expired);
            document.getElementById('wa-new-code').hidden = !expired;
            const status = document.getElementById('wa-status');
            status.classList.remove('ok');
            status.textContent = expired
                ? 'This request expired. Tap Try again.'
                : `Then come back here. This screen continues by itself (${Math.ceil(left / 60000)} min left).`;
        },

        _phoneVerified(phone) {
            if (this._verifiedDone) return; // the listener and the startup check can both report it
            this._verifiedDone = true;
            this._stopVerification();
            const reset = !!this._pending && this._pending.purpose === 'reset';
            this.state.tempPhone = phone;
            if (!reset) {
                this._pending = null;
                this._savePending(null);
                try { localStorage.setItem('pika_verified_phone', JSON.stringify({ phone, at: Date.now() })); } catch (e) { /* fine */ }
            } // a PIN reset keeps its record until the new PIN is saved, so closing the app here loses nothing
            const status = document.getElementById('wa-status');
            status.textContent = reset ? 'Confirmed. Opening new PIN…' : 'Confirmed. Opening Create Account…';
            status.classList.add('ok');
            setTimeout(() => {
                this._resetVerificationUI();
                if (reset) {
                    document.getElementById('newpin-phone').textContent = phone;
                    document.getElementById('new-pin').value = '';
                    this.showView('onboarding-step-newpin');
                } else {
                    this.showView('onboarding-step-register');
                }
            }, 900);
        },

        // Forgot PIN: the same WhatsApp check, then a new PIN replaces the old one everywhere
        async handleForgotPin() {
            const phone = this.state.tempPhone;
            if (!phone) { this.showView('onboarding-step-1'); return; }
            this.showLoader();
            try {
                await this.startPhoneVerification(phone, 'reset');
            } catch (error) {
                console.error('Could not start the PIN reset:', error);
                say('Check your internet and try again.', 'No internet');
            } finally {
                this.hideLoader();
            }
        },

        async handleSaveNewPin() {
            const pin = document.getElementById('new-pin').value.trim();
            const phone = this.state.tempPhone;
            const pending = this._pendingVerification();
            if (!/^\d{6}$/.test(pin)) { say('Your PIN must be 6 numbers.', 'Check your PIN'); return; }
            if (!phone || !pending || pending.phone !== phone || pending.purpose !== 'reset') {
                say('Verify your number on WhatsApp first.', 'Verify first');
                this.showView('onboarding-step-1');
                return;
            }
            this.showLoader();
            try {
                const userRef = window.fb.doc(window.fb.db, 'users', phone);
                const snap = await window.fb.getDoc(userRef);
                if (!snap.exists()) throw new Error('Account not found');
                const pinChangedAt = Date.now(); // other phones compare this and log themselves out
                await window.fb.updateDoc(userRef, { pin, pinChangedAt });
                // Spend the WhatsApp confirmation so it cannot open this screen again
                await window.fb.setDoc(this._verificationRef(phone), { phone, code: 'used', purpose: 'reset', createdAt: window.fb.serverTimestamp(), verified: false });
                this._pending = null;
                this._savePending(null);
                document.getElementById('new-pin').value = '';

                this.state.user = { ...snap.data(), pin, pinChangedAt };
                await DB.saveUser(this.state.user);
                const synced = await DB.syncDataFromCloud(phone);
                if (!synced) say('Your new PIN works. Some data will finish syncing soon.', 'PIN saved');
                await this.loadMainApp();
                this.startRealtimeSync();
                this.showToast('New PIN saved.');
            } catch (error) {
                console.error('Could not save the new PIN:', error);
                say('Your PIN was not saved. Check your internet and try again.', 'Not saved');
            } finally {
                this.hideLoader();
            }
        },

        _stopVerification() {
            clearInterval(this._waTimer);
            if (this._waUnsub) { this._waUnsub(); this._waUnsub = null; }
        },

        _resetVerificationUI() {
            this._stopVerification();
            ['phone-entry', 'signup-intro', 'signup-privacy'].forEach((id) => { document.getElementById(id).hidden = false; });
            document.getElementById('wa-verify').hidden = true;
        },

        // A code is still waiting after the app was closed (people often switch to WhatsApp and back)
        async _restorePhoneVerification() {
            const p = this._pendingVerification();
            if (!p || !p.phone) return;
            if (Date.now() - p.createdAt > this.CODE_TTL_MS * 3) { this._savePending(null); return; }
            try {
                const snap = await window.fb.getDoc(this._verificationRef(p.phone));
                const d = snap.exists() ? snap.data() : null;
                if (d && d.verified && d.code === p.code) { this._pending = p; this._phoneVerified(p.phone); return; }
            } catch (e) { /* offline: show the code anyway */ }
            this._showVerification(p);
        },

        // A PIN reset on another phone logs this one out (it still knows only the old PIN)
        _watchPinChange() {
            if (this._pinWatch) { this._pinWatch(); this._pinWatch = null; }
            const user = this.state.user;
            if (!user || !user.phone || !this.state.firebaseReady) return;
            this._pinWatch = window.fb.onSnapshot(window.fb.doc(window.fb.db, 'users', user.phone), (snap) => {
                if (!snap.exists() || !this.state.user) return;
                const changed = Number(snap.data().pinChangedAt) || 0;
                if (changed > (Number(this.state.user.pinChangedAt) || 0)) {
                    this._doLogout().then(() => say('Your PIN was changed on another phone. Log in with your new PIN.', 'Log in again'));
                }
            }, (error) => console.error('Could not watch for PIN changes:', error));
        },

        // --- Install as a proper Android app ---
        // Chrome's own install (the beforeinstallprompt event) makes a real app that shows in the app list,
        // so the small sign-up button only appears when Chrome offers that; a home-screen shortcut is never suggested.
        setupInstallBox() {
            const btn = document.getElementById('signup-install-btn');
            if (!btn) return;
            this._updateInstallBox = () => { btn.hidden = !this.state.deferredInstallPrompt; };
            btn.addEventListener('click', () => this.promptInstall());
            window.addEventListener('appinstalled', () => { btn.hidden = true; });
            this._updateInstallBox();
        },

        togglePinVisibility(inputId, btnId) {
            const input = document.getElementById(inputId);
            const btn = document.getElementById(btnId);
            const isPassword = input.type === "password";

            input.type = isPassword ? "text" : "password";

            // Dynamic SVG swap
            if (isPassword) {
                // Switch to "Eye Off" (Hide) icon
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M1 1l22 22"></path><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"></path></svg>`;
            } else {
                // Switch back to "Eye" (Show) icon
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
            }
        },

        copyPin(inputId) {
            const input = document.getElementById(inputId);
            const pin = input.value;
            if (pin) {
                navigator.clipboard.writeText(pin).then(() => {
                    this.showToast("PIN copied to clipboard");
                });
            } else {
                this.showToast("Nothing to copy");
            }
        },

        async handleLogin() {
            const pin = this.elements.loginPinInput.value.trim();
            if (pin.length !== 6) {
                say("Enter your 6-digit PIN.", "Check your PIN");
                return;
            }

            // Verify PIN against cloud data
            if (this.state.tempUserCloudData && String(this.state.tempUserCloudData.pin) === pin) {
                this.showLoader();
                // Login successful
                this.state.user = this.state.tempUserCloudData;
                await DB.saveUser(this.state.user); // Save locally

                // Sync data
                const success = await DB.syncDataFromCloud(this.state.tempPhone);
                if (!success) {
                    say("You are in. Some data will finish syncing soon.", "Logged in");
                }

                this.elements.loginPinInput.value = '';
                await this.loadMainApp();
                this.startRealtimeSync(); // Start listeners
                this.hideLoader();
            } else {
                say("That PIN is wrong. Try again.", "Wrong PIN");
                this.elements.loginPinInput.value = '';
            }
        },

        async handleRegistration() {
            const firstName = this.elements.firstNameInput.value.trim();
            const lastName = this.elements.lastNameInput.value.trim();
            const name = firstName + (lastName ? ' ' + lastName : '');
            const gender = this.elements.genderInput.value;
            const business = this.elements.businessNameInput.value.trim();
            const type = this.elements.businessTypeInput.value;
            const location = this.elements.businessLocationInput.value;
            const pin = this.elements.createPinInput.value.trim();

            if (!firstName || !lastName || !gender || !business || !type || !location || pin.length !== 6) {
                say('Fill in every box. Your PIN must be 6 numbers.', 'Check your details'); return;
            }

            this.showLoader();
            const uid = window.fb.auth.currentUser ? window.fb.auth.currentUser.uid : null;

            const newUser = {
                id: 1, // Local ID
                phone: this.state.tempPhone,
                pin: pin,
                name, gender, business, type, location, uid,
                createdAt: window.fb.serverTimestamp()
            };

            try {
                // Save to IndexedDB and Sync to Cloud (handled by db.js)
                await DB.saveUser(newUser);
                this.state.user = newUser;
                try { localStorage.removeItem('pika_verified_phone'); } catch (e) { /* fine */ }

                this.showView('location-permission-view');
            } catch (error) {
                console.error("Registration failed:", error);
                say("Your account was not created. Please try again.", "Something went wrong");
            } finally {
                this.hideLoader();
            }
        },

        // --- CORE APP LOGIC (Updated) ---
        async loadMainApp() {
            this.elements.appHeader.style.display = 'flex';
            this.elements.mainContent.style.display = 'block';
            this.elements.bottomNav.style.display = 'flex';

            const initialView = window.location.hash.substring(1) || 'home-view';
            history.replaceState({ view: initialView }, '', `#${initialView}`);
            this.navigateTo(initialView, true);

            await this.updateDashboard();
            await this.renderProducts();
            this._backfillGeo();
        },

        // --- Incoming transfers -------------------------------------------------------------------
        _incomingTransfersQuery() {
            return window.fb.query(
                window.fb.collection(window.fb.db, 'shared_logs'),
                window.fb.where('targetPhone', '==', this.state.user.phone),
                window.fb.where('claimed', '==', false)
            );
        },

        // Live listener that survives errors: it reconnects with a growing pause instead of silently dying.
        _listenForIncomingTransfers() {
            if (!this.state.firebaseReady || !this.state.user || !this.state.user.phone) return;
            const phone = this.state.user.phone;
            if (this._transfersListener) { this._transfersListener(); this._transfersListener = null; }
            clearTimeout(this._transfersRetryTimer);
            try {
                this._transfersListener = window.fb.onSnapshot(this._incomingTransfersQuery(), (snapshot) => {
                    this._transfersRetryDelay = 2000; // healthy again
                    snapshot.docChanges().forEach((change) => {
                        if (change.type !== 'added') return;
                        const logData = change.doc.data();
                        logData.id = change.doc.id;
                        this._queueIncomingTransfer(logData);
                    });
                }, (error) => {
                    console.error('Incoming transfer listener error, will reconnect:', error);
                    this._transfersRetryDelay = Math.min((this._transfersRetryDelay || 2000) * 2, 60000);
                    this._transfersRetryTimer = setTimeout(() => {
                        if (this.state.user && this.state.user.phone === phone) this._listenForIncomingTransfers();
                    }, this._transfersRetryDelay);
                });
            } catch (error) {
                console.error("Error setting up transfer listener:", error);
            }
        },

        // One-off catch-up read (app returned to the foreground, connection came back, ...)
        async checkIncomingTransfers() {
            if (!this.state.firebaseReady || !this.state.user || !this.state.user.phone) return;
            try {
                const snapshot = await window.fb.getDocs(this._incomingTransfersQuery());
                snapshot.forEach((d) => {
                    const logData = d.data();
                    logData.id = d.id;
                    this._queueIncomingTransfer(logData);
                });
            } catch (error) {
                console.error('Could not check for incoming transfers:', error);
            }
        },

        _queueIncomingTransfer(logData) {
            if (!logData || !logData.id || logData.voided || logData.claimed) return;
            if (!this._promptedTransfers) this._promptedTransfers = new Set();
            if (this._promptedTransfers.has(logData.id)) return; // already shown this session
            this._promptedTransfers.add(logData.id);
            this._presentIncomingTransfer(logData, 0);
        },

        // Never pop the accept screen over something the user is in the middle of (a sale, a scan, a form)
        _presentIncomingTransfer(logData, attempt) {
            if (!this.state.user || logData.targetPhone !== this.state.user.phone) return;
            const busy = this.elements.modalContainer.style.display === 'flex' || this.state.currentView === 'camera-view';
            if (busy && attempt < 150) {
                setTimeout(() => this._presentIncomingTransfer(logData, attempt + 1), 2000);
                return;
            }
            this.handlePikaLogScanned(logData);
        },

        // If the first sign-in failed (e.g. the app was opened offline) try again once we can, then start syncing.
        async ensureFirebase() {
            if (this.state.firebaseReady || !navigator.onLine) return this.state.firebaseReady;
            if (this._ensuringFirebase) return this._ensuringFirebase;
            this._ensuringFirebase = (async () => {
                try {
                    await window.fb.signInAnonymously(window.fb.auth);
                    this.state.firebaseReady = true;
                    if (this.state.user && this.state.user.phone) this.startRealtimeSync();
                } catch (error) {
                    console.error('Firebase retry failed:', error);
                } finally {
                    this._ensuringFirebase = null;
                }
                return this.state.firebaseReady;
            })();
            return this._ensuringFirebase;
        },

        startRealtimeSync() {
            if (this.state.user && this.state.user.phone) {
                DB.setupRealtimeListeners(
                    this.state.user.phone,
                    () => { // On Products Change
                        this.renderProducts(this.elements.productSearchInput.value);
                    },
                    () => { // On Sales Change
                        this.updateDashboard();
                        this.watchPendingTransfers();
                        if (this.state.currentView === 'all-sales-view') {
                            this.renderAllSales();
                        }
                    }
                );

                this._listenForIncomingTransfers();
                this._watchPinChange();

                this.watchPendingTransfers();

                // Re-fetch sales when user returns to the app tab
                // This catches any sales missed while the listener was disconnected
                if (this._visibilityHandler) {
                    document.removeEventListener('visibilitychange', this._visibilityHandler);
                }
                this._visibilityHandler = async () => {
                    if (document.visibilityState === 'visible' && this.state.user) {
                        this.ensureFirebase().then(() => this.checkIncomingTransfers());
                        await DB.resyncSalesFromCloud();
                        this.updateDashboard();
                        if (this.state.currentView === 'all-sales-view') {
                            this.renderAllSales();
                        }
                    }
                };
                document.addEventListener('visibilitychange', this._visibilityHandler);
            }
        },

        async handleLogout() {
            if (await ask({ title: 'Log out', text: 'Are you sure you want to log out?', ok: 'Log out', cancel: 'Cancel', danger: true })) {
                await this._doLogout();
            }
        },

        async _doLogout() {
            {
                if (this._pinWatch) { this._pinWatch(); this._pinWatch = null; }
                await DB.clearUser(); // This also stops realtime listeners
                this.stopWatchingTransfers();
                if (this._transfersListener) { this._transfersListener(); this._transfersListener = null; }
                clearTimeout(this._transfersRetryTimer);
                this._promptedTransfers = null;
                if (this._visibilityHandler) {
                    document.removeEventListener('visibilitychange', this._visibilityHandler);
                    this._visibilityHandler = null;
                }
                this.state.user = null;
                this.state.tempPhone = null;
                this.state.tempUserCloudData = null;
                this.hideModal();

                // Reset views
                this.elements.appHeader.style.display = 'none';
                this.elements.mainContent.style.display = 'none';
                this.elements.bottomNav.style.display = 'none';
                this.elements.checkPhoneInput.value = '';
                this.elements.loginPinInput.value = '';
                this._resetVerificationUI();

                this.showView('onboarding-step-1');
            }
        },

        showLoader() { this.elements.loader.style.display = 'flex'; this.elements.appContainer.style.display = 'none'; },
        hideLoader() { this.elements.loaderSpinner.style.display = 'none'; this.elements.loaderCheck.style.display = 'block'; setTimeout(() => { this.elements.loader.style.opacity = '0'; this.elements.appContainer.style.display = 'flex'; setTimeout(() => { this.elements.loader.style.display = 'none'; }, 500); }, 500); },
        showView(viewId) {
            if (this.state.currentView === viewId) return;
            this.elements.views.forEach(view => view.classList.remove('active'));
            const viewToShow = document.getElementById(viewId);
            if (viewToShow) {
                viewToShow.classList.add('active');
                this.state.currentView = viewId;
                if (!viewId.includes('onboarding') && viewId !== 'location-permission-view' && viewId !== 'camera-permission-view') {
                    this.updateHeader(viewId);
                }
            }
            if (this.toggleOnboardingTooltip) this.toggleOnboardingTooltip();
        },
        showModal(modalId) { this.elements.modalContainer.style.display = 'flex'; this.elements.modalContainer.querySelectorAll('.modal-content').forEach(m => m.style.display = 'none'); const modalToShow = document.getElementById(modalId); if (modalToShow) { modalToShow.style.display = 'flex'; } this._followKeyboard(true); },
        // PikaShot's own pop-up for messages and questions. It sits above any open modal (that one stays as it was).
        // Resolves true for the main button, false for cancel, Esc, back or a tap outside.
        _dialog({ title = '', text = '', ok = 'OK', cancel = '', danger = false }) {
            const $ = (id) => document.getElementById(id);
            const layer = $('dialog-layer'), okBtn = $('dialog-ok'), cancelBtn = $('dialog-cancel');
            if (this._closeDialog) this._closeDialog(false); // a newer message replaces an older one
            $('dialog-title').textContent = title;
            $('dialog-title').hidden = !title;
            $('dialog-text').textContent = text;
            okBtn.textContent = ok;
            okBtn.className = `btn ${danger ? 'btn-danger' : 'btn-primary'}`;
            cancelBtn.textContent = cancel;
            cancelBtn.hidden = !cancel;
            layer.style.display = 'flex';
            if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); // puts the keyboard away
            return new Promise((resolve) => {
                const finish = (answer) => {
                    layer.style.display = 'none';
                    layer.onclick = okBtn.onclick = cancelBtn.onclick = null;
                    document.removeEventListener('keydown', onKey, true);
                    window.removeEventListener('popstate', onBack);
                    this._closeDialog = null;
                    resolve(answer);
                };
                const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); finish(false); } };
                const onBack = () => finish(false);
                okBtn.onclick = () => finish(true);
                cancelBtn.onclick = () => finish(false);
                layer.onclick = (e) => { if (e.target === layer) finish(false); };
                document.addEventListener('keydown', onKey, true);
                window.addEventListener('popstate', onBack);
                this._closeDialog = finish;
                (danger && cancel ? cancelBtn : okBtn).focus({ preventScroll: true }); // a risky question starts on "Cancel"
            });
        },
        _say(text, title = 'Please check') { return this._dialog({ title, text }); },
        _ask(options) { return this._dialog(options); },
        hideModal() { this.elements.modalContainer.style.display = 'none'; this.elements.modalContainer.querySelectorAll('.modal-content').forEach(m => m.style.display = 'none'); this._followKeyboard(false); },

        // While on, the modal layer is sized to the part of the screen that is not under the on-screen keyboard,
        // so a centered modal always sits fully above it.
        _followKeyboard(on) {
            const vv = window.visualViewport;
            const box = this.elements.modalContainer;
            if (!vv) return;
            if (!this._keyboardFit) {
                this._keyboardFit = () => {
                    const visible = window.visualViewport;
                    box.style.top = `${visible.offsetTop}px`;
                    box.style.height = `${visible.height}px`;
                };
            }
            vv.removeEventListener('resize', this._keyboardFit);
            vv.removeEventListener('scroll', this._keyboardFit);
            if (!this._keepFieldInView) {
                // once the keyboard has opened, scroll the field being typed in to the middle of the modal
                this._keepFieldInView = (e) => {
                    const field = e.target;
                    if (!field.matches || !field.matches('input:not([type=checkbox]):not([type=radio]), select, textarea')) return;
                    setTimeout(() => field.scrollIntoView({ block: 'center', behavior: 'smooth' }), 350);
                };
                box.addEventListener('focusin', this._keepFieldInView);
            }
            if (on) {
                vv.addEventListener('resize', this._keyboardFit);
                vv.addEventListener('scroll', this._keyboardFit);
                this._keyboardFit();
            } else {
                box.style.top = '';
                box.style.height = '';
            }
        },
        // Asks for the account PIN. Resolves true only when it matches, false if the person backs out.
        requestPin(message) {
            return new Promise((resolve) => {
                if (this._pinResolve) this._pinResolve(false); // a PIN check that was left open is dropped
                this._pinResolve = resolve;
                const el = this.elements;
                el.pinConfirmText.textContent = message;
                el.pinConfirmInput.value = '';
                el.pinConfirmError.textContent = '';
                el.pinConfirmOkBtn.disabled = true;
                this.showModal('pin-confirm-modal');
                setTimeout(() => el.pinConfirmInput.focus(), 80);
            });
        },

        _finishPin(ok) {
            const resolve = this._pinResolve;
            this._pinResolve = null;
            this.elements.pinConfirmInput.value = '';
            this.elements.pinConfirmInput.blur();
            this.hideModal();
            if (resolve) resolve(ok);
        },

        async _submitPin() {
            const el = this.elements;
            const entered = el.pinConfirmInput.value.trim();
            if (entered.length !== 6 || el.pinConfirmOkBtn.disabled) return;
            el.pinConfirmOkBtn.disabled = true;
            const real = await this._getAccountPin();
            if (real === null) {
                el.pinConfirmError.textContent = "Couldn't check your PIN. Try again.";
                el.pinConfirmOkBtn.disabled = false;
                return;
            }
            if (entered === real) {
                this._finishPin(true);
                return;
            }
            el.pinConfirmError.textContent = 'Wrong PIN. Try again.';
            el.pinConfirmInput.value = '';
            el.pinInputWrap.classList.add('input-error-shake');
            setTimeout(() => el.pinInputWrap.classList.remove('input-error-shake'), 600);
            el.pinConfirmInput.focus();
        },

        // The PIN saved on this phone; if this sign-in did not keep one, read it from the account
        async _getAccountPin() {
            const user = this.state.user || {};
            if (user.pin !== undefined && user.pin !== null && String(user.pin) !== '') return String(user.pin);
            try {
                if (user.phone && window.fb) {
                    const snap = await window.fb.getDoc(window.fb.doc(window.fb.db, 'users', user.phone));
                    if (snap.exists() && snap.data().pin) return String(snap.data().pin);
                }
            } catch (error) {
                console.error('Could not read the account PIN:', error);
            }
            return null;
        },

        toggleOnboardingTooltip() {
            const tooltip = document.getElementById('onboarding-tooltip');
            if (!tooltip) return;
            if (this.state.currentView === 'home-view' && this.state.productCount === 0) {
                tooltip.style.display = 'block';
            } else {
                tooltip.style.display = 'none';
            }
        },
        showToast(message) {
            this.elements.toast.textContent = message;
            this.elements.toast.classList.add('show');
            setTimeout(() => {
                this.elements.toast.classList.remove('show');
            }, 3000);
        },

        async navigateTo(viewId, isBackNavigation = false) {
            if (this.state.currentView === 'camera-view') {
                document.querySelector('#camera-overlay .scan-box').style.display = 'block';
                this.elements.scanFeedback.textContent = 'Scanning for barcode...';
            }

            if (this.state.currentView === viewId && !isBackNavigation) return;

            if (!isBackNavigation) {
                history.pushState({ view: viewId }, '', `#${viewId}`);
            }

            if (this.state.productSelectionMode && viewId !== 'products-view') {
                this.state.productSelectionMode = false;
            }

            if (viewId === 'all-sales-view') {
                if (this.state.user.type === 'Salesperson') {
                    await this.fetchAcknowledgedSales();
                }
                this.elements.allSalesTimeFilter.value = 'all';
                this.renderAllSales();
            }

            if (viewId === 'stock-levels-view') {
                this.renderRetailerStocks();
                window.addEventListener('online', this.handleOnlineStatusChange);
                window.addEventListener('offline', this.handleOnlineStatusChange);
            } else {
                window.removeEventListener('online', this.handleOnlineStatusChange);
                window.removeEventListener('offline', this.handleOnlineStatusChange);
                if (this.state.retailerListener) {
                    this.state.retailerListener();
                    this.state.retailerListener = null;
                }
            }

            if (viewId === 'products-view' && !this.state.productSelectionMode) {
                this.elements.productSearchInput.value = '';
                this.state.productFilter = 'all';
                this.elements.productFilterTabs.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.filter === 'all');
                });
                this.renderProducts();
            }

            this.showView(viewId);
            this.elements.navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewId));

            if (viewId === 'home-view') {
                this.elements.menuBtn.style.display = 'block';
                this.elements.backArrowBtn.style.display = 'none';
            } else {
                this.elements.menuBtn.style.display = 'none';
                this.elements.backArrowBtn.style.display = 'block';
            }

            this.elements.productsView.classList.toggle('selection-mode', this.state.productSelectionMode);
            this.elements.addNewProductBtn.style.display = (this.state.productSelectionMode || viewId !== 'products-view' || (this.state.user && this.state.user.type === 'Salesperson')) ? 'none' : 'flex';

            this.exitSelectionMode();
        },

        handlePopState(event) {
            const viewId = (event.state && event.state.view) || 'home-view';
            this.navigateTo(viewId, true);
        },

        handleOnlineStatusChange() {
            if (this.state.currentView === 'stock-levels-view') {
                this.renderRetailerStocks();
            }
        },

        updateHeader(viewId) {
            let title = 'PikaShot';
            if (this.state.productSelectionMode && viewId === 'products-view') {
                title = 'Select a Product';
            } else {
                const titles = { 'home-view': 'My Shop', 'products-view': 'My Products', 'all-sales-view': 'All Sales', 'stock-levels-view': 'Customers & Salespeople' };
                if (this.state.user && this.state.user.type === 'Salesperson' && viewId === 'stock-levels-view') {
                    title = 'Customers';
                } else if (viewId === 'all-sales-view') {
                    const filterVal = this.elements.allSalesTimeFilter.value;
                    const selectedOption = this.elements.allSalesTimeFilter.options[this.elements.allSalesTimeFilter.selectedIndex];
                    if (filterVal === 'best-selling') {
                        title = 'Best selling';
                    } else if (selectedOption) {
                        title = selectedOption.text;
                    } else {
                        title = 'All Sales';
                    }
                } else {
                    title = titles[viewId] || 'PikaShot';
                }
            }
            this.elements.headerTitle.textContent = title;
            
            if (viewId === 'all-sales-view') {
                this.elements.allSalesTimeFilter.style.display = 'inline-block';
            } else {
                this.elements.allSalesTimeFilter.style.display = 'none';
            }
        },

        async updateDashboard() {
            if (this.state.user) {
                this.elements.welcomeName.textContent = `Hi, ${this.state.user.name.split(' ')[0]}.`;
                if (this.state.user.type === 'Wholesaler' || this.state.user.type === 'Salesperson' || this.state.user.type === 'Retailer') {
                    this.elements.seeStockLevelsContainer.style.display = 'block';
                    const buttonText = this.state.user.type === 'Salesperson' ? 'Customers' : 'Customers & Salespeople';
                    this.elements.seeStockLevelsBtn.innerHTML = `${buttonText} <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="arrow-icon"><polyline points="9 18 15 12 9 6"></polyline></svg>`;
                    this.elements.shareLogBtn.style.display = this.state.user.type === 'Retailer' ? 'none' : 'block';
                } else {
                    this.elements.seeStockLevelsContainer.style.display = 'none';
                    this.elements.shareLogBtn.style.display = 'none';
                }
            }
            const date = new Date();
            this.elements.welcomeDate.textContent = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

            const scanCount = await DB.getScanCountForToday();
            if (this.elements.homeScanCount) {
                this.elements.homeScanCount.textContent = `${scanCount}/100+`;
            }

            const todaysSales = await DB.getSalesToday();
            const totalSales = todaysSales.reduce((sum, sale) => sum + sale.total, 0);
            const itemsSold = todaysSales.reduce((sum, sale) => sum + sale.quantity, 0);
            this.state.dashFigures = { total: `₦${this.formatNumber(totalSales)}`, items: this.formatNumber(itemsSold) };
            this.applyFigureVisibility();

            this.elements.seeAllContainer.style.display = todaysSales.length > 6 ? 'block' : 'none';
            this.elements.selectionModeHint.style.display = todaysSales.length > 0 ? 'block' : 'none';

            // Logic for "See last sales" button
            const allSales = await DB.getAllSales();
            const previousSalesExist = allSales.length > todaysSales.length;

            if (previousSalesExist && todaysSales.length <= 6) {
                this.elements.seeLastSalesContainer.style.display = 'block';
            } else {
                this.elements.seeLastSalesContainer.style.display = 'none';
            }

            if (todaysSales.length === 0) {
                this.elements.recentSalesList.innerHTML = `<p class="empty-state">No sales recorded today.</p>`;
            } else {
                await this.renderSalesList(todaysSales, this.elements.recentSalesList, 6);
            }

            // From the third sale, give the page the height of a six-sale day so it scrolls comfortably
            const list = this.elements.recentSalesList;
            if (todaysSales.length >= 3 && todaysSales.length < 6) {
                const firstItem = list.querySelector('.sale-item');
                const rowHeight = ((firstItem && firstItem.offsetHeight) || 64) + 10; // item + its bottom margin
                list.style.minHeight = `${rowHeight * 6}px`;
            } else {
                list.style.minHeight = '';
            }
        },

        applyFigureVisibility() {
            const hidden = this.state.figuresHidden;
            const figures = this.state.dashFigures;
            if (figures) {
                this.elements.totalSalesEl.textContent = hidden ? '***' : figures.total;
                this.elements.itemsSoldEl.textContent = hidden ? '***' : figures.items;
            }

            // The total worth of the inventory (My Products) follows the same hide / show choice
            const inventory = this.state.inventoryValue;
            if (this.elements.productTotalValue) {
                this.elements.productTotalValue.textContent = inventory == null ? '' : (hidden ? '***' : inventory);
            }
            if (this.elements.toggleInventoryFiguresBtn) {
                this.elements.toggleInventoryFiguresBtn.style.display = inventory == null ? 'none' : '';
            }

            [this.elements.toggleFiguresBtn, this.elements.toggleInventoryFiguresBtn].forEach(btn => {
                if (!btn) return;
                btn.setAttribute('aria-pressed', String(hidden));
                btn.setAttribute('aria-label', hidden ? 'Show figures' : 'Hide figures');
                const open = btn.querySelector('.eye-open'), closed = btn.querySelector('.eye-closed');
                if (open) open.style.display = hidden ? 'none' : '';
                if (closed) closed.style.display = hidden ? '' : 'none';
            });
        },

        toggleFigures(e) {
            e.stopPropagation(); // the card itself opens All Sales
            this.state.figuresHidden = !this.state.figuresHidden;
            try { localStorage.setItem('pikashot_hide_figures', this.state.figuresHidden ? '1' : '0'); } catch (err) { /* storage unavailable */ }
            this.applyFigureVisibility();
        },

        // Small vertical labels outside the sale box: Edited / Discounted / Credit on the right (Edited wins),
        // Transferred (once the recipient accepted) on the left.
        _saleSideLabels(sale) {
            let right = null;
            if (sale.edited) right = { text: 'Edited', cls: 'edited' };
            else if (sale.saleType === 'credit') right = { text: 'Credit', cls: 'credit' };
            else if (sale.saleType === 'discount' || sale.discount > 0) right = { text: 'Discounted', cls: 'discounted' };
            const left = sale.sharedAsLog ? { text: 'Transferred', cls: 'transferred' } : null;
            return { right, left };
        },

        _appendSaleEl(container, saleEl, sale) {
            const { right, left } = this._saleSideLabels(sale);
            if (!right && !left) { container.appendChild(saleEl); return; }
            const row = document.createElement('div');
            row.className = 'sale-row';
            row.appendChild(saleEl);
            [[right, 'right'], [left, 'left']].forEach(([label, side]) => {
                if (!label) return;
                const tag = document.createElement('span');
                tag.className = `sale-tag ${side} ${label.cls}`;
                tag.textContent = label.text;
                row.appendChild(tag);
            });
            container.appendChild(row);
        },

        async renderSalesList(sales, targetElement, limit) {
            targetElement.innerHTML = '';
            const sortedSales = sales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const salesToRender = limit ? sortedSales.slice(0, limit) : sortedSales;

            if (salesToRender.length === 0) {
                targetElement.innerHTML = `<p class="empty-state">Record some sales to see them here.</p>`;
                return;
            }

            // Fetch all products once to look up images by productId
            const allProducts = await DB.getAllProducts();
            const productMap = {};
            allProducts.forEach(p => { productMap[p.id] = p; });

            salesToRender.forEach(sale => {
                const saleEl = document.createElement('div');
                saleEl.className = 'sale-item';
                if (sale.sharedAsLog) {
                    saleEl.classList.add('shared-log');
                }
                saleEl.dataset.saleId = sale.id;
                // The picture the product had when it was sold; only older sales without one use the product's current picture
                const matchedProduct = productMap[sale.productId];
                const imageBlob = sale.image || (matchedProduct && matchedProduct.image);
                const imageUrl = imageBlob ? URL.createObjectURL(imageBlob) : 'icons/icon-192.png';

                // Add discount marker if applicable
                let discountMark = '';
                if (sale.saleType === 'credit') {
                    discountMark = '<sup class="discount-mark" style="color:red;">**</sup>';
                } else if (sale.discount && sale.discount > 0) {
                    discountMark = '<sup class="discount-mark">**</sup>';
                }

                saleEl.innerHTML = `<div class="sale-item-overlay">Previously Transferred</div><img src="${imageUrl}" alt="${sale.productName}"><div class="sale-info"><p>${sale.productName}</p><span>${this.formatNumber(sale.quantity)} x &#8358;${this.formatNumber(sale.price)}</span></div><p class="sale-price">${discountMark}&#8358;${this.formatNumber(sale.total)}</p>${this._saleEditExtrasHtml(sale)}`;

                this.addSaleItemEventListeners(saleEl, sale);
                this._appendSaleEl(targetElement, saleEl, sale);
            });
        },

        async renderAllSales() {
            let allSales = await DB.getAllSales();
            
            const filterValue = this.elements.allSalesTimeFilter.value;

            const sortedSales = allSales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            this.elements.allSalesList.innerHTML = '';

            if (this.state.user.type === 'Salesperson') {
                this.elements.salesLegend.style.display = 'block';
            } else {
                this.elements.salesLegend.style.display = 'none';
            }

            if (sortedSales.length === 0) {
                this.elements.allSalesList.innerHTML = `<p class="empty-state">Record some sales to see them here.</p>`;
                return;
            }

            // Fetch all products once to look up images by productId
            const allProducts = await DB.getAllProducts();
            const productMap = {};
            allProducts.forEach(p => { productMap[p.id] = p; });

            let groupedSales;
            if (filterValue === 'weekly') {
                groupedSales = this.groupSalesByWeek(sortedSales);
            } else if (filterValue === 'monthly') {
                groupedSales = this.groupSalesByMonth(sortedSales);
            } else if (filterValue === 'best-selling') {
                groupedSales = this.groupBestSellingByMonth(sortedSales);
            } else {
                groupedSales = this.groupSalesByDate(sortedSales);
            }
            
            for (const groupTitle in groupedSales) {
                const groupContainer = document.createElement('div');
                groupContainer.className = 'sales-group';

                const dailyTotal = groupedSales[groupTitle].reduce((sum, sale) => sum + sale.total, 0);

                const groupHeader = document.createElement('div');
                groupHeader.className = 'sales-group-header';

                const safeDateKey = groupTitle.split(', ')[1] ? new Date(groupTitle.split(', ')[1] + ' ' + new Date().getFullYear()).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }).replace(/[^a-zA-Z0-9]/g, '_') : groupTitle.replace(/[^a-zA-Z0-9]/g, '_');

                const acknowledgement = this.state.acknowledgedSalesData[safeDateKey];
                let totalHtml = `<p class="sales-group-total">&#8358;${this.formatNumber(dailyTotal)}</p>`;
                let acknowledgedHtml = '';

                if (acknowledgement && acknowledgement.acknowledged) {
                    const wholesalerName = acknowledgement.wholesalerName || 'your wholesaler';
                    const checkmarkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="checkmark-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                    totalHtml = `<p class="sales-group-total acknowledged">${checkmarkIcon} &#8358;${this.formatNumber(dailyTotal)}</p>`;

                    const ackDate = new Date(groupTitle.split(', ')[1]).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' });
                    acknowledgedHtml = `<span class="acknowledgement-text">Payment for ${ackDate} acknowledged by ${wholesalerName}.</span>`;
                }

                groupHeader.innerHTML = `<h3>${groupTitle}</h3>${totalHtml}`;
                groupContainer.appendChild(groupHeader);

                if (acknowledgedHtml) {
                    groupHeader.insertAdjacentHTML('afterend', acknowledgedHtml);
                }

                groupedSales[groupTitle].forEach((sale, index) => {
                    const saleEl = document.createElement('div');
                    saleEl.className = 'sale-item';
                    if (sale.sharedAsLog) {
                        saleEl.classList.add('shared-log');
                    }
                    saleEl.dataset.saleId = sale.id;
                    // The picture the product had when it was sold; only older sales without one use the product's current picture
                    const matchedProduct = productMap[sale.productId];
                    const imageBlob = sale.image || (matchedProduct && matchedProduct.image);
                    const imageUrl = imageBlob ? URL.createObjectURL(imageBlob) : 'icons/icon-192.png';

                    // Add discount marker
                    let discountMark = '';
                    if (sale.saleType === 'credit') {
                        discountMark = '<sup class="discount-mark" style="color:red;">**</sup>';
                    } else if (sale.discount && sale.discount > 0) {
                        discountMark = '<sup class="discount-mark">**</sup>';
                    }

                    let numberingHtml = '';
                    if (filterValue === 'best-selling') {
                        numberingHtml = `<span style="font-weight: bold; margin-right: 12px; color: var(--text-color); font-size: 1.1em; display: flex; align-items: center;">${index + 1}.</span>`;
                    }

                    saleEl.innerHTML = `<div class="sale-item-overlay">Previously Transferred</div>${numberingHtml}<img src="${imageUrl}" alt="${sale.productName}"><div class="sale-info"><p>${sale.productName}</p><span>${this.formatNumber(sale.quantity)} x &#8358;${this.formatNumber(sale.price)}</span></div><p class="sale-price">${discountMark}&#8358;${this.formatNumber(sale.total)}</p>${this._saleEditExtrasHtml(sale)}`;
                    this.addSaleItemEventListeners(saleEl, sale);
                    this._appendSaleEl(groupContainer, saleEl, sale);
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
            const dateOptions = { month: 'short', day: 'numeric' };

            sales.forEach(sale => {
                const saleDate = new Date(sale.timestamp);
                saleDate.setHours(0, 0, 0, 0);

                let groupTitle;
                if (saleDate.getTime() === today.getTime()) {
                    groupTitle = `Today, ${today.toLocaleDateString('en-NG', dateOptions)}`;
                } else if (saleDate.getTime() === yesterday.getTime()) {
                    groupTitle = `Yesterday, ${yesterday.toLocaleDateString('en-NG', dateOptions)}`;
                } else if (saleDate >= startOfWeek) {
                    groupTitle = saleDate.toLocaleDateString('en-NG', { weekday: 'long', month: 'short', day: 'numeric' });
                } else {
                    groupTitle = saleDate.toLocaleDateString('en-NG', { month: 'long', day: 'numeric', year: 'numeric' });
                }

                if (!groups[groupTitle]) {
                    groups[groupTitle] = [];
                }
                groups[groupTitle].push(sale);
            });
            return groups;
        },

        groupSalesByWeek(sales) {
            const groups = {};
            sales.forEach(sale => {
                const saleDate = new Date(sale.timestamp);
                const startOfWeek = new Date(saleDate);
                startOfWeek.setDate(saleDate.getDate() - saleDate.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                
                const groupTitle = `${startOfWeek.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}`;
                
                if (!groups[groupTitle]) {
                    groups[groupTitle] = [];
                }
                groups[groupTitle].push(sale);
            });
            return groups;
        },

        groupSalesByMonth(sales) {
            const groups = {};
            sales.forEach(sale => {
                const saleDate = new Date(sale.timestamp);
                const groupTitle = saleDate.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
                
                if (!groups[groupTitle]) {
                    groups[groupTitle] = [];
                }
                groups[groupTitle].push(sale);
            });
            return groups;
        },

        groupBestSellingByMonth(sales) {
            const groups = {};
            sales.forEach(sale => {
                const saleDate = new Date(sale.timestamp);
                const monthTitle = saleDate.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
                
                if (!groups[monthTitle]) {
                    groups[monthTitle] = {};
                }
                if (!groups[monthTitle][sale.productId]) {
                    groups[monthTitle][sale.productId] = {
                        ...sale,
                        id: `best-${sale.productId}-${monthTitle}`,
                        quantity: 0,
                        total: 0,
                        timestamp: new Date(saleDate.getFullYear(), saleDate.getMonth(), 1).getTime()
                    };
                }
                groups[monthTitle][sale.productId].quantity += sale.quantity;
                groups[monthTitle][sale.productId].total += sale.total;
            });
            
            const sortedGroups = {};
            const monthKeys = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));
            
            monthKeys.forEach(month => {
                sortedGroups[month] = Object.values(groups[month]).sort((a, b) => b.quantity - a.quantity);
            });
            
            return sortedGroups;
        },

        async renderProducts(searchText = '') {
            const filterType = this.state.productFilter;
            const allProducts = await DB.getAllProducts();
            this.state.productCount = allProducts.length;
            if (this.toggleOnboardingTooltip) this.toggleOnboardingTooltip();
            
            allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first

            if (this.state.productSelectionMode) {
                // Picking a product to sell: best sellers first (in-stock before out-of-stock) so there is less scrolling.
                const stats = {};
                (await DB.getAllSales()).forEach(sale => {
                    const st = stats[sale.productId] || (stats[sale.productId] = { count: 0, qty: 0 });
                    st.count++;
                    st.qty += Number(sale.quantity) || 0;
                });
                const none = { count: 0, qty: 0 };
                allProducts.sort((a, b) => {
                    const aOut = a.stock <= 0, bOut = b.stock <= 0;
                    if (aOut !== bOut) return aOut ? 1 : -1;
                    const sa = stats[a.id] || none, sb = stats[b.id] || none;
                    return (sb.count - sa.count) || (sb.qty - sa.qty) || (new Date(b.createdAt) - new Date(a.createdAt));
                });
            }

            this.elements.productGrid.innerHTML = '';
            this.elements.productSkuCount.textContent = `${allProducts.length} products`;
            const totalValue = allProducts.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.stock) || 0)), 0);
            this.state.inventoryValue = allProducts.length === 0 ? null : `₦${this.formatNumber(totalValue)}`;
            this.applyFigureVisibility();

            let filteredProducts = allProducts;

            // Apply tab filter first
            if (filterType === 'restock') {
                filteredProducts = allProducts.filter(p => p.stock > 0 && p.stock < 7);
            } else if (filterType === 'outofstock') {
                filteredProducts = allProducts.filter(p => p.stock <= 0);
            }

            // Then apply search text filter
            const products = searchText
                ? filteredProducts.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()))
                : filteredProducts;

            if (allProducts.length > 0) {
                this.elements.productSearchContainer.style.display = 'block';
                document.querySelector('#products-view .product-filter-tabs').style.display = 'flex';
                this.elements.productSkuCount.style.display = 'block';
            } else {
                this.elements.productSearchContainer.style.display = 'none';
                document.querySelector('#products-view .product-filter-tabs').style.display = 'none';
                this.elements.productSkuCount.style.display = 'none';
            }

            if (products.length === 0) {
                if (this.state.user && this.state.user.type === 'Salesperson') {
                const spTab = document.querySelector('[data-filter="salespeople"]');
                if (spTab) spTab.style.display = 'none';

                    this.elements.productGrid.innerHTML = '<p class="empty-state">You have no products yet. Scan a QR code from your wholesaler (admin) to receive products.</p>';
                } else if (searchText) {
                    this.elements.productGrid.innerHTML = '<p class="empty-state">No products match your search.</p>';
                } else if (filterType === 'restock') {
                    this.elements.productGrid.innerHTML = '<p class="empty-state">No products below 7 units yet</p>';
                } else if (filterType === 'outofstock') {
                    this.elements.productGrid.innerHTML = '<p class="empty-state">No products currently out of stock</p>';
                } else if (filterType !== 'all') {
                    this.elements.productGrid.innerHTML = '<p class="empty-state">No products in this filter.</p>';
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
                } else if (product.isSalesperson) {
                    // a salesperson's only setup step is the picture, which usually arrives with the transfer now
                    if (!product.image) {
                        if (product.needsSetup === 'barcode-and-price') {
                            badgeHtml = '<div class="setup-badge">Add image & barcode</div>';
                        } else if (product.needsSetup === 'price') {
                            badgeHtml = '<div class="setup-badge">Add image</div>';
                        }
                    }
                } else if (product.needsSetup === 'barcode-and-price') {
                    badgeHtml = '<div class="setup-badge">Add barcode & price</div>';
                } else if (product.needsSetup === 'price') {
                    badgeHtml = '<div class="setup-badge">New: Add price</div>';
                } else if (product.stock < 7) {
                    badgeHtml = '<div class="restock-badge">Low stock!</div>';
                }

                const words = product.name.split(' ');
                const displayName = words.length > 2 ? words.slice(0, 2).join(' ') + '...' : product.name;

                const pencilIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
                card.innerHTML = `
                    ${badgeHtml}
                    <button class="edit-btn-icon">${pencilIconSVG}</button>
                    <div class="product-card-image-wrapper">
                        <img src="${imageUrl}" alt="${this._esc(product.name)}">
                    </div>
                    <div class="product-card-info">
                        <h4>${this._esc(displayName)}</h4>
                        <p class="product-price">&#8358;${this.formatNumber(product.price)}</p>
                        <p class="product-stock">${product.stock > 0 ? `${this.formatNumber(product.stock)} ${product.unit} left` : ''}</p>
                    </div>${this._productEditMarkHtml(product)}`;

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
                        this.elements.addNewProductBtn.style.display = (this.state.user && this.state.user.type === 'Salesperson') ? 'none' : 'flex';
                    } else {
                        this.handleEditProduct(product);
                    }
                });

                this.elements.productGrid.appendChild(card);
            });
        },

        // `fallbackData` is the older, smaller shape: used when the database rules refuse the richer one,
        // so adding detail to a log never costs the log itself.
        async _logToFirestore(collectionName, docId, data, fallbackData) {
            if (!this.state.firebaseReady) return;
            const write = (payload) => {
                const docRef = docId
                    ? window.fb.doc(window.fb.db, collectionName, docId)
                    : window.fb.doc(window.fb.collection(window.fb.db, collectionName));
                return window.fb.setDoc(docRef, payload, { merge: true });
            };
            try {
                await write(data);
            } catch (error) {
                if (fallbackData && error && error.code === 'permission-denied') {
                    try { await write(fallbackData); return; } catch (e) { error = e; }
                }
                console.error(`Failed to log to ${collectionName}:`, error);
            }
        },

        // What the admin dashboard learns about a sale. An edit is logged again under the same saleId,
        // and the dashboard keeps the latest version of each sale.
        _logSale(sale, product, edited) {
            const value = Math.max(0, (Number(sale.quantity) || 0) * (Number(sale.price) || 0) - (Number(sale.discount) || 0));
            const base = { userId: this.state.user.phone, total: sale.total, timestamp: window.fb.serverTimestamp() };
            const rich = {
                ...base,
                saleId: sale.id,
                productName: sale.productName || (product && product.name) || null,
                barcode: (product && product.barcode) || null,
                quantity: Number(sale.quantity) || 0,
                unit: sale.unit || (product && product.unit) || null,
                price: Number(sale.price) || 0,
                value,
                saleType: sale.saleType || 'default'
            };
            if (edited) rich.edited = true;
            this._logToFirestore('sales_logs', null, rich, edited ? null : base);
        },

        // Where this user is, kept on their account so the admin dashboard can place them on a map.
        // Only called after the user allowed location access.
        async _saveGeo(position) {
            const user = this.state.user;
            if (!user || !user.phone || !position || !position.coords || !this.state.firebaseReady) return;
            const geo = {
                lat: Number(position.coords.latitude.toFixed(5)),
                lng: Number(position.coords.longitude.toFixed(5)),
                accuracy: Math.round(position.coords.accuracy || 0)
            };
            try {
                await window.fb.setDoc(window.fb.doc(window.fb.db, 'users', user.phone), { geo }, { merge: true });
                user.geo = geo;
                await DB.saveUser(user, false);
            } catch (error) {
                console.error('Could not save location:', error);
            }
        },

        // Users who already allowed location (it is asked for at sign-up) but were never saved: no new prompt is shown
        async _backfillGeo() {
            try {
                if (!this.state.user || this.state.user.geo || !navigator.geolocation || !navigator.permissions) return;
                const permission = await navigator.permissions.query({ name: 'geolocation' });
                if (permission.state !== 'granted') return;
                navigator.geolocation.getCurrentPosition(
                    (position) => this._saveGeo(position),
                    () => {},
                    { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
                );
            } catch (error) { /* location is optional */ }
        },

        // A tap on a call button counts as a call to that customer
        _logCall(link) {
            const user = this.state.user;
            const phone = (link.getAttribute('href') || '').replace(/^tel:/, '');
            if (!user || !user.phone || !phone) return;
            const name = (link.getAttribute('title') || '').replace(/^Call\s+/, '');
            this._logToFirestore('call_logs', null, {
                callerId: user.phone,
                callerName: user.business || user.name || null,
                calleeId: phone,
                calleeName: name || null,
                timestamp: window.fb.serverTimestamp()
            }, {
                wholesalerId: user.phone,
                wholesalerName: user.business || user.name || null,
                retailerId: phone,
                retailerName: name || null,
                timestamp: window.fb.serverTimestamp()
            });
        },

        handleLocationPermission() {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('Location permission granted:', position.coords);
                    this._saveGeo(position);
                    this.showView('camera-permission-view');
                },
                (error) => {
                    console.warn('Location permission denied:', error.message);
                    this.showToast("Location is off. You can turn it on later in your browser settings.");
                    this.showView('camera-permission-view');
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        },
        async handleCameraPermission() { try { const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }); stream.getTracks().forEach(track => track.stop()); await this.loadMainApp(); this.startRealtimeSync(); } catch (err) { console.error("Camera permission denied:", err); say("PikaShot needs your camera to scan. Allow it in your browser settings.", "Camera is off"); } },
        async loadCameraScannerInBackground() {
            try {
                this.elements.sellItemBtnText.textContent = 'Loading...';
                this.elements.sellItemBtnMain.classList.add('loading');
                await Camera.init();
                this.state.cameraReady = true;
                this.elements.addNewProductBtn.classList.remove('disabled');
                this.elements.sellItemBtnMain.classList.remove('disabled');
                this.elements.sellItemBtnText.textContent = 'Record Sale';
                console.log("Barcode scanner ready.");
            } catch (error) {
                console.error("Failed to initialize scanner:", error);
                this.state.cameraReady = false;
                this.elements.sellItemBtnText.textContent = 'Offline';
            } finally {
                this.elements.sellItemBtnMain.classList.remove('loading');
            }
        },

        _scanOptions() {
            return {
                onStatus: (text) => { this.elements.scanFeedback.textContent = text; },
                onError: (message) => {
                    say(message, 'Camera problem');
                    this.state.isScanCanceled = true;
                    history.back();
                }
            };
        },

        // --- Sounds (one shared AudioContext; browsers only start it after a user gesture) ---
        _getAudioCtx() {
            if (!this._audioCtx) {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                if (!Ctx) return null;
                this._audioCtx = new Ctx();
            }
            return this._audioCtx;
        },

        _unlockAudio() {
            try {
                const ctx = this._getAudioCtx();
                if (!ctx) return;
                if (ctx.state === 'suspended') ctx.resume();
                if (!this._audioPrimed) {
                    // Some browsers (iOS) only open the audio output after a sound has been started from a tap
                    const buffer = ctx.createBuffer(1, 1, 22050);
                    const src = ctx.createBufferSource();
                    src.buffer = buffer;
                    src.connect(ctx.destination);
                    src.start(0);
                    this._audioPrimed = true;
                }
            } catch (e) { /* audio unavailable */ }
        },

        _playNotes(notes) {
            try {
                const ctx = this._getAudioCtx();
                if (!ctx) return;
                const schedule = () => {
                    const base = ctx.currentTime + 0.05; // small lead-in so the very start of the sound is never clipped
                    notes.forEach(({ freq, start, dur, type, vol, release }) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        const t0 = base + start;
                        const peak = vol || 0.15;
                        osc.type = type || 'sine';
                        osc.frequency.value = freq;
                        gain.gain.setValueAtTime(0.0001, t0);
                        gain.gain.linearRampToValueAtTime(peak, t0 + 0.01);
                        gain.gain.setValueAtTime(peak, t0 + Math.max(0.011, dur - (release || 0.09))); // hold, then release
                        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.start(t0);
                        osc.stop(t0 + dur + 0.05);
                    });
                };
                // Wait for the context to be running before scheduling, otherwise the start of the sound is lost
                if (ctx.state === 'running') schedule();
                else ctx.resume().then(schedule).catch(() => {});
            } catch (e) { /* audio unavailable */ }
        },

        _playTransferChime() {
            // bright rising arpeggio: C5 E5 G5 C6
            this._playNotes([
                { freq: 523.25, start: 0, dur: 0.35 },
                { freq: 659.25, start: 0.12, dur: 0.35 },
                { freq: 783.99, start: 0.24, dur: 0.35 },
                { freq: 1046.5, start: 0.36, dur: 0.7, vol: 0.18 }
            ]);
        },

        async _handleSuccessfulScan() {
            // one crisp checkout-scanner beep
            this._playNotes([{ freq: 2300, start: 0, dur: 0.17, type: 'square', vol: 0.1, release: 0.03 }]);
            await DB.incrementScanCount();
            this.updateScanTracker();
        },

        startAddProduct() {
            if (this.state.user && this.state.user.type === 'Salesperson') {
                const spTab = document.querySelector('[data-filter="salespeople"]');
                if (spTab) spTab.style.display = 'none';

                this.showToast("Salespeople can only receive products via QR code from a wholesaler.");
                return;
            }
            if (this.elements.scanSelectFromProductsBtn) {
                this.elements.scanSelectFromProductsBtn.style.display = 'none';
                this.elements.cancelScanBtn.style.flex = '0 0 100%';
                this.elements.cancelScanBtn.style.maxWidth = '300px';
            }
            if (!this.state.cameraReady) { say("The scanner is still loading. Wait a moment and try again.", "Please wait"); return; }
            if (!Camera.isSupported()) { say("This phone cannot scan barcodes.", "Cannot scan"); return; }
            this.elements.scanFeedback.textContent = 'Scan product barcode';
            this.navigateTo('camera-view');
            Camera.startScan(
                this.handleAddProductScanResult.bind(this),
                () => { // onTimeout callback
                    this.elements.scanFeedback.textContent = 'No barcode found.';
                    this._logToFirestore('scan_logs', null, {
                        userId: this.state.user.phone,
                        type: 'add_product',
                        status: 'failed_timeout',
                        barcode: null,
                        timestamp: window.fb.serverTimestamp()
                    });
                    setTimeout(() => {
                        history.back();
                        this.showModal('add-product-failed-modal');
                    }, 500);
                },
                this.elements.scanTimerDisplay,
                this._scanOptions()
            );
        },

        async handleAddProductScanResult(result) {
            this._logToFirestore('scan_logs', null, {
                userId: this.state.user.phone,
                type: result.type === 'barcode' ? 'add_product' : 'log_scan',
                status: 'success',
                barcode: result.data.pikaLogVersion ? 'PIKA_LOG' : result.data,
                timestamp: window.fb.serverTimestamp()
            });

            switch (result.type) {
                case 'barcode':
                    history.back();
                    const existingProduct = await DB.getProductByBarcode(result.data);
                    if (existingProduct) {
                        this.elements.productExistsMessage.textContent = `Product already exists as "${existingProduct.name}" in inventory.`;
                        this.showModal('product-exists-modal');
                    } else {
                        this._handleSuccessfulScan();
                        this.state.capturedBarcode = result.data;
                        this.state.capturedBlob = null;
                        this.state.editingProduct = null;
                        this._openProductForm({ source: 'barcode' });
                    }
                    break;
                case 'qrlog':
                    this._handleSuccessfulScan();
                    history.back();
                    this.handlePikaLogScanned(result.data);
                    break;
                case 'qrlog_id':
                    this._handleSuccessfulScan();
                    history.back();
                    this.handlePikaLogIdScanned(result.data);
                    break;
            }
        },

        // New users sometimes tap Record Sale before adding anything to sell: guide them to Products first.
        redirectToAddProducts() {
            const isSalesperson = this.state.user && this.state.user.type === 'Salesperson';
            this.showToast(isSalesperson
                ? "You have no products yet. Accept products from your wholesaler first."
                : "Add your products first, then you can record sales.");
            setTimeout(() => {
                this.navigateTo('products-view');
                const btn = this.elements.addNewProductBtn;
                if (btn && !isSalesperson) {
                    btn.classList.remove('attention-pulse');
                    void btn.offsetWidth; // restart the animation if it is already running
                    btn.classList.add('attention-pulse');
                    setTimeout(() => btn.classList.remove('attention-pulse'), 3600);
                }
            }, 700);
        },

        async startSellScan() {
            this.state.isScanCanceled = false;
            if (!this.state.productCount) {
                // 0, or not counted yet: confirm against the database before sending the user away
                const existing = await DB.getAllProducts();
                if (existing.length === 0) { this.redirectToAddProducts(); return; }
            }
            if (!this.state.cameraReady) { say("The scanner is still loading. Wait a moment and try again.", "Please wait"); return; }
            if (!Camera.isSupported()) { say("This phone cannot scan barcodes.", "Cannot scan"); return; }
            if (this.elements.scanSelectFromProductsBtn) {
                this.elements.scanSelectFromProductsBtn.style.display = 'block';
                this.elements.cancelScanBtn.style.flex = '0 0 30%';
                this.elements.cancelScanBtn.style.maxWidth = '100px';
            }
            this.elements.scanFeedback.textContent = 'Scanning for barcode...';
            this.navigateTo('camera-view');
            Camera.startScan(
                async (result) => { // onResult
                    if (this.state.isScanCanceled) return;
                    this._logToFirestore('scan_logs', null, {
                        userId: this.state.user.phone,
                        type: result.type === 'barcode' ? 'sell_item' : 'log_scan',
                        status: 'success',
                        barcode: result.data.pikaLogVersion ? 'PIKA_LOG' : result.data,
                        timestamp: window.fb.serverTimestamp()
                    });

                    history.back();
                    if (result.type === 'barcode') {
                        const product = await DB.getProductByBarcode(result.data);
                        if (product) {
                            this._handleSuccessfulScan();
                            this.handleProductFound(product);
                        } else {
                            this.handleSellScanNotFound(false);
                        }
                    } else if (result.type === 'qrlog') {
                        this._handleSuccessfulScan();
                        this.handlePikaLogScanned(result.data);
                    } else if (result.type === 'qrlog_id') {
                        this._handleSuccessfulScan();
                        this.handlePikaLogIdScanned(result.data);
                    }
                },
                () => { // onTimeout
                    if (this.state.isScanCanceled) return;
                    history.back();
                    this.handleSellScanNotFound(true);
                },
                this.elements.scanTimerDisplay,
                this._scanOptions()
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

        handleSellScanNotFound(isTimeout) {
            this._logToFirestore('scan_logs', null, {
                userId: this.state.user.phone,
                type: 'sell_item',
                status: isTimeout ? 'failed_timeout' : 'failed_not_found',
                barcode: null,
                timestamp: window.fb.serverTimestamp()
            });

            this.elements.scanFeedback.textContent = 'Product not found.';
            setTimeout(() => {
                if (this.state.isScanCanceled) return;
                this.elements.entryChoiceTitle.textContent = 'Not Found';
                this.elements.entryChoiceParagraph.textContent = 'This item is not in your products.';
                this.elements.manualEntryBtn.style.display = 'none';
                this.elements.retrySellScanBtn.style.display = 'block';
                this.showModal('entry-choice-modal');
            }, isTimeout ? 0 : 1000); // Show modal immediately on timeout
        },

        async handleRetakePicture() { this.hideModal(); await this.handleAddOrChangePicture(); },

        handleConfirmPicture() {
            this.hideModal();
            const btn = this.elements.addChangePictureBtn;
            const originalContent = '<span>Snap Image</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>';
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            btn.classList.add('success');
            setTimeout(() => {
                btn.classList.remove('success');
                btn.innerHTML = originalContent;
            }, 2000);
            this.showModal('product-form-modal');
        },

        _openProductForm(options = {}) {
            this.elements.productForm.reset();
            this.elements.productFormTitle.textContent = 'Add New Product';
            this.elements.deleteProductBtn.style.display = 'none';
            const picBtn = this.elements.addChangePictureBtn;
            picBtn.style.display = 'flex';
            picBtn.classList.remove('success');
            picBtn.innerHTML = '<span>Snap Image</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>';
            this.elements.scanNewBarcodeBtn.style.display = 'none';
            this.elements.productIdInput.value = '';
            this.elements.productBarcodeDisplay.style.display = 'none';
            this.elements.productSourceInfo.style.display = 'none';
            this.elements.stockVisibilityRow.style.display = 'none';
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

            // NEW: Enforce internet connection for product management
            if (!navigator.onLine) {
                this.showToast("Internet connection required to manage products.");
                return;
            }

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
                originalName: isEditing ? this.state.editingProduct.originalName : null,
                lockedUntilOOS: false,
                stockVisible: (this.elements.stockVisibilityRow.style.display !== 'none')
                    ? this.elements.stockVisibilityToggle.checked
                    : (isEditing ? this.state.editingProduct.stockVisible : undefined),
                isSalesperson: isEditing ? this.state.editingProduct.isSalesperson : false,
                wholesalerPrice: isEditing ? this.state.editingProduct.wholesalerPrice : 0,
                needsSetup: null,
            };

            if (isEditing) productData.editedAt = Date.now(); // every edit starts the product's "recently edited" line afresh

            if (!productData.name || isNaN(productData.price) || isNaN(productData.stock)) {
                say('Fill in the product name, price and stock.', 'Check your entry'); return;
            }

            if (!productData.image) {
                say('Add a photo of the product first.', 'Photo needed');
                const addPicBtn = this.elements.addChangePictureBtn;
                addPicBtn.classList.add('input-error-shake');
                setTimeout(() => addPicBtn.classList.remove('input-error-shake'), 600);
                return;
            }

            if (isEditing && this.state.editingProduct.needsSetup === 'barcode-and-price' && !productData.barcode) {
                say('Scan this product\'s barcode first.', 'Barcode needed');
                const scanBarcodeBtn = this.elements.scanNewBarcodeBtn;
                scanBarcodeBtn.classList.add('input-error-shake');
                setTimeout(() => scanBarcodeBtn.classList.remove('input-error-shake'), 600);
                return;
            }

            if (productData.unit === 'cartons' && this.state.user.type === 'Wholesaler') {
                this.elements.cartonDetailsForm.reset();
                this.elements.cartonProductNameLabel.textContent = "What's inside?";
                this.elements.cartonQuantityLabel.textContent = 'How many per carton?';
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
                say('Choose what is inside and how many.', 'Check your entry');
                return;
            }

            let productData = this.state.tempProductDataForCarton;
            productData.subUnitType = subUnitType;
            productData.subUnitQuantity = subUnitQuantity;

            await this._commitProductSave(productData);
            this.state.tempProductDataForCarton = null;
        },

        async _commitProductSave(productData) {
            // Tell the admin dashboard what this user calls the item behind a barcode
            const before = this.state.editingProduct;
            if (productData.barcode && (!before || before.name !== productData.name || before.barcode !== productData.barcode)) {
                this._logToFirestore('scan_logs', null, {
                    userId: this.state.user.phone,
                    type: 'name_product',
                    status: 'success',
                    barcode: productData.barcode,
                    productName: productData.name,
                    timestamp: window.fb.serverTimestamp()
                });
            }

            await DB.saveProduct(productData);
            await this._syncSupplierStock(productData); // no-op unless this product came from a supplier

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
            const picBtn = this.elements.addChangePictureBtn;
            picBtn.style.display = 'flex';
            picBtn.innerHTML = '<span>Snap Image</span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>';

            if (product.image) {
                picBtn.classList.add('success');
            } else {
                picBtn.classList.remove('success');
            }

            this.elements.productIdInput.value = product.id;
            this.elements.productNameInput.value = product.name;
            this.elements.productPriceInput.value = this.formatNumber(product.price);
            this.elements.productStockInput.value = this.formatNumber(product.stock);
            // Units that came with a transfer may not be in the dropdown; keep them selectable so saving never blanks the unit
            if (product.unit && !Array.from(this.elements.productUnitInput.options).some(o => o.value === product.unit)) {
                const extra = document.createElement('option');
                extra.value = product.unit;
                extra.textContent = product.unit;
                this.elements.productUnitInput.appendChild(extra);
            }
            this.elements.productUnitInput.value = product.unit;
            this.state.capturedBlob = product.image;

            const isSalesperson = this.state.user && this.state.user.type === 'Salesperson';
            this.elements.productNameInput.disabled = isSalesperson;
            this.elements.productPriceInput.disabled = isSalesperson;
            this.elements.productStockInput.disabled = isSalesperson;
            this.elements.productUnitInput.disabled = isSalesperson;
            this.elements.scanNewBarcodeBtn.style.display = 'none';

            if (isSalesperson) {
                this.elements.productSourceInfo.textContent = 'As a salesperson, you can only change the product image.';
                this.elements.productSourceInfo.style.display = 'block';
                this.elements.deleteProductBtn.disabled = product.stock > 0;
            }


            const cartonOption = this.elements.productUnitInput.querySelector('.wholesaler-only');
            if (this.state.user && this.state.user.type === 'Wholesaler') {
                cartonOption.style.display = 'block';
            } else {
                cartonOption.style.display = 'none';
            }

            // Received products are edited like any other; the owner decides whether the last supplier sees the stock
            const canShowVisibility = !!product.supplierId && !isSalesperson && !product.isSalesperson;
            this.elements.stockVisibilityRow.style.display = canShowVisibility ? 'flex' : 'none';
            this.elements.stockVisibilityToggle.checked = product.stockVisible !== false;

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
            if (this.state.user && this.state.user.type === 'Salesperson' && this.state.editingProduct.stock > 0) {
                say("You can delete a product only when its stock is 0.", "Cannot delete yet");
                return;
            }
            // The PIN is the confirmation. Backing out (or leaving) returns to the product they were editing.
            const confirmed = await this.requestPin(`Delete "${this.state.editingProduct.name}" for good? This cannot be undone.`);
            if (!confirmed) {
                this.showModal('product-form-modal');
                return;
            }
            await DB.deleteProduct(this.state.editingProduct.id);
            this.hideModal();
            this.state.editingProduct = null;
            await this.renderProducts();
            this.navigateTo('products-view');
            this.showToast('Product deleted.');
        },

        async handleAddOrChangePicture() {
            this.hideModal();

            // Hide scan-related UI elements for photo capture
            document.querySelector('#camera-overlay .scan-box').style.display = 'none';
            this.elements.scanFeedback.textContent = 'Hold steady...';

            this.navigateTo('camera-view');
            try {
                const { blob } = await Camera.capturePhoto(this.elements.scanTimerDisplay, this.elements.scanFeedback);
                history.back();
                if (blob) {
                    this.state.capturedBlob = blob;
                    this.elements.capturedImagePreview.src = URL.createObjectURL(blob);
                    this.showModal('confirm-picture-modal');
                }
            } catch (error) {
                console.error("Error capturing image:", error);
                say("The photo did not work. Please try again.", "Photo failed");
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
                    this.elements.scanFeedback.textContent = 'Product not found.';
                    setTimeout(() => {
                        history.back();
                        this.showModal('product-form-modal');
                        say('No barcode found. Hold the phone steady and try again.', 'Not found');
                    }, 500);
                },
                this.elements.scanTimerDisplay,
                this._scanOptions()
            );
        },

        async handleBarcodeAssignmentResult(result) {
            history.back();
            if (result.type !== 'barcode') return;

            this._logToFirestore('scan_logs', null, {
                userId: this.state.user.phone,
                type: 'assign_barcode',
                status: 'success',
                barcode: result.data,
                timestamp: window.fb.serverTimestamp()
            });

            const existingProduct = await DB.getProductByBarcode(result.data);
            if (existingProduct && existingProduct.id !== this.state.editingProduct.id) {
                say(`This barcode already belongs to "${existingProduct.name}".`, "Already used");
                this.showModal('product-form-modal');
                return;
            }

            this.state.capturedBarcode = result.data;
            this.elements.productBarcodeDisplay.textContent = result.data;
            this.elements.productBarcodeDisplay.style.display = 'block';
            this.elements.productSourceInfo.style.display = 'none';
            this.showModal('product-form-modal');
        },

        handleProductFound(product) {
            this.state.editingSale = null;
            this.state.sellingProduct = product;
            this.elements.saleModalTitle.textContent = 'Confirm Sale';
            this.elements.saleProductImage.src = product.image ? URL.createObjectURL(product.image) : 'icons/icon-192.png';
            this.elements.saleProductName.textContent = product.name;
            this.elements.saleProductStock.textContent = `Stock: ${this.formatNumber(product.stock)} ${product.unit} left`;
            this.elements.saleQuantityLabel.textContent = `How many ${product.unit}?`;
            this.elements.saleQuantityInput.value = '1';

            // Reset triple toggle fields
            const defaultRadio = Array.from(this.elements.saleTypeRadios).find(r => r.value === 'default');
            if (defaultRadio) {
                defaultRadio.checked = true;
                defaultRadio.dispatchEvent(new Event('change'));
            }

            this.updateSaleTotal();
            this.elements.saleOfflineNotice.style.display = 'none';
            this.showModal('confirm-sale-modal');
        },
        updateSaleTotal() {
            const quantity = this.unformatNumber(this.elements.saleQuantityInput.value);
            const price = this.state.editingSale ? this.state.editingSale.price : (this.state.sellingProduct?.price || 0);
            const subtotal = quantity * price;

            let discount = 0;
            const activeRadio = Array.from(this.elements.saleTypeRadios).find(r => r.checked);
            
            if (activeRadio && activeRadio.value === 'discount') {
                discount = this.unformatNumber(this.elements.discountAmountInput.value) || 0;
            }

            const total = Math.max(0, Math.round(subtotal - discount));
            this.elements.saleTotalPrice.textContent = `₦${this.formatNumber(total)}`;
        },
        async _processSale() {
            const quantity = this.unformatNumber(this.elements.saleQuantityInput.value);
            const product = this.state.sellingProduct;
            
            let discount = 0;
            let partPayment = null;
            let customerName = 'Walk-in Customer';
            const activeRadio = Array.from(this.elements.saleTypeRadios).find(r => r.checked);
            
            if (activeRadio && activeRadio.value === 'discount') {
                discount = this.unformatNumber(this.elements.discountAmountInput.value) || 0;
            } else if (activeRadio && activeRadio.value === 'credit') {
                partPayment = this.unformatNumber(this.elements.discountAmountInput.value) || 0;
                if (!this.state.selectedContact) {
                    say('Pick who is buying on credit.', 'Customer needed');
                    return false;
                }
                if (this.elements.discountAmountInput.value.trim() === '') {
                    say('How much did they pay now? Enter 0 if nothing.', 'Amount needed');
                    return false;
                }
                customerName = this.state.selectedContact.name;
            }

            const editing = this.state.editingSale;
            // When editing, the original sale's quantity goes back into stock before the new quantity is taken out
            const availableStock = product ? product.stock + (editing ? editing.quantity : 0) : 0;
            const unitPrice = editing ? editing.price : (product ? product.price : 0);

            if (!product) { say('This product is no longer available.', 'Not available'); return false; }
            if (quantity <= 0) { say('Enter how many you are selling.', 'Check your entry'); return false; }
            if (quantity > availableStock) { say(`Only ${this.formatNumber(availableStock)} ${product.unit} left in stock.`, 'Not enough stock'); return false; }

            product.stock = availableStock - quantity;

            await DB.saveProduct(product);
            
            let total = Math.max(0, Math.round((quantity * unitPrice) - discount));
            if (activeRadio && activeRadio.value === 'credit') {
                total = partPayment; // User requested: part payment becomes recorded total
            }
            
            const sale = {
                ...(editing || {}),
                id: editing ? editing.id : Date.now(),
                productId: product.id,
                productName: editing ? editing.productName : product.name,
                quantity: quantity,
                price: unitPrice,
                discount: discount, // Save discount
                saleType: activeRadio ? activeRadio.value : 'default',
                customerName: customerName,
                customerPhone: (this.state.selectedContact && this.state.selectedContact.phone) ? this.state.selectedContact.phone.trim().replace(/\s+/g, '') : null,
                total: total,
                timestamp: editing ? editing.timestamp : new Date(),
                image: (editing && editing.image) || product.image, // an edited sale keeps the picture it was sold with
                sharedAsLog: false,
                unit: product.unit
            };
            if (editing) sale.edited = true;

            // Auto-transfer for credit sales (not repeated when an existing sale is edited)
            if (!editing && sale.saleType === 'credit' && this.state.selectedContact && this.state.selectedContact.phone) {
                try {
                    if (this.state.firebaseReady && window.fb) {
                        const targetPhone = this.state.selectedContact.phone.trim().replace(/\s+/g, '');
                        if (targetPhone.length >= 10) {
                            const logData = {
                                pikaLogVersion: 2,
                                senderStore: this.state.user.business,
                                senderId: this.state.user.phone,
                                senderRole: this.state.user.type,
                                targetPhone: targetPhone,
                                claimed: false,
                                saleIds: [sale.id],
                                timestamp: window.fb.serverTimestamp(),
                                items: [{
                                    name: product.name,
                                    price: product.price,
                                    quantity: sale.quantity,
                                    unit: product.unit,
                                    barcode: product.barcode || null,
                                    ...this._settlementFields([sale])
                                }]
                            };
                            await this._attachItemImages(logData.items, [sale], [product]);
                            const logCollectionRef = window.fb.collection(window.fb.db, 'shared_logs');
                            const logRef = await window.fb.addDoc(logCollectionRef, logData);
                            // The sale only counts as transferred once the recipient accepts it
                            sale.pendingTransfer = { logId: logRef.id, to: targetPhone };
                            sale.pendingTransfers = [{ logId: logRef.id, to: targetPhone }];
                        }
                    }
                } catch (error) {
                    console.error("Error auto-transferring credit sale:", error);
                }
            }

            if (editing) {
                await DB.updateSale(sale);
                this._logSale(sale, product, true);
            } else {
                await DB.addSale(sale);
                this._logSale(sale, product);
            }

            if (this.state.firebaseReady && product.supplierId && this.state.user.phone && product.stockVisible !== false) {
                try {
                    const retailerDocRef = window.fb.doc(window.fb.db, `retailer_stocks/${product.supplierId}/supplied_retailers/${this.state.user.phone}`);
                    const updateData = {};
                    const firebaseProductName = product.originalName || product.name;
                    updateData[`products.${firebaseProductName}.stock`] = product.stock;
                    updateData[`products.${firebaseProductName}.lastSaleTimestamp`] = window.fb.serverTimestamp();
                    updateData.lastUpdate = window.fb.serverTimestamp();

                    await window.fb.updateDoc(retailerDocRef, updateData);

                    if (product.isSalesperson) {
                        const saleDataForWholesaler = {
                            ...sale
                        };
                        delete saleDataForWholesaler.image; // Don't upload blob to Firestore
                        const salesSubcollectionRef = window.fb.collection(window.fb.db, `retailer_stocks/${product.supplierId}/supplied_retailers/${this.state.user.phone}/sales`);
                        if (editing) {
                            // Update the wholesaler's existing copy of this sale instead of adding a second one
                            delete saleDataForWholesaler.timestamp;
                            const existing = await window.fb.getDocs(window.fb.query(salesSubcollectionRef, window.fb.where('id', '==', sale.id)));
                            const updates = [];
                            existing.forEach(d => updates.push(window.fb.updateDoc(d.ref, saleDataForWholesaler)));
                            await Promise.all(updates);
                        } else {
                            saleDataForWholesaler.timestamp = window.fb.serverTimestamp();
                            await window.fb.addDoc(salesSubcollectionRef, saleDataForWholesaler);
                        }
                    }

                } catch (error) {
                    console.error("Failed to sync sale to Firebase:", error);
                }
            }

            return true;
        },

        async handleConfirmSale() {
            if (!navigator.onLine) {
                this.elements.saleOfflineNotice.style.display = 'block';
                return; // Stop execution
            }

            try {
                const wasEditing = !!this.state.editingSale;
                const success = await this._processSale();

                this.elements.saleOfflineNotice.style.display = 'none'; // Hide if online
                if (success) {
                    this.state.editingSale = null;
                    this.hideModal();
                    this.watchPendingTransfers(); // a credit sale may have been sent to the customer automatically
                    await this.updateDashboard();
                    await this.renderProducts();
                    if (wasEditing) {
                        // Stay where the user was; just refresh the lists
                        if (this.state.currentView === 'all-sales-view') await this.renderAllSales();
                    } else {
                        this.navigateTo('home-view');
                    }
                }
            } catch (error) {
                console.error("Sale processing failed, likely offline:", error);
                this.elements.saleOfflineNotice.style.display = 'block';
            }
        },

        async handleManualSale(e) {
            e.preventDefault();
            const name = this.elements.manualProductName.value.trim();
            const price = this.unformatNumber(this.elements.manualProductPrice.value);
            const quantity = this.unformatNumber(this.elements.manualSaleQuantity.value);
            const unit = this.elements.manualProductUnit.value;
            if (!name || isNaN(price) || isNaN(quantity) || quantity <= 0) {
                say('Fill in the product name, price and how many.', 'Check your entry'); return;
            }

            const allProducts = await DB.getAllProducts();
            let productToSell = allProducts.find(p => p.name.toLowerCase() === name.toLowerCase());
            if (productToSell) {
                if (productToSell.stock < quantity) {
                    say(`Only ${this.formatNumber(productToSell.stock)} ${productToSell.unit} of ${name} left.`, 'Not enough stock');
                    return;
                }
                productToSell.stock -= quantity;
            } else {
                productToSell = { id: Date.now(), name, price, stock: 0, unit, image: null, barcode: null, createdAt: new Date(), supplierId: null };
                this.showToast(`${name} is new. It was added to your products with 0 stock.`);
            }

            await DB.saveProduct(productToSell);
            const sale = { id: Date.now() + 1, productId: productToSell.id, productName: name, quantity, price, total: Math.round(price * quantity), timestamp: new Date(), image: productToSell.image, sharedAsLog: false, unit };
            await DB.addSale(sale);
            this._logSale(sale, productToSell);

            if (this.state.firebaseReady && productToSell.supplierId && this.state.user.phone && productToSell.stockVisible !== false) {
                try {
                    const retailerDocRef = window.fb.doc(window.fb.db, `retailer_stocks/${productToSell.supplierId}/supplied_retailers/${this.state.user.phone}`);
                    const updateData = {};
                    const firebaseProductName = productToSell.originalName || productToSell.name;
                    updateData[`products.${firebaseProductName}.stock`] = productToSell.stock;
                    updateData[`products.${firebaseProductName}.lastSaleTimestamp`] = window.fb.serverTimestamp();
                    updateData.lastUpdate = window.fb.serverTimestamp();

                    await window.fb.updateDoc(retailerDocRef, updateData);

                    if (productToSell.isSalesperson) {
                        const saleDataForWholesaler = {
                            ...sale,
                            timestamp: window.fb.serverTimestamp()
                        };
                        delete saleDataForWholesaler.image; // Don't upload blob to Firestore
                        const salesSubcollectionRef = window.fb.collection(window.fb.db, `retailer_stocks/${productToSell.supplierId}/supplied_retailers/${this.state.user.phone}/sales`);
                        await window.fb.addDoc(salesSubcollectionRef, saleDataForWholesaler);
                    }
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

            // Start from the full list (no stale search/filter) so the top sellers are what the user sees first
            this.elements.productSearchInput.value = '';
            this.state.productFilter = 'all';
            this.elements.productFilterTabs.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === 'all'));

            // Fix: If already on products-view, navigateTo returns early, so we must force the UI update
            if (this.state.currentView === 'products-view') {
                this.exitSelectionMode(); // Ensure receipt selection mode is off
                this.elements.productsView.classList.add('selection-mode');
                this.elements.addNewProductBtn.style.display = 'none';
                this.updateHeader('products-view'); // Update header title to "Select a Product"
            } else {
                this.navigateTo('products-view');
            }
            await this.renderProducts();
        },

        addSaleItemEventListeners(element, sale) {
            element.addEventListener('click', (e) => {
                if (e.target.classList.contains('sale-item-overlay')) return;
                if (!this.state.isSelectionMode) {
                    this.enterSelectionMode(element, sale);
                } else {
                    this.toggleSaleSelection(element, sale);
                }
            });
        },

        triggerRestrictedFeedback(element) {
            // Visual shake
            element.classList.add('shake-restricted');
            setTimeout(() => {
                element.classList.remove('shake-restricted');
            }, 500);

            // Text feedback (Toast)
            this.showToast("This item has already been transferred.");
        },

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
            this.state.selectedSaleData.clear();
            document.querySelectorAll('.sale-item').forEach(el => { el.classList.remove('selectable'); el.classList.remove('selected'); });
            this.elements.receiptActions.classList.remove('visible');
            this.updateEditButton();
            if (this.elements.recentSalesList.children.length > 0 && this.elements.recentSalesList.children[0].className !== 'empty-state') {
                this.elements.selectionModeHint.textContent = 'Tap to select';
            }
        },
        toggleSaleSelection(element, sale) {
            if (this.state.selectedSales.has(sale.id)) { this.state.selectedSales.delete(sale.id); this.state.selectedSaleData.delete(sale.id); element.classList.remove('selected'); } else { this.state.selectedSales.add(sale.id); this.state.selectedSaleData.set(sale.id, sale); element.classList.add('selected'); } this.elements.generateReceiptBtn.disabled = this.state.selectedSales.size === 0;
            if (this.state.selectedSales.size === 0) { this.exitSelectionMode(); return; }
            this.updateEditButton();
        },

        // --- SALE EDITING (one edit, within 45 minutes of recording) ---
        EDIT_WINDOW_MS: 45 * 60 * 1000,
        // A product that was just edited shows the same receding line, over a longer stretch
        PRODUCT_EDIT_MARK_MS: 45 * 60 * 1000,

        isSaleEditable(sale) {
            if (!sale || sale.edited || sale.sharedAsLog || sale.pendingTransfer) return false;
            const age = Date.now() - new Date(sale.timestamp).getTime();
            return age >= 0 && age < this.EDIT_WINDOW_MS;
        },

        _saleEditExtrasHtml(sale) {
            if (!this.isSaleEditable(sale)) return '';
            const startMs = new Date(sale.timestamp).getTime();
            const elapsed = Date.now() - startMs;
            return `<div class="sale-edit-timer" data-expires="${startMs + this.EDIT_WINDOW_MS}" style="animation-duration: ${this.EDIT_WINDOW_MS / 1000}s; animation-delay: -${(elapsed / 1000).toFixed(2)}s"></div>`;
        },

        updateEditButton() {
            const btn = this.elements.editSaleBtn;
            let show = false;
            if (this.state.isSelectionMode && this.state.selectedSales.size === 1) {
                show = this.isSaleEditable(this.state.selectedSaleData.get([...this.state.selectedSales][0]));
            }
            btn.classList.toggle('visible', show);
            btn.setAttribute('aria-hidden', String(!show));
            btn.tabIndex = show ? 0 : -1;
        },

        // The thin teal line on a product that was edited in the last 45 minutes (same line as on fresh sales)
        _productEditMarkHtml(product) {
            const editedAt = Number(product.editedAt);
            if (!editedAt) return '';
            const elapsed = Date.now() - editedAt;
            if (elapsed >= this.PRODUCT_EDIT_MARK_MS || elapsed < -60000) return ''; // expired, or from a badly set clock
            return `<div class="product-edit-timer" data-expires="${editedAt + this.PRODUCT_EDIT_MARK_MS}" style="animation-duration: ${this.PRODUCT_EDIT_MARK_MS / 1000}s; animation-delay: -${(Math.max(0, elapsed) / 1000).toFixed(2)}s"></div>`;
        },

        tickEditWindows() {
            const now = Date.now();
            document.querySelectorAll('.sale-edit-timer, .product-edit-timer').forEach(el => {
                if (now >= Number(el.dataset.expires)) el.remove();
            });
            if (this.state.isSelectionMode) this.updateEditButton();
        },

        async handleEditSale() {
            if (this.state.selectedSales.size !== 1) return;
            const saleId = [...this.state.selectedSales][0];
            const allSales = await DB.getAllSales();
            const sale = allSales.find(s => s.id === saleId);
            if (!this.isSaleEditable(sale)) {
                this.showToast("This sale can no longer be edited.");
                this.updateEditButton();
                return;
            }
            const products = await DB.getAllProducts();
            const product = products.find(p => p.id === sale.productId);
            if (!product) {
                this.showToast("This sale's product no longer exists, so it can't be edited.");
                return;
            }

            this.exitSelectionMode();
            this.handleProductFound(product); // opens the confirm sale modal with defaults
            this.state.editingSale = sale;
            this.elements.saleModalTitle.textContent = 'Edit Sale';

            // Pre-fill the modal with this sale's details
            this.elements.saleProductStock.textContent = `Stock: ${this.formatNumber(product.stock + sale.quantity)} ${product.unit} left`;
            this.elements.saleQuantityInput.value = this.formatNumber(sale.quantity);
            const typeRadio = Array.from(this.elements.saleTypeRadios).find(r => r.value === (sale.saleType || 'default')) ||
                Array.from(this.elements.saleTypeRadios).find(r => r.value === 'default');
            typeRadio.checked = true;
            typeRadio.dispatchEvent(new Event('change')); // resets the discount / part-payment fields
            if (typeRadio.value === 'discount') {
                this.elements.discountAmountInput.value = this.formatNumber(sale.discount || 0);
            } else if (typeRadio.value === 'credit') {
                this.elements.discountAmountInput.value = this.formatNumber(sale.total || 0);
                this.state.selectedContact = { name: sale.customerName, phone: sale.customerPhone || '' };
                this.elements.selectedContactName.textContent = sale.customerName;
                this.elements.selectedContactName.style.display = 'block';
            }
            this.updateSaleTotal();
        },
        _esc(value) {
            return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
        },

        // The receipt as plain data. The on-screen receipt and the shared picture are both made from it, so they always match.
        _buildReceiptModel(sales) {
            const money = (n) => `₦${this.formatNumber(n)}`;
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const receiptId = `PS-${Date.now().toString().slice(-6)}`;

            let subtotal = 0, discountTotal = 0, totalDue = 0, paidTotal = 0, balanceTotal = 0;
            let hasCredit = false;
            const customers = new Set();

            const items = sales.map(sale => {
                const gross = (Number(sale.quantity) || 0) * (Number(sale.price) || 0);
                const paid = Number(sale.total) || 0;
                const isCredit = sale.saleType === 'credit';
                const discount = (!isCredit && sale.discount > 0) ? Number(sale.discount) : 0;
                subtotal += gross;
                discountTotal += discount;
                paidTotal += paid;
                if (sale.customerName && sale.customerName !== 'Walk-in Customer') customers.add(sale.customerName);

                const subs = [];
                if (discount > 0) {
                    subs.push({ label: 'Discount', value: `-${money(discount)}` });
                    totalDue += paid;
                } else if (isCredit) {
                    hasCredit = true;
                    const balance = Math.max(0, gross - paid);
                    balanceTotal += balance;
                    totalDue += gross;
                    subs.push({ label: `Credit${sale.customerName ? ' · ' + sale.customerName : ''}`, tone: 'credit' });
                    subs.push({ label: 'Paid', value: money(paid), tone: 'credit' });
                    subs.push({ label: 'Balance', value: money(balance), tone: 'credit' });
                } else {
                    totalDue += paid;
                }
                return { name: String(sale.productName || ''), amount: money(gross), calc: `${this.formatNumber(sale.quantity)} × ${money(sale.price)}`, subs };
            });

            const sumRows = [];
            if (discountTotal > 0) {
                sumRows.push({ label: 'Subtotal', value: money(subtotal), tone: 'muted' });
                sumRows.push({ label: 'Discount', value: `-${money(discountTotal)}`, tone: 'discount' });
            }

            const user = this.state.user || {};
            return {
                store: String(user.business || ''),
                meta: [user.location, user.phone].filter(Boolean).join(' · '),
                customer: customers.size === 1 ? [...customers][0] : '',
                items,
                sumRows,
                total: money(totalDue),
                credit: hasCredit ? { paid: money(paidTotal), balance: money(balanceTotal) } : null,
                stamp: `${receiptId} · ${dateStr} · ${timeStr}` // receipt number and time sit at the very bottom, on one line
            };
        },

        _receiptHtml(m) {
            const e = (v) => this._esc(v);
            const subHtml = (s) => `<div class="rc-sub${s.tone === 'credit' ? ' credit' : ''}"><span>${e(s.label)}</span>${s.value ? `<span>${e(s.value)}</span>` : ''}</div>`;
            const itemsHtml = m.items.map(it =>
                `<div class="rc-item"><div class="rc-row"><span class="rc-item-name">${e(it.name)}</span><span class="rc-amt">${e(it.amount)}</span></div>` +
                `<div class="rc-calc">${e(it.calc)}</div>${it.subs.map(subHtml).join('')}</div>`).join('');
            const summaryHtml = m.sumRows.map(r => `<div class="rc-sum ${r.tone}"><span>${e(r.label)}</span><span>${e(r.value)}</span></div>`).join('') +
                `<div class="rc-total"><span>Total</span><span>${e(m.total)}</span></div>` +
                (m.credit ? `<div class="rc-sum muted"><span>Amount paid</span><span>${e(m.credit.paid)}</span></div>` +
                    `<div class="rc-balance"><span>Balance due</span><span>${e(m.credit.balance)}</span></div>` : '');
            return `<div class="receipt-header"><div class="rc-store">${e(m.store)}</div>${m.meta ? `<div class="rc-meta">${e(m.meta)}</div>` : ''}</div>` +
                (m.customer ? `<div class="rc-info"><div class="rc-kv"><span>Customer</span><span>${e(m.customer)}</span></div></div>` : '') +
                `<div class="rc-cols"><span>Item</span><span>Amount</span></div>` +
                `<div class="receipt-items">${itemsHtml}</div>` +
                `<div class="rc-summary">${summaryHtml}</div>` +
                `<div class="receipt-footer"><p class="rc-thanks">Thank you for your patronage!</p>` +
                `<p class="rc-stamp">${e(m.stamp)}</p>` +
                `<p class="rc-brand">Powered by PikaShot</p></div>`;
        },

        async generateReceipt() {
            const allSales = await DB.getAllSales();
            const selectedSaleObjects = allSales
                .filter(s => this.state.selectedSales.has(s.id))
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            if (selectedSaleObjects.length === 0) return;

            this.state.receiptModel = this._buildReceiptModel(selectedSaleObjects);
            this.elements.receiptContent.innerHTML = this._receiptHtml(this.state.receiptModel);

            const chip = document.getElementById('receipt-count-chip');
            if (chip) chip.textContent = `${selectedSaleObjects.length} item${selectedSaleObjects.length === 1 ? '' : 's'}`;
            this.showModal('receipt-modal');
            const scroller = document.getElementById('receipt-scroll');
            if (scroller) scroller.scrollTop = 0;
        },

        // Draws the receipt straight onto a canvas for sharing. Text is measured and drawn with the same font on the
        // same canvas, so words can never run together the way they do when a page is photographed by a library.
        _drawReceipt(m) {
            const W = 360, PAD = 18, CW = W - PAD * 2, GAP = 12;
            const fam = getComputedStyle(this.elements.receiptContent).fontFamily || 'Arial, sans-serif';
            const meas = document.createElement('canvas').getContext('2d');
            const fontOf = (size, weight) => `${weight} ${size}px ${fam}`;
            const widthOf = (s, size, weight, spacing = 0) => {
                meas.font = fontOf(size, weight);
                return meas.measureText(s).width + spacing * Math.max(0, s.length - 1);
            };
            // Break between words, or inside a word that is wider than the line
            const wrap = (s, size, weight, max) => {
                const lines = [];
                let cur = '';
                String(s).split(/\s+/).filter(Boolean).forEach(word => {
                    const attempt = cur ? `${cur} ${word}` : word;
                    if (widthOf(attempt, size, weight) <= max) { cur = attempt; return; }
                    if (cur) { lines.push(cur); cur = ''; }
                    let piece = '';
                    for (const ch of word) {
                        if (piece && widthOf(piece + ch, size, weight) > max) { lines.push(piece); piece = ''; }
                        piece += ch;
                    }
                    cur = piece;
                });
                if (cur) lines.push(cur);
                return lines.length ? lines : [''];
            };

            const ops = []; // drawing steps, run once the picture's height is known
            const baseline = (top, size, lh) => top + (lh - size) / 2 + size * 0.82;
            const text = (s, x, top, size, weight, color, lh, align = 'left', spacing = 0) => {
                const base = baseline(top, size, lh);
                const w = widthOf(s, size, weight, spacing);
                const left = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x;
                ops.push((c) => {
                    c.font = fontOf(size, weight);
                    c.fillStyle = color;
                    c.textAlign = 'left';
                    if (!spacing) { c.fillText(s, left, base); return; }
                    let cx = left;
                    for (const ch of s) { c.fillText(ch, cx, base); cx += c.measureText(ch).width + spacing; }
                });
            };
            const rule = (at, color, thickness, dash) => ops.push((c) => {
                c.strokeStyle = color; c.lineWidth = thickness; c.setLineDash(dash || []);
                c.beginPath(); c.moveTo(PAD, at); c.lineTo(W - PAD, at); c.stroke();
            });
            // label on the left, value on the right (the label wraps if the value needs the room)
            const pair = (label, value, top, size, labelWeight, valueWeight, labelColor, valueColor, lh) => {
                const valueW = value ? widthOf(value, size, valueWeight) + GAP : 0;
                const lines = wrap(label, size, labelWeight, CW - valueW);
                lines.forEach((ln, i) => text(ln, PAD, top + i * lh, size, labelWeight, labelColor, lh));
                if (value) text(value, W - PAD, top, size, valueWeight, valueColor, lh, 'right');
                return lines.length * lh;
            };

            let y = 24;
            wrap(m.store.toUpperCase(), 16.8, 700, CW).forEach(ln => { text(ln, W / 2, y, 16.8, 700, '#1d1d1d', 21, 'center', 1); y += 21; });
            if (m.meta) {
                y += 4;
                wrap(m.meta, 11.5, 400, CW).forEach(ln => { text(ln, W / 2, y, 11.5, 400, '#777', 15, 'center'); y += 15; });
            }
            y += 14;

            if (m.customer) {
                rule(y, '#bbb', 1, [3, 3]);
                y += 10;
                y += pair('Customer', m.customer, y, 11.8, 400, 500, '#888', '#333', 16);
                y += 10;
                rule(y, '#bbb', 1, [3, 3]);
            }

            y += 14;
            text('ITEM', PAD, y, 10.2, 600, '#888', 13, 'left', 1);
            text('AMOUNT', W - PAD, y, 10.2, 600, '#888', 13, 'right', 1);
            y += 13 + 5;
            rule(y, '#1d1d1d', 1.5);

            m.items.forEach((it, i) => {
                if (i > 0) rule(y, '#ececec', 1);
                y += 10;
                const amountW = widthOf(it.amount, 14.7, 600) + GAP;
                const nameLines = wrap(it.name, 14.7, 600, CW - amountW);
                nameLines.forEach((ln, n) => text(ln, PAD, y + n * 19, 14.7, 600, '#1d1d1d', 19));
                text(it.amount, W - PAD, y, 14.7, 600, '#1d1d1d', 19, 'right');
                y += nameLines.length * 19 + 2;
                text(it.calc, PAD, y, 12.2, 400, '#777', 16);
                y += 16;
                it.subs.forEach(s => {
                    const color = s.tone === 'credit' ? '#b3261e' : '#777';
                    y += 2;
                    y += pair(s.label, s.value, y, 11.8, 400, 400, color, color, 16);
                });
                y += 10;
            });

            rule(y, '#1d1d1d', 1.5);
            y += 10;
            m.sumRows.forEach(r => {
                const color = r.tone === 'discount' ? '#1c7c54' : '#666';
                y += 4;
                y += pair(r.label, r.value, y, 12.8, 400, 400, color, color, 18);
            });
            y += 8;
            text('TOTAL', PAD, y, 11.2, 600, '#555', 26, 'left', 1.1);
            text(m.total, W - PAD, y, 20, 700, '#1d1d1d', 26, 'right');
            y += 26;
            if (m.credit) {
                y += 4;
                y += pair('Amount paid', m.credit.paid, y, 12.8, 400, 400, '#666', '#666', 18);
                y += 12;
                const top = y, boxH = 8 + 20 + 8;
                ops.push((c) => {
                    const r = 6, x0 = PAD + 0.5, y0 = top + 0.5, x1 = W - PAD - 0.5, y1 = top + boxH - 0.5;
                    c.strokeStyle = '#b3261e'; c.lineWidth = 1; c.setLineDash([3, 3]);
                    c.beginPath(); c.moveTo(x0 + r, y0);
                    c.arcTo(x1, y0, x1, y1, r); c.arcTo(x1, y1, x0, y1, r); c.arcTo(x0, y1, x0, y0, r); c.arcTo(x0, y0, x1, y0, r);
                    c.closePath(); c.stroke();
                });
                text('BALANCE DUE', PAD + 10, top + 8, 11.2, 700, '#b3261e', 20, 'left', 1.1);
                text(m.credit.balance, W - PAD - 10, top + 8, 14.4, 700, '#b3261e', 20, 'right');
                y += boxH;
            }

            y += 16;
            rule(y, '#bbb', 1, [3, 3]);
            y += 14;
            text('Thank you for your patronage!', W / 2, y, 13.1, 600, '#333', 19, 'center');
            y += 19 + 6;
            const stampSize = Math.min(10.6, 10.6 * CW / widthOf(m.stamp, 10.6, 400)); // stays on one line
            text(m.stamp, W / 2, y, stampSize, 400, '#999', 14, 'center');
            y += 14 + 10;
            text('POWERED BY PIKASHOT', W / 2, y, 9.6, 400, '#aaa', 13, 'center', 1.15);
            y += 13 + 22;

            const scale = Math.min(3, 8000 / y); // sharp, but never too big for a small phone to hold
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(W * scale);
            canvas.height = Math.round(y * scale);
            const ctx = canvas.getContext('2d');
            ctx.scale(scale, scale);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, W, y);
            ops.forEach(op => op(ctx));
            return canvas;
        },

        async shareReceipt() {
            const model = this.state.receiptModel;
            if (!model) return;
            let blob;
            try {
                blob = await new Promise(resolve => this._drawReceipt(model).toBlob(resolve, 'image/png'));
            } catch (error) {
                console.error('Error generating receipt image:', error);
            }
            if (navigator.share && blob) {
                try {
                    await navigator.share({
                        files: [new File([blob], 'pikashot-receipt.png', { type: 'image/png' })],
                        title: 'Your Receipt',
                        text: 'Here is your receipt from ' + this.state.user.business,
                    });
                } catch (error) {
                    console.error('Error sharing:', error);
                }
            } else {
                say('Sharing did not work on this phone. Please try again.', 'Cannot share');
            }
        },

        async initiatePhoneTransfer() {
            if (!navigator.onLine) {
                this.showToast("Please connect to the internet to transfer products.");
                const shareLogBtn = this.elements.shareLogBtn;
                shareLogBtn.classList.add('input-error-shake');
                setTimeout(() => shareLogBtn.classList.remove('input-error-shake'), 600);
                return;
            }
            if (!this.state.firebaseReady || !this.state.user.phone) {
                this.showToast("Cannot transfer products: not connected to online services.");
                return;
            }

            const allSales = await DB.getAllSales();
            const selectedSaleObjects = allSales.filter(s => this.state.selectedSales.has(s.id));

            if (selectedSaleObjects.length === 0) {
                this.showToast("Please select at least one sale to transfer.");
                return;
            }

            // --- NEW VALIDATION: Check for already transferred items ---
            const alreadyTransferred = selectedSaleObjects.filter(s => s.sharedAsLog);
            if (alreadyTransferred.length > 0) {
                alreadyTransferred.forEach(sale => {
                    const el = document.querySelector(`.sale-item[data-sale-id="${sale.id}"]`);
                    if (el) this.triggerRestrictedFeedback(el);
                });
                this.showToast("Some selected items have already been transferred and accepted.");
                return; 
            }
            // -----------------------------------------------------------

            const productCount = new Set(selectedSaleObjects.map(s => s.productId != null ? s.productId : s.productName)).size;
            this.elements.transferSummary.textContent = `${productCount} product${productCount === 1 ? '' : 's'} selected`;
            this.elements.transferPhoneInput.value = '';
            this._setTransferState('idle');
            const scroller = document.getElementById('receipt-scroll');
            this._receiptScrollTop = scroller ? scroller.scrollTop : 0;
            this.hideModal();
            this.showModal('phone-transfer-modal');
            setTimeout(() => this.elements.transferPhoneInput.focus(), 80);
        },

        // Backing out of a transfer takes the user back to the receipt it was started from
        closePhoneTransfer() {
            this.elements.transferPhoneInput.blur();
            if (!this.elements.receiptContent.innerHTML.trim()) {
                this.hideModal();
                return;
            }
            this.showModal('receipt-modal');
            const scroller = document.getElementById('receipt-scroll');
            if (scroller) scroller.scrollTop = this._receiptScrollTop || 0;
        },

        // 'idle' | 'checking' | 'found' | 'error': what the transfer modal shows under the phone number
        _setTransferState(state, text) {
            const el = this.elements;
            const digits = el.transferPhoneInput.value.length;
            el.transferDigitCount.textContent = `${digits}/11`;
            el.transferInputWrap.classList.toggle('complete', digits === 11);
            el.transferUserDetails.style.display = state === 'found' ? 'flex' : 'none';
            el.transferMessage.style.display = (state === 'checking' || state === 'error') ? 'flex' : 'none';
            el.transferMessage.classList.toggle('error', state === 'error');
            el.transferMessageText.textContent = text || '';
            el.confirmPhoneTransferBtn.disabled = state !== 'found';
        },

        async findUserForTransfer() {
            const targetPhone = this.elements.transferPhoneInput.value.trim();
            if (targetPhone.length !== 11) return;

            if (targetPhone === this.state.user.phone) {
                this._setTransferState('error', "You can't transfer products to yourself.");
                return;
            }

            this._setTransferState('checking', 'Checking number...');
            const stillCurrent = () => this.elements.transferPhoneInput.value.trim() === targetPhone;
            try {
                const userRef = window.fb.doc(window.fb.db, 'users', targetPhone);
                const userSnap = await window.fb.getDoc(userRef);
                if (!stillCurrent()) return; // the number was changed while we were looking

                if (!userSnap.exists()) {
                    this._setTransferState('idle');
                    this.hideModal();
                    this.showModal('invite-customer-modal');
                    return;
                }

                const userData = userSnap.data();
                const userName = userData.name || userData.phone || "Unknown";
                const userBusiness = userData.business || "N/A";

                this.elements.transferUserName.textContent = userName;
                this.elements.transferUserBusiness.textContent = userBusiness;
                this.elements.transferUserAvatar.textContent = (String(userName).trim().charAt(0) || '?').toUpperCase();
                this._setTransferState('found');
            } catch (error) {
                console.error("Error finding user:", error);
                if (stillCurrent()) this._setTransferState('error', "Couldn't check this number. Tap here to try again.");
            }
        },

        async processPhoneTransfer() {
            const targetPhone = this.elements.transferPhoneInput.value.trim();
            this.showLoader();
            try {
                const allSales = await DB.getAllSales();
                const selectedSaleObjects = allSales.filter(s => this.state.selectedSales.has(s.id));
                const groupedSales = selectedSaleObjects.reduce((acc, sale) => {
                    const key = sale.productId;
                    if (!acc[key]) {
                        acc[key] = { ...sale, quantity: 0 };
                    }
                    acc[key].quantity += sale.quantity;
                    return acc;
                }, {});

                const aggregatedSaleObjects = Object.values(groupedSales);
                const allProducts = await DB.getAllProducts();

                const logData = {
                    pikaLogVersion: 2,
                    senderStore: this.state.user.business,
                    senderId: this.state.user.phone,
                    senderRole: this.state.user.type,
                    targetPhone: targetPhone,
                    claimed: false,
                    saleIds: selectedSaleObjects.map(s => s.id),
                    timestamp: window.fb.serverTimestamp(),
                    items: aggregatedSaleObjects.map(sale => {
                        const product = allProducts.find(p => p.id === sale.productId);
                        const isSalespersonSharingCarton = this.state.user.type === 'Salesperson' && product && product.unit === 'cartons';

                        if (isSalespersonSharingCarton) {
                            return {
                                name: product.originalName || product.name,
                                price: product.wholesalerPrice,
                                quantity: sale.quantity,
                                unit: 'cartons',
                                barcode: product.barcode,
                                subUnitType: product.subUnitType,
                                subUnitQuantity: product.subUnitQuantity
                            };
                        } else {
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
                            Object.assign(item, this._settlementFields(selectedSaleObjects.filter(s => s.productId === sale.productId)));
                            return item;
                        }
                    })
                };

                await this._attachItemImages(logData.items, aggregatedSaleObjects, allProducts);

                const logCollectionRef = window.fb.collection(window.fb.db, 'shared_logs');
                const logRef = await window.fb.addDoc(logCollectionRef, logData);

                // Confirm the transfer really is on the server before telling the user it was sent
                const saved = await window.fb.getDoc(logRef);
                if (!saved.exists() || saved.data().targetPhone !== targetPhone || saved.data().claimed !== false) {
                    throw new Error('Transfer was not saved correctly');
                }

                // Remember the pending transfer on each sale (it turns into "transferred" when accepted)
                await this.handleLogShared(logRef.id, targetPhone);
                
                this.hideModal();
                const recipientName = (this.elements.transferUserName.textContent || '').trim();
                this.showToast(recipientName
                    ? `Transfer sent! ${recipientName} will be asked to accept it.`
                    : "Transfer sent! The recipient will be asked to accept it.");

            } catch (error) {
                console.error("Error processing phone transfer:", error);
                say("The transfer did not go through. Check your internet and try again.", "Transfer failed");
            } finally {
                this.hideLoader();
            }
        },

        // How the sales behind a transfer item were settled, so the receiver can see it: money taken off (discount),
        // or what was paid up front and is still owed (credit). Only the fields that apply are returned.
        _settlementFields(sales) {
            let discount = 0, paid = 0, balance = 0, onCredit = false;
            sales.forEach(sale => {
                if (sale.saleType === 'credit') {
                    const gross = (Number(sale.quantity) || 0) * (Number(sale.price) || 0);
                    const part = Number(sale.total) || 0;
                    onCredit = true;
                    paid += part;
                    balance += Math.max(0, gross - part);
                } else if (sale.discount > 0) {
                    discount += Number(sale.discount);
                }
            });
            const fields = {};
            if (discount > 0) fields.discount = discount;
            if (onCredit) { fields.creditPaid = paid; fields.creditBalance = balance; }
            return fields;
        },

        // --- Product pictures that travel with a transfer ---------------------------------------------
        // Each item carries a tiny thumbnail (a few KB of text) inside the transfer itself, so the receiver sees the
        // product straight away: no extra download, no extra service. A transfer holds at most IMAGE_BUDGET characters
        // of pictures, which keeps it far below the 1 MB limit of a Firestore document and quick on slow networks.
        // Items whose picture does not fit (or that have none) are simply sent without one.
        IMAGE_BUDGET: 400000,
        THUMB_SIZE: 128,

        async _attachItemImages(items, sales, products) {
            let used = 0;
            for (let i = 0; i < items.length; i++) {
                try {
                    const product = products.find(p => p.id === sales[i].productId);
                    if (!product || !(product.image instanceof Blob)) continue;
                    const thumb = await this._makeThumbnail(product.image);
                    if (thumb && used + thumb.length <= this.IMAGE_BUDGET) {
                        items[i].image = thumb;
                        used += thumb.length;
                    }
                } catch (e) { /* a picture must never get in the way of the transfer itself */ }
            }
        },

        // Blob -> small square JPEG data URL (or null if the picture cannot be read). The app only ever shows product
        // pictures in square-ish boxes (object-fit: cover), so the middle square is all that needs to travel.
        _makeThumbnail(blob) {
            return new Promise((resolve) => {
                const url = URL.createObjectURL(blob);
                const img = new Image();
                const finish = (value) => { URL.revokeObjectURL(url); resolve(value); };
                img.onload = () => {
                    try {
                        const side = Math.min(img.naturalWidth, img.naturalHeight);
                        if (!side) { finish(null); return; }
                        const size = Math.min(this.THUMB_SIZE, side);
                        const canvas = document.createElement('canvas');
                        canvas.width = canvas.height = size;
                        canvas.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
                        finish(canvas.toDataURL('image/jpeg', 0.55));
                    } catch (e) { finish(null); }
                };
                img.onerror = () => finish(null);
                img.src = url;
            });
        },

        // Transfers come from other users: only ever accept a plain base64 picture
        _safeImageUrl(value) {
            return (typeof value === 'string' && value.length < 200000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) ? value : '';
        },

        _imageUrlToBlob(value) {
            const url = this._safeImageUrl(value);
            if (!url) return null;
            try {
                const binary = atob(url.slice(url.indexOf(',') + 1));
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                return new Blob([bytes], { type: url.slice(5, url.indexOf(';')) });
            } catch (e) { return null; }
        },

        async handleAddSalesperson() {
            const newPhone = document.getElementById('new-salesperson-phone').value.trim();
            if(newPhone.length < 10) {
                say("Enter a valid phone number.", "Check the number");
                return;
            }
            
            if(!this.state.firebaseReady) {
                say("You need internet to add a salesperson.", "No internet");
                return;
            }
            
            // Check max 5 salespeople
            try {
                const retailersRef = window.fb.collection(window.fb.db, `retailer_stocks/${this.state.user.phone}/supplied_retailers`);
                const q = window.fb.query(retailersRef);
                const querySnapshot = await window.fb.getDocs(q);
                let salespersonCount = 0;
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    if(data.products && Object.values(data.products).some(p => p.isSalesperson)) {
                        salespersonCount++;
                    }
                });
                
                // Wait, some salespeople might not have recorded products yet. 
                // We should check 'users' collection or rely on the query above.
                // Assuming we query 'users' where wholesalerPhone == this.state.user.phone
                const usersRef = window.fb.collection(window.fb.db, 'users');
                const spQuery = window.fb.query(usersRef, window.fb.where('wholesalerPhone', '==', this.state.user.phone));
                const spSnap = await window.fb.getDocs(spQuery);
                if (spSnap.size >= 5) {
                    say("You can add up to 5 salespeople.", "Limit reached");
                    return;
                }
                
                // Generate 6 character code
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                let uniqueCode = '';
                for (let i = 0; i < 6; i++) {
                    uniqueCode += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                
                // Create user doc
                const newUserRef = window.fb.doc(window.fb.db, 'users', newPhone);
                await window.fb.setDoc(newUserRef, {
                    phone: newPhone,
                    type: 'Salesperson',
                    wholesalerPhone: this.state.user.phone,
                    wholesalerName: this.state.user.business,
                    business: this.state.user.business,
                    location: this.state.user.location,
                    uniqueCode: uniqueCode,
                    pin: null, // Indicates they haven't signed up yet
                    createdAt: window.fb.serverTimestamp()
                });
                
                // Create dummy product in retailer_stocks to make them show up immediately in the UI
                const spStockRef = window.fb.doc(window.fb.db, `retailer_stocks/${this.state.user.phone}/supplied_retailers/${newPhone}`);
                await window.fb.setDoc(spStockRef, {
                    retailerName: "Pending Salesperson",
                    retailerPhone: newPhone,
                    businessName: this.state.user.business,
                    products: {
                        "_setup": { stock: 0, unit: '', isSalesperson: true }
                    },
                    lastUpdate: window.fb.serverTimestamp()
                }, { merge: true });
                
                this.hideModal();
                this.elements.addSalespersonForm.reset();
                this.elements.generatedSalespersonCode.textContent = uniqueCode;
                this.showModal('salesperson-code-modal');
                
            } catch (e) {
                console.error("Error adding salesperson", e);
                say("The salesperson was not added. Please try again.", "Something went wrong");
            }
        },

        async handleLogShared(logId, targetPhone) {
            this.hideModal();
            const allSales = await DB.getAllSales();
            const updates = [];

            for (const saleId of this.state.selectedSales) {
                const saleToUpdate = allSales.find(s => s.id === saleId);
                if (saleToUpdate) {
                    saleToUpdate.pendingTransfer = { logId, to: targetPhone }; // latest transfer
                    saleToUpdate.pendingTransfers = [...(saleToUpdate.pendingTransfers || []), { logId, to: targetPhone }];
                    updates.push(DB.updateSale(saleToUpdate));
                }
            }

            await Promise.all(updates);
            this.exitSelectionMode();
            await this.updateDashboard();
            if (this.state.currentView === 'all-sales-view') {
                await this.renderAllSales();
            }
            this.watchPendingTransfers();
        },

        // Every transfer still waiting on a recipient for this sale (a sale can be offered to several people)
        _pendingLogIds(sale) {
            const ids = new Set((sale.pendingTransfers || []).map(t => t.logId));
            if (sale.pendingTransfer && sale.pendingTransfer.logId) ids.add(sale.pendingTransfer.logId);
            return [...ids];
        },

        // Listens for the recipient accepting any transfer that is still pending.
        async watchPendingTransfers() {
            if (!this.state.firebaseReady || !this.state.user || !this.state.user.phone) return;
            try {
                const sales = await DB.getAllSales();
                const pendingIds = new Set();
                sales.filter(s => !s.sharedAsLog).forEach(s => this._pendingLogIds(s).forEach(id => pendingIds.add(id)));
                if (!this._pendingWatchers) this._pendingWatchers = new Map();

                this._pendingWatchers.forEach((unsub, id) => {
                    if (!pendingIds.has(id)) { unsub(); this._pendingWatchers.delete(id); }
                });
                pendingIds.forEach(id => {
                    if (this._pendingWatchers.has(id)) return;
                    const unsub = window.fb.onSnapshot(
                        window.fb.doc(window.fb.db, 'shared_logs', id),
                        (snap) => {
                            if (!snap.exists()) return;
                            const data = snap.data();
                            if (!data.claimed) return;
                            const stop = this._pendingWatchers.get(id);
                            if (stop) { stop(); this._pendingWatchers.delete(id); }
                            this.handleTransferAccepted(id, data);
                        },
                        (error) => console.error('Transfer watcher error:', error)
                    );
                    this._pendingWatchers.set(id, unsub);
                });
            } catch (error) {
                console.error('Could not watch pending transfers:', error);
            }
        },

        stopWatchingTransfers() {
            if (this._pendingWatchers) {
                this._pendingWatchers.forEach(unsub => unsub());
                this._pendingWatchers.clear();
            }
        },

        async handleTransferAccepted(logId, logData) {
            if (!this._acceptedHandled) this._acceptedHandled = new Set();
            if (this._acceptedHandled.has(logId)) return;
            this._acceptedHandled.add(logId);

            const allSales = await DB.getAllSales();
            const affected = allSales.filter(s => !s.sharedAsLog && this._pendingLogIds(s).includes(logId));
            if (affected.length === 0) return;

            await Promise.all(affected.map(sale => {
                sale.sharedAsLog = true;
                sale.transferredTo = logData.claimedBy || (sale.pendingTransfer && sale.pendingTransfer.to);
                return DB.updateSale(sale);
            }));

            await this.updateDashboard();
            if (this.state.currentView === 'all-sales-view') await this.renderAllSales();

            let name = logData.claimedByName;
            let business = logData.claimedByBusiness;
            if ((!name || !business) && logData.claimedBy) {
                try {
                    const snap = await window.fb.getDoc(window.fb.doc(window.fb.db, 'users', logData.claimedBy));
                    if (snap.exists()) {
                        const u = snap.data();
                        name = name || u.name;
                        business = business || u.business;
                    }
                } catch (e) { /* fall back to the phone number below */ }
            }
            this.celebrateTransferAccepted(name || logData.claimedBy || 'Your customer', business || '');
        },

        celebrateTransferAccepted(name, business) {
            this.showCelebration({
                icon: '🎉',
                title: 'Transfer accepted',
                headline: name,
                sub: business,
                messages: ['You can now see when they are low on stock inside Customers. T&C apply.']
            });
        },

        // Centered popup with confetti and a chime. It stays until the user taps Okay; several are queued.
        showCelebration(opts) {
            if (!this._celebrationQueue) this._celebrationQueue = [];
            this._celebrationQueue.push(opts);
            if (!this._celebrationOpen) this._showNextCelebration();
        },

        _showNextCelebration() {
            const overlay = document.getElementById('celebration-overlay');
            const opts = this._celebrationQueue && this._celebrationQueue.shift();
            if (!overlay || !opts) { this._celebrationOpen = false; return; }
            this._celebrationOpen = true;

            overlay.innerHTML = '';
            const card = document.createElement('div');
            card.className = 'celebration-card';
            const add = (tag, cls, text) => {
                if (!text) return;
                const el = document.createElement(tag);
                el.className = cls;
                el.textContent = text;
                card.appendChild(el);
            };
            add('div', 'celebration-icon', opts.icon || '🎉');
            add('div', 'celebration-title', opts.title);
            add('div', 'celebration-name', opts.headline);
            add('div', 'celebration-sub', opts.sub);
            (opts.messages || []).forEach(m => add('p', 'celebration-msg', m));
            const okay = document.createElement('button');
            okay.type = 'button';
            okay.className = 'btn btn-primary';
            okay.textContent = 'Okay';
            okay.addEventListener('click', () => {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.style.display = 'none';
                    overlay.innerHTML = '';
                    this._showNextCelebration();
                }, 220);
            });
            card.appendChild(okay);
            overlay.appendChild(card);

            overlay.style.display = 'flex';
            requestAnimationFrame(() => overlay.classList.add('show'));
            this._playTransferChime();
            this.launchConfetti(overlay);
            okay.focus({ preventScroll: true });
        },

        // Confetti bursting out from the middle of the screen
        launchConfetti(container) {
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const host = container || document.body;
            const old = host.querySelector('#confetti-canvas');
            if (old) old.remove();
            const canvas = document.createElement('canvas');
            canvas.id = 'confetti-canvas';
            const dpr = window.devicePixelRatio || 1;
            const W = window.innerWidth, H = window.innerHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            host.insertBefore(canvas, host.firstChild);
            const ctx = canvas.getContext('2d');
            ctx.scale(dpr, dpr);

            const colors = ['#008C95', '#F5A623', '#ffffff', '#28a745', '#D0021B', '#5bc0de'];
            const pieces = Array.from({ length: 160 }, () => {
                const angle = Math.random() * Math.PI * 2;
                const speed = 5 + Math.random() * 11;
                return {
                    x: W / 2, y: H / 2,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 5,
                    size: 5 + Math.random() * 6,
                    rot: Math.random() * Math.PI,
                    vr: (Math.random() - 0.5) * 0.4,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    shape: Math.random() < 0.5 ? 'rect' : 'circle'
                };
            });

            const started = performance.now();
            const frame = (now) => {
                if (!canvas.isConnected) return;
                const elapsed = now - started;
                ctx.clearRect(0, 0, W, H);
                pieces.forEach(p => {
                    p.vy += 0.26;          // gravity
                    p.vx *= 0.985;         // air drag
                    p.vy *= 0.995;
                    p.x += p.vx;
                    p.y += p.vy;
                    p.rot += p.vr;
                    ctx.save();
                    ctx.globalAlpha = Math.max(0, 1 - Math.max(0, elapsed - 2800) / 1000);
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rot);
                    ctx.fillStyle = p.color;
                    if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
                    else { ctx.beginPath(); ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2); ctx.fill(); }
                    ctx.restore();
                });
                if (elapsed < 3800) requestAnimationFrame(frame);
                else canvas.remove();
            };
            requestAnimationFrame(frame);
        },

        // --- First come, first served -------------------------------------------------------------
        // Accepting is a single transaction: the log must still be unclaimed and none of its sales may have been
        // claimed through another transfer. Returns 'ok', 'taken', 'unenforced' (rules/legacy log) or 'error'.
        async _claimTransfer(log) {
            if (!log.id || !this.state.firebaseReady) return 'unenforced';
            const me = this.state.user.phone;
            const logRef = window.fb.doc(window.fb.db, 'shared_logs', log.id);
            const saleIds = Array.isArray(log.saleIds) ? log.saleIds : [];
            const claimRefs = saleIds.map(id => window.fb.doc(window.fb.db, 'shared_logs', `claim_${log.senderId}_${id}`));
            const taken = () => { const e = new Error('transfer already claimed'); e.taken = true; return e; };
            try {
                await window.fb.runTransaction(window.fb.db, async (tx) => {
                    const logSnap = await tx.get(logRef);
                    if (!logSnap.exists()) throw taken();
                    const current = logSnap.data();
                    if (current.claimed || current.voided) throw taken();
                    const claimSnaps = [];
                    for (const ref of claimRefs) claimSnaps.push(await tx.get(ref));
                    if (claimSnaps.some(snap => snap.exists())) throw taken();

                    claimRefs.forEach(ref => tx.set(ref, { claimedBy: me, logId: log.id, claimedAt: window.fb.serverTimestamp() }));
                    tx.update(logRef, {
                        claimed: true,
                        claimedAt: window.fb.serverTimestamp(),
                        claimedBy: me,
                        claimedByName: this.state.user.name || null,
                        claimedByBusiness: this.state.user.business || null
                    });
                });
                return 'ok';
            } catch (error) {
                if (error && error.taken) {
                    // best effort: stop this log from popping up again
                    try { await window.fb.updateDoc(logRef, { voided: true }); } catch (e) { /* not allowed: fine */ }
                    return 'taken';
                }
                if (error && error.code === 'permission-denied') {
                    console.warn('Could not enforce first-come claim (permissions); accepting without it.', error);
                    return 'unenforced';
                }
                console.error('Claiming transfer failed:', error);
                return 'error';
            }
        },

        _barcodesMatch(a, b) {
            if (!a || !b) return false;
            a = String(a).trim();
            b = String(b).trim();
            if (a === b) return true;
            // UPC-A (12 digits) is the same code as EAN-13 with a leading zero
            if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
                return (a.length === 12 && b === '0' + a) || (b.length === 12 && a === '0' + b);
            }
            return false;
        },

        _supplierDocRef(supplierId) {
            return window.fb.doc(window.fb.db, `retailer_stocks/${supplierId}/supplied_retailers/${this.state.user.phone}`);
        },

        // Takes a product's stock level off an earlier supplier's Customers view
        async _removeFromSupplier(supplierId, productKey) {
            if (!this.state.firebaseReady || !supplierId || !productKey) return;
            try {
                const ref = this._supplierDocRef(supplierId);
                const snap = await window.fb.getDoc(ref);
                if (!snap.exists()) return;
                await window.fb.setDoc(ref, { products: { [productKey]: window.fb.deleteField() }, lastUpdate: window.fb.serverTimestamp() }, { merge: true });
            } catch (error) {
                console.error('Could not remove product from earlier supplier:', error);
            }
        },

        // Keeps the last supplier's view of a received product in step with the owner's edits and visibility switch
        async _syncSupplierStock(product) {
            if (!this.state.firebaseReady || !product || !product.supplierId || !this.state.user.phone) return;
            if (product.isSalesperson || this.state.user.type === 'Salesperson') return;
            const key = product.originalName || product.name;
            try {
                if (product.stockVisible === false) {
                    await this._removeFromSupplier(product.supplierId, key);
                } else {
                    await window.fb.setDoc(this._supplierDocRef(product.supplierId), {
                        retailerName: this.state.user.name,
                        businessName: this.state.user.business,
                        retailerLocation: this.state.user.location,
                        retailerPhone: this.state.user.phone,
                        products: { [key]: { stock: product.stock, unit: product.unit, isSalesperson: false } },
                        lastUpdate: window.fb.serverTimestamp()
                    }, { merge: true });
                }
            } catch (error) {
                console.error('Could not sync stock visibility:', error);
            }
        },

        async handlePikaLogIdScanned(logId) {
            if (!this.state.firebaseReady) {
                say("You need internet to accept this transfer.", "No internet");
                return;
            }
            try {
                const logDocRef = window.fb.doc(window.fb.db, 'shared_logs', logId);
                const logDocSnap = await window.fb.getDoc(logDocRef);
                if (logDocSnap.exists()) {
                    const logData = logDocSnap.data();

                    // NEW: Check if claimed
                    if (logData.claimed) {
                        say("You already accepted these items.", "Already accepted");
                        return;
                    }
                    if (logData.voided) {
                        say("This transfer is no longer available.", "Not available");
                        return;
                    }

                    logData.id = logId; // Attach ID so we can update it later
                    this.handlePikaLogScanned(logData);
                } else {
                    say("This transfer was not found. It may have been cancelled.", "Not found");
                }
            } catch (error) {
                console.error("Error fetching shared log:", error);
                say("Could not open this transfer. Check your internet and try again.", "No internet");
            }
        },

        async handlePikaLogScanned(logData) {
            const senderRole = logData.senderRole;
            const currentUserRole = this.state.user.type;

            if (currentUserRole === 'Salesperson') {
                const allProducts = await DB.getAllProducts();
                const existingStock = allProducts.filter(p => p.stock > 0 && p.supplierId);
                if (existingStock.length > 0) {
                    const currentSupplierId = existingStock[0].supplierId;
                    if (currentSupplierId !== logData.senderId) {
                        this.showToast("Please sell all current stock before accepting products from a new wholesaler.");
                        return;
                    }
                }
            }

            if (currentUserRole === 'Salesperson' && senderRole === 'Salesperson') {
                this.showToast("Salespeople cannot accept transfers from other salespeople.");
                return;
            }
            if (currentUserRole === 'Wholesaler' && senderRole === 'Salesperson') {
                this.showToast("Wholesalers cannot accept transfers from salespeople.");
                return;
            }

            this.state.scannedLogData = logData;
            this.renderIncomingTransfer(logData, currentUserRole);
            this.showModal('incoming-transfer-modal');
        },

        // The accept popup is the sender's receipt: same paper, same lines, plus a small picture per product.
        renderIncomingTransfer(logData, currentUserRole) {
            const money = (n) => `&#8358;${this.formatNumber(n)}`;
            const items = Array.isArray(logData.items) ? logData.items : [];
            const totalCost = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
            const sent = DB._normalizeTimestamp(logData.timestamp);
            const dateStr = sent.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
            const timeStr = sent.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
            const anyPicture = items.some(item => this._safeImageUrl(item.image));

            // Discount and credit are optional extras from the sender, shown as small print under the total
            const amount = (v) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : 0; };
            const discountTotal = items.reduce((sum, item) => sum + amount(item.discount), 0);
            const balanceTotal = items.reduce((sum, item) => sum + amount(item.creditBalance), 0);
            const hasCredit = items.some(item => item.creditPaid != null || item.creditBalance != null);
            const totalDue = Math.max(0, totalCost - discountTotal);

            const itemsHtml = items.map(item => {
                const unit = this._esc(item.unit);
                const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
                let sub = '';
                if (item.unit === 'cartons' && item.subUnitType && item.subUnitQuantity > 0) {
                    sub = `<div class="rc-sub"><span>= ${this.formatNumber(item.quantity * item.subUnitQuantity)} ${this._esc(item.subUnitType)}</span></div>`;
                }
                const picture = this._safeImageUrl(item.image);
                const thumb = !anyPicture ? ''
                    : picture ? `<img class="rc-thumb" src="${picture}" alt="" width="40" height="40">`
                    : `<span class="rc-thumb" aria-hidden="true"></span>`;
                return `<div class="rc-item${anyPicture ? ' has-thumb' : ''}">${thumb}<div class="rc-item-main">` +
                    `<div class="rc-row"><span class="rc-item-name">${this._esc(item.name)}</span><span class="rc-amt">${money(lineTotal)}</span></div>` +
                    `<div class="rc-calc">${this.formatNumber(item.quantity)} ${unit} &times; ${money(item.price)}</div>${sub}` +
                    `</div></div>`;
            }).join('');

            const noticeText = currentUserRole === 'Salesperson'
                ? 'Your wholesaler will see your stock and sales.'
                : 'The sender will see your stock of these items.';

            this.elements.incomingTransferChip.textContent = `${items.length} item${items.length === 1 ? '' : 's'}`;
            this.elements.incomingTransferContent.innerHTML =
                `<div class="receipt-header"><div class="rc-from">From</div><div class="rc-store">${this._esc(logData.senderStore)}</div></div>` +
                `<div class="rc-info"><div class="rc-kv"><span>Sent</span><span>${dateStr} &middot; ${timeStr}</span></div></div>` +
                `<div class="rc-cols"><span>Product</span><span>Amount</span></div>` +
                `<div class="receipt-items">${itemsHtml}</div>` +
                `<div class="rc-summary">` +
                (discountTotal > 0 ? `<div class="rc-sum muted"><span>Discount</span><span>-${money(discountTotal)}</span></div>` : '') +
                `<div class="rc-total"><span>Total</span><span>${money(totalDue)}</span></div>` +
                (hasCredit ? `<div class="rc-sum muted"><span>Paid</span><span>${money(Math.max(0, totalDue - balanceTotal))}</span></div>` +
                    `<div class="rc-sum credit"><span>Balance</span><span>${money(balanceTotal)}</span></div>` : '') +
                `</div>` +
                `<p class="rc-note">${noticeText}</p>`;
            const scroller = this.elements.incomingTransferContent.parentElement;
            if (scroller) scroller.scrollTop = 0;
        },

        async acceptPikaLog() {
            if (!this.state.scannedLogData) return;

            const isSalesperson = this.state.user.type === 'Salesperson';
            const isRetailerReceiving = this.state.user.type === 'Retailer';
            const log = this.state.scannedLogData;
            const supplierId = log.senderId;

            // Only the first person to accept gets the products
            this.showLoader();
            let claim;
            try { claim = await this._claimTransfer(log); } finally { this.hideLoader(); }
            if (claim === 'taken') {
                this.hideModal();
                this.state.scannedLogData = null;
                say('Someone else already accepted this transfer.', 'Too late');
                return;
            }
            if (claim === 'error') {
                say('Could not accept this transfer. Check your internet and try again.', 'No internet');
                return;
            }

            const allProducts = await DB.getAllProducts();
            const productUpdates = [];
            const staleSupplierEntries = []; // [supplierId, productKey] pairs to take off earlier suppliers
            let updatedProductsForFirebase = {};

            for (const item of log.items) {
                let stockToAdd, unitType, costPrice, needsSetup, barcode, originalName, wholesalerPrice, subUnitType, subUnitQuantity;

                const isCarton = item.unit === 'cartons' && item.subUnitType && item.subUnitQuantity > 0;

                if (isSalesperson) {
                    stockToAdd = item.quantity;
                    unitType = item.unit;
                    costPrice = item.price;
                    needsSetup = 'price';
                } else if (isRetailerReceiving && isCarton) {
                    stockToAdd = item.quantity * item.subUnitQuantity;
                    unitType = item.subUnitType;
                    costPrice = item.price / item.subUnitQuantity;
                    needsSetup = 'barcode-and-price';
                } else {
                    stockToAdd = item.quantity;
                    unitType = item.unit;
                    costPrice = item.price;
                    needsSetup = 'price';
                }

                wholesalerPrice = item.price;
                barcode = item.barcode;
                originalName = item.name;
                subUnitType = item.subUnitType;
                subUnitQuantity = item.subUnitQuantity;

                // Same barcode = same product: add to what the user already has (even if it is named differently)
                let existingProduct = null;
                if (barcode) {
                    existingProduct = allProducts.find(p => this._barcodesMatch(p.barcode, barcode));
                }
                // Fall back to name matching if no barcode match
                if (!existingProduct) {
                    existingProduct = allProducts.find(p => (p.originalName || p.name).toLowerCase() === originalName.toLowerCase());
                }

                let finalProduct;

                if (existingProduct) {
                    const previousSupplier = existingProduct.supplierId;
                    const previousKey = existingProduct.originalName || existingProduct.name;
                    if (previousSupplier && previousSupplier !== supplierId) {
                        staleSupplierEntries.push([previousSupplier, previousKey]); // only the last supplier sees this stock
                    }
                    existingProduct.stock += stockToAdd;
                    existingProduct.supplierId = supplierId;
                    if (!existingProduct.barcode && barcode) {
                        existingProduct.barcode = barcode;
                    }
                    // A product the user has already priced keeps its price; only ask for one when it has none
                    if (!(Number(existingProduct.price) > 0)) {
                        existingProduct.needsSetup = needsSetup;
                    }
                    existingProduct.lockedUntilOOS = false;
                    // The sender's picture only fills a gap: a picture the user already has is never replaced
                    if (!existingProduct.image) {
                        const sentImage = this._imageUrlToBlob(item.image);
                        if (sentImage) existingProduct.image = sentImage;
                    }
                    existingProduct.isSalesperson = isSalesperson;
                    existingProduct.originalName = originalName;
                    existingProduct.wholesalerPrice = wholesalerPrice;
                    if (isCarton) {
                        existingProduct.subUnitType = subUnitType;
                        existingProduct.subUnitQuantity = subUnitQuantity;
                    }
                    finalProduct = existingProduct;
                } else {
                    finalProduct = {
                        id: Date.now() + Math.random(),
                        name: item.name,
                        originalName: originalName,
                        price: costPrice,
                        stock: stockToAdd,
                        unit: unitType,
                        image: this._imageUrlToBlob(item.image),
                        barcode: barcode,
                        createdAt: new Date(),
                        supplierId: supplierId,
                        lockedUntilOOS: false,
                        stockVisible: true,
                        isSalesperson: isSalesperson,
                        wholesalerPrice: wholesalerPrice,
                        needsSetup: needsSetup
                    };
                    if (isCarton) {
                        finalProduct.subUnitType = subUnitType;
                        finalProduct.subUnitQuantity = subUnitQuantity;
                    }
                    allProducts.push(finalProduct); // so a repeated barcode/name inside the same transfer is merged too
                }
                productUpdates.push(DB.saveProduct(finalProduct));
                if (finalProduct.stockVisible !== false) {
                    updatedProductsForFirebase[finalProduct.originalName] = { stock: finalProduct.stock, unit: finalProduct.unit, isSalesperson };
                }
            }

            await Promise.all(productUpdates);

            for (const [previousSupplier, previousKey] of staleSupplierEntries) {
                await this._removeFromSupplier(previousSupplier, previousKey);
            }

            if (this.state.firebaseReady && supplierId && this.state.user.phone) {
                try {
                    const retailerDocRef = this._supplierDocRef(supplierId);
                    let isNewCustomer = true;
                    try {
                        const existingDoc = await window.fb.getDoc(retailerDocRef);
                        isNewCustomer = !(existingDoc.exists() && existingDoc.data().joinedAt);
                    } catch (e) { /* treat as new */ }
                    const payload = {
                        retailerName: this.state.user.name,
                        businessName: this.state.user.business,
                        retailerLocation: this.state.user.location,
                        retailerPhone: this.state.user.phone,
                        products: updatedProductsForFirebase,
                        lastUpdate: window.fb.serverTimestamp()
                    };
                    if (isNewCustomer) payload.joinedAt = window.fb.serverTimestamp(); // keeps "last in" customers on top
                    await window.fb.setDoc(retailerDocRef, payload, { merge: true });
                } catch (error) {
                    console.error("Error updating stock to Firebase:", error);
                    say("Saved on this phone. It will sync when you are online.", "Saved");
                }
            }

            // Fallback when the first-come claim could not be made inside a transaction (legacy logs / rules)
            if (claim === 'unenforced' && log.id && this.state.firebaseReady) {
                try {
                    const logRef = window.fb.doc(window.fb.db, 'shared_logs', log.id);
                    await window.fb.updateDoc(logRef, {
                        claimed: true,
                        claimedAt: window.fb.serverTimestamp(),
                        claimedBy: this.state.user.phone || this.state.user.phone,
                        claimedByName: this.state.user.name || null,
                        claimedByBusiness: this.state.user.business || null
                    });
                } catch (error) {
                    console.error("Error marking log as claimed:", error);
                }
            }

            this.hideModal();
            this.state.scannedLogData = null;
            await this.renderProducts();
            this.navigateTo('products-view');
            this.showCelebration({
                icon: '📦',
                title: 'Products added',
                headline: log.senderStore ? `From ${log.senderStore}` : 'Transfer accepted',
                messages: [
                    'The items have been added to your products. Add your prices now.',
                    'Earn airtime points each time you record a sale for these products. T&C apply.'
                ]
            });
        },

        async renderRetailerStocks() {
            if (!navigator.onLine) {
                this.elements.internetNotice.style.display = 'flex';
                this.elements.retailerStockView.innerHTML = '';
                this.elements.salespeopleView.innerHTML = '';
                return;
            }
            this.elements.internetNotice.style.display = 'none';

            if (this.state.user && this.state.user.type === 'Salesperson') {
                const spTab = document.querySelector('[data-filter="salespeople"]');
                if (spTab) spTab.style.display = 'none';

                this.elements.stockViewFilterTabs.style.display = 'none';
                this.elements.retailerStockView.style.display = 'block';
                this.elements.salespeopleView.style.display = 'none';
                if(document.getElementById('add-salesperson-fab')) document.getElementById('add-salesperson-fab').style.display = 'none';
            } else {
                this.elements.stockViewFilterTabs.style.display = 'flex';
                if (this.state.stockViewFilter === 'customers') {
                    this.elements.retailerStockView.style.display = 'block';
                    this.elements.salespeopleView.style.display = 'none';
                    if(document.getElementById('add-salesperson-fab')) document.getElementById('add-salesperson-fab').style.display = 'none';
                } else {
                    this.elements.retailerStockView.style.display = 'none';
                    this.elements.salespeopleView.style.display = 'block';
                    if(document.getElementById('add-salesperson-fab')) document.getElementById('add-salesperson-fab').style.display = 'block';
                }
            }


            this.elements.retailerStockView.innerHTML = '<div class="spinner"></div>';
            this.elements.salespeopleView.innerHTML = '<div class="spinner"></div>';

            if (!this.state.firebaseReady || !this.state.user.phone) {
                const errorHtml = `<p class="empty-state">Could not connect to online services.</p>`;
                this.elements.retailerStockView.innerHTML = errorHtml;
                this.elements.salespeopleView.innerHTML = errorHtml;
                return;
            }

            try {
                if (this.state.retailerListener) {
                    this.state.retailerListener();
                }
                const retailersRef = window.fb.collection(window.fb.db, `retailer_stocks/${this.state.user.phone}/supplied_retailers`);
                const q = window.fb.query(retailersRef);

                this.state.retailerListener = window.fb.onSnapshot(q, async (querySnapshot) => {
                    const allSales = await DB.getAllSales();
                    const creditSales = allSales.filter(s => s.saleType === 'credit' && !s.creditSettled);

                    let customersHtml = '';
                    let salespeopleHtml = '';
                    const retailersData = [];
                    querySnapshot.forEach(doc => retailersData.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) }));

                    if (retailersData.length === 0 && creditSales.length === 0) {
                        const isRetailer = this.state.user && this.state.user.type === 'Retailer';
                        const emptyHtmlRetailer = isRetailer
                            ? `<p class="empty-state">Make credit sales to see customers owing you here.</p>`
                            : `<p class="empty-state">Sell and transfer products to the purchasing retailer or make credit sales to see customers here.</p>`;
                        const emptyHtmlSalespeople = `<p class="empty-state">Add your salespeople and see their daily sales summary here.</p>`;
                        this.elements.retailerStockView.innerHTML = emptyHtmlRetailer;
                        this.elements.salespeopleView.innerHTML = emptyHtmlSalespeople;
                        return;
                    }

                    retailersData.sort((a, b) => (b.lastUpdate?.toDate() || 0) - (a.lastUpdate?.toDate() || 0));
                    creditSales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                    const renderedCreditCustomers = new Set();
                    const customerCards = []; // { time, html } - newest first, whatever kind of card it is

                    for (const sale of creditSales) {
                        const matchedRetailer = sale.customerPhone ? retailersData.find(r => r.id === sale.customerPhone) : null;
                        customerCards.push({ time: new Date(sale.timestamp).getTime() || 0, html: this.buildCreditCard(sale, matchedRetailer) });
                        if (matchedRetailer) {
                            renderedCreditCustomers.add(matchedRetailer.id);
                        }
                    }

                    for (const retailer of retailersData) {
                        const isSalesperson = Object.values(retailer.products || {}).some(p => p.isSalesperson);

                        if (isSalesperson) {
                            salespeopleHtml += await this.buildSalespersonCard(retailer);
                        } else {
                            if (!renderedCreditCustomers.has(retailer.id)) {
                                // when they first came on board (older customers fall back to their last activity)
                                const joined = (retailer.joinedAt && retailer.joinedAt.toDate && retailer.joinedAt.toDate()) ||
                                    (retailer.lastUpdate && retailer.lastUpdate.toDate && retailer.lastUpdate.toDate());
                                customerCards.push({ time: joined ? joined.getTime() : 0, html: this.buildCustomerCard(retailer) });
                            }
                        }
                    }
                    customerCards.sort((a, b) => b.time - a.time);
                    customersHtml = customerCards.map(card => card.html).join('');

                    this.elements.retailerStockView.innerHTML = customersHtml || `<p class="empty-state">No customers added yet.</p>`;
                    this.elements.salespeopleView.innerHTML = salespeopleHtml || `<p class="empty-state">No salespeople added yet. Tap the "+" button to add salespeople</p>`;

                    this.addDeleteEventListeners();
                    this.addSalespersonEventListeners();

                }, (error) => {
                    console.error("Error fetching retailer stocks in real-time:", error);
                    const errorHtml = `<p class="empty-state">Error loading data.</p>`;
                    this.elements.retailerStockView.innerHTML = errorHtml;
                    this.elements.salespeopleView.innerHTML = errorHtml;
                });
            } catch (error) {
                console.error("Error setting up retailer stocks listener:", error);
                const errorHtml = `<p class="empty-state">Error loading data.</p>`;
                this.elements.retailerStockView.innerHTML = errorHtml;
                this.elements.salespeopleView.innerHTML = errorHtml;
            }
        },

        buildCustomerCard(retailer) {
            let productsHtml = '';
            if (this.state.user.type !== 'Retailer') {
                if (retailer.products && Object.keys(retailer.products).length > 0) {
                    for (const productName in retailer.products) {
                        const product = retailer.products[productName];
                        const stockClass = product.stock <= 0 ? 'out-of-stock' : (product.stock < 10 ? 'restock-now' : '');
                        productsHtml += `<div class="retailer-product-item ${stockClass}"><span>${productName}</span><strong>${this._esc(this.formatStockRange(product.stock, product.unit))}</strong></div>`;
                    }
                } else {
                    productsHtml = `<div class="retailer-product-item"><span>No product data available.</span></div>`;
                }
            } else {
                productsHtml = `<div class="retailer-product-item"><span>Not tracking customer stock.</span></div>`;
            }

            const phoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
            const callButton = retailer.retailerPhone ? `<a href="tel:${retailer.retailerPhone}" class="retailer-call-btn" title="Call ${retailer.retailerName}">${phoneIcon}</a>` : '';
            const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
            const status = this.formatTimeAgo(retailer.lastUpdate?.toDate());

            return `
                <div class="card" data-retailer-id="${retailer.id}" data-retailer-name="${retailer.retailerName}">
                    <div class="retailer-header">
                        <div style="flex-grow: 1;">
                            <h4>${retailer.retailerName} (${retailer.retailerLocation})</h4>
                            <p class="retailer-status ${status.className}">${status.text}</p>
                        </div>
                        ${callButton}
                    </div>
                    <div class="retailer-product-list">${productsHtml}</div>
                    <div class="card-footer">
                        <button class="delete-retailer-btn">${deleteIcon}</button>
                    </div>
                </div>
            `;
        },

        // "Today", "Yesterday", "12 Oct" (with the year once it is not this year)
        formatCreditDate(value) {
            const date = DB._normalizeTimestamp(value);
            const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
            const daysAgo = Math.round((dayStart(new Date()) - dayStart(date)) / 86400000);
            if (daysAgo === 0) return 'Today';
            if (daysAgo === 1) return 'Yesterday';
            const thisYear = date.getFullYear() === new Date().getFullYear();
            return date.toLocaleDateString('en-GB', thisYear ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' });
        },

        buildCreditCard(sale, retailer) {
            const e = (v) => this._esc(v);
            const money = (n) => `₦${this.formatNumber(n)}`;
            const phoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
            const checkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

            // Their tracked stock, only for suppliers whose customer is on PikaShot
            let stockHtml = '';
            let callPhone = sale.customerPhone;
            let callName = sale.customerName;
            if (retailer) {
                callPhone = retailer.retailerPhone || callPhone;
                callName = retailer.retailerName || callName;
                if (this.state.user.type !== 'Retailer') {
                    let rows = '';
                    if (retailer.products && Object.keys(retailer.products).length > 0) {
                        for (const productName in retailer.products) {
                            const product = retailer.products[productName];
                            const stockClass = product.stock <= 0 ? 'out-of-stock' : (product.stock < 10 ? 'restock-now' : '');
                            rows += `<div class="retailer-product-item ${stockClass}"><span>${e(productName)}</span><strong>${e(this.formatStockRange(product.stock, product.unit))}</strong></div>`;
                        }
                    } else {
                        rows = `<div class="retailer-product-item"><span>No stock shared yet.</span></div>`;
                    }
                    const status = this.formatTimeAgo(retailer.lastUpdate?.toDate());
                    stockHtml = `<div class="credit-stock"><div class="credit-stock-head"><h5>Their stock</h5><span class="retailer-status ${status.className}">${e(status.text)}</span></div>${rows}</div>`;
                }
            }
            const callButton = callPhone ? `<a href="tel:${e(callPhone)}" class="retailer-call-btn" title="Call ${e(callName)}" aria-label="Call ${e(callName)}">${phoneIcon}</a>` : '';

            const worth = (Number(sale.quantity) || 0) * (Number(sale.price) || 0);
            const paid = Number(sale.total) || 0; // part payment is saved as the sale's total
            const owed = Math.max(0, worth - paid);
            const paidPercent = worth > 0 ? Math.min(100, Math.round(paid / worth * 100)) : 0;

            return `
                <div class="card credit-card" data-credit-id="${sale.id}" data-customer-name="${e(sale.customerName)}">
                    <div class="credit-top">
                        <div class="credit-who">
                            <h4><span class="credit-name">${e(sale.customerName)}</span><span class="credit-pill">Credit</span></h4>
                            <p class="credit-when">${this.formatCreditDate(sale.timestamp)}</p>
                        </div>
                        ${callButton}
                    </div>
                    <div class="credit-item"><span class="credit-item-name">${e(sale.productName)}</span><span class="credit-item-qty">${this.formatNumber(sale.quantity)} ${e(sale.unit)}</span></div>
                    <div class="credit-owes"><span>Owes</span><strong>${money(owed)}</strong></div>
                    <div class="credit-bar" role="img" aria-label="${money(paid)} of ${money(worth)} paid"><span style="width: ${paidPercent}%"></span></div>
                    <div class="credit-paid"><span>${money(paid)} paid</span><span>${money(worth)} total</span></div>
                    ${stockHtml}
                    <button type="button" class="delete-credit-btn" data-id="${sale.id}">${checkIcon}<span>Fully repaid?</span></button>
                </div>
            `;
        },

        async buildSalespersonCard(retailer) {
            const salesData = await this.getSalespersonSales(retailer.id);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todaysSales = salesData.filter(s => new Date(s.timestamp) >= today);
            const totalSalesToday = todaysSales.reduce((sum, s) => sum + s.total, 0);

            let todaysSalesHtml = '<p class="empty-state" style="font-size: 0.8rem; padding: 5px 0;">No sales for today yet.</p>';
            if (todaysSales.length > 0) {
                const salesByProduct = todaysSales.reduce((acc, sale) => {
                    if (!acc[sale.productName]) {
                        acc[sale.productName] = { quantity: 0, unit: sale.unit || 'pieces' };
                    }
                    acc[sale.productName].quantity += sale.quantity;
                    return acc;
                }, {});

                todaysSalesHtml = Object.entries(salesByProduct)
                    .map(([name, data]) => `<div class="sales-day-item"><span>${name}</span> <span>${this.formatNumber(data.quantity)} ${data.unit} sold</span></div>`)
                    .join('');
            }

            const previousSalesByDay = this.groupSalesByDate(
                salesData.filter(s => new Date(s.timestamp) < today)
            );

            let previousDaysHtml = '';
            for (const date in previousSalesByDay) {
                const dayData = previousSalesByDay[date];
                const safeDateKey = date.split(', ')[1] ? new Date(date.split(', ')[1] + ' ' + new Date().getFullYear()).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }).replace(/[^a-zA-Z0-9]/g, '_') : date.replace(/[^a-zA-Z0-9]/g, '_');

                if (!retailer.acknowledgedSales || !retailer.acknowledgedSales[safeDateKey]) {
                    const total = dayData.reduce((sum, s) => sum + s.total, 0);
                    previousDaysHtml += `
                        <div class="sales-day">
                            <div class="sales-day-header">
                                <strong>${date}</strong>
                                <span>Total: ₦${this.formatNumber(total)}</span>
                            </div>
                            <div class="sales-day-actions">
                                <label>Received payment?</label>
                                <div class="sales-day-buttons">
                                    <button class="btn-yes" data-date="${date}" data-total="${total}">YES</button>
                                    <button class="btn-no" data-date="${date}">NO</button>
                                </div>
                            </div>
                        </div>`;
                }
            }

            const infoIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
            const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
            const status = this.formatTimeAgo(retailer.lastUpdate?.toDate());

            return `
                <div class="card salesperson-card" data-retailer-id="${retailer.id}" data-retailer-name="${retailer.retailerName}">
                    <div class="retailer-header">
                        <div style="flex-grow: 1;">
                            <h4>${retailer.retailerName} (${retailer.businessName || ''})</h4>
                            <p class="retailer-status ${status.className}">${status.text}</p>
                        </div>
                        <button class="info-btn" title="View Stock">${infoIcon}</button>
                    </div>
                    <div class="salesperson-summary">
                        <div class="sales-section">
                            <h5>Today's Sales (${today.toLocaleDateString('en-NG', { month: 'short', day: 'numeric' })})</h5>
                            <div class="sales-today-details">${todaysSalesHtml}</div>
                            ${todaysSales.length > 0 ? `<div class="sales-today-total">Total for today: ₦${this.formatNumber(totalSalesToday)}</div>` : ''}
                        </div>
                        <div class="sales-section">
                            <h5>Previous Unconfirmed Sales</h5>
                            ${previousDaysHtml || '<p class="empty-state" style="font-size: 0.8rem; padding: 5px 0;">No previous unconfirmed sales.</p>'}
                        </div>
                    </div>
                     <div class="card-footer">
                        <button class="delete-retailer-btn">${deleteIcon}</button>
                    </div>
                </div>`;
        },

        getRecentSalesDays(sales, count) {
            const salesByDay = {};
            sales.forEach(sale => {
                const saleDate = new Date(sale.timestamp).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
                if (!salesByDay[saleDate]) {
                    salesByDay[saleDate] = { total: 0, date: saleDate, timestamp: new Date(sale.timestamp).setHours(0, 0, 0, 0) };
                }
                salesByDay[saleDate].total += sale.total;
            });

            return Object.values(salesByDay)
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, count);
        },

        async getSalespersonSales(salespersonId) {
            if (!this.state.firebaseReady || !this.state.user.phone) return [];
            try {
                const salesRef = window.fb.collection(window.fb.db, `retailer_stocks/${this.state.user.phone}/supplied_retailers/${salespersonId}/sales`);
                const q = window.fb.query(salesRef);
                const querySnapshot = await window.fb.getDocs(q);
                const sales = [];
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    sales.push({ ...data, timestamp: data.timestamp.toDate() });
                });
                return sales.sort((a, b) => b.timestamp - a.timestamp);
            } catch (error) {
                console.error("Error fetching salesperson sales:", error);
                return [];
            }
        },

        addSalespersonEventListeners() {
            document.querySelectorAll('.info-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const card = e.target.closest('.card');
                    const retailerId = card.dataset.retailerId;
                    this.showSalespersonStockModal(retailerId);
                });
            });

            document.querySelectorAll('.btn-yes').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const card = e.target.closest('.card');
                    const retailerId = card.dataset.retailerId;
                    const date = e.target.dataset.date;
                    const total = e.target.dataset.total;

                    if (await ask({ title: 'Confirm payment', text: `Did you receive ₦${this.formatNumber(total)} for ${date}? You cannot undo this.`, ok: 'Yes, received', cancel: 'Cancel' })) {
                        this.acknowledgeSales(retailerId, date);
                    }
                });
            });

            document.querySelectorAll('.btn-no').forEach(button => {
                button.addEventListener('click', (e) => {
                    // When "No" is clicked, we just remove the action buttons for that day for this session.
                    // It will reappear on next refresh if not confirmed.
                    e.target.closest('.sales-day-actions').style.display = 'none';
                });
            });
        },

        async showSalespersonStockModal(retailerId) {
            if (!this.state.firebaseReady) {
                this.showToast("Not connected to online services.");
                return;
            }
            try {
                const docRef = window.fb.doc(window.fb.db, `retailer_stocks/${this.state.user.phone}/supplied_retailers/${retailerId}`);
                const docSnap = await window.fb.getDoc(docRef);

                if (docSnap.exists()) {
                    const retailer = docSnap.data();
                    let productsHtml = '';
                    if (retailer.products && Object.keys(retailer.products).length > 0) {
                        for (const productName in retailer.products) {
                            const product = retailer.products[productName];
                            const stockClass = product.stock <= 0 ? 'out-of-stock' : (product.stock < 10 ? 'restock-now' : '');
                            productsHtml += `<div class="retailer-product-item ${stockClass}"><span>${productName}</span><strong>${this._esc(this.formatStockRange(product.stock, product.unit))}</strong></div>`;
                        }
                    } else {
                        productsHtml = `<p class="empty-state">No product data available.</p>`;
                    }

                    // For simplicity, using a generic modal. You could create a dedicated one.
                    this.elements.confirmLogTitle.textContent = `${retailer.retailerName}'s Stock`;
                    this.elements.confirmLogContent.innerHTML = `<div class="retailer-product-list" style="padding: 0;">${productsHtml}</div>`;
                    this.elements.rejectLogBtn.textContent = "Close";
                    this.elements.acceptLogBtn.style.display = 'none';
                    this.showModal('confirm-log-modal');

                    // Reset modal for next use
                    this.elements.rejectLogBtn.onclick = () => {
                        this.hideModal();
                        // Reset to default state
                        this.elements.rejectLogBtn.textContent = "Reject";
                        this.elements.acceptLogBtn.style.display = 'inline-block';
                        this.elements.rejectLogBtn.onclick = null;
                    };
                } else {
                    this.showToast("Could not find salesperson data.");
                }
            } catch (error) {
                console.error("Error fetching salesperson stock:", error);
                this.showToast("Failed to load stock data.");
            }
        },

        async acknowledgeSales(retailerId, date) {
            if (!this.state.firebaseReady || !this.state.user || !this.state.user.phone) {
                this.showToast("Failed to acknowledge payment: Not connected.");
                return;
            }
            try {
                const docRef = window.fb.doc(window.fb.db, `retailer_stocks/${this.state.user.phone}/supplied_retailers/${retailerId}`);
                const updateData = {};
                const safeDateKey = date.split(', ')[1] ? new Date(date.split(', ')[1] + ' ' + new Date().getFullYear()).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }).replace(/[^a-zA-Z0-9]/g, '_') : date.replace(/[^a-zA-Z0-9]/g, '_');
                updateData[`acknowledgedSales.${safeDateKey}`] = {
                    acknowledged: true,
                    wholesalerName: this.state.user.business
                };

                await window.fb.updateDoc(docRef, updateData);
                this.showToast(`Payment for ${date} acknowledged.`);
            } catch (error) {
                console.error("Error acknowledging sales:", error);
                this.showToast("Failed to acknowledge payment.");
            }
        },


        addDeleteEventListeners() {
            document.querySelectorAll('.delete-retailer-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const card = e.target.closest('.card');
                    const retailerId = card.dataset.retailerId;
                    const retailerName = card.dataset.retailerName;

                    if (await ask({ title: 'Remove from list', text: `Remove ${retailerName}? They will be taken off your list.`, ok: 'Remove', cancel: 'Cancel', danger: true })) {
                        try {
                            const docRef = window.fb.doc(window.fb.db, `retailer_stocks/${this.state.user.phone}/supplied_retailers/${retailerId}`);
                            await window.fb.deleteDoc(docRef);
                            this.showToast(`${retailerName} has been removed.`);
                        } catch (error) {
                            console.error("Error removing retailer: ", error);
                            this.showToast(`Failed to remove ${retailerName}.`);
                        }
                    }
                });
            });

            document.querySelectorAll('.delete-credit-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const card = btn.closest('.card');
                    const creditId = Number(card.dataset.creditId);
                    const customerName = card.dataset.customerName || 'this customer';

                    const confirmed = await this.requestPin(`Confirm that ${customerName} has fully repaid.`);
                    if (!confirmed) return;

                    try {
                        // The card leaves this tab; the sale itself stays in the sales history
                        const sales = await DB.getAllSales();
                        const sale = sales.find(s => s.id === creditId);
                        if (!sale) throw new Error('Credit sale not found');
                        sale.creditSettled = true;
                        sale.creditSettledAt = Date.now();
                        await DB.updateSale(sale);
                        card.remove();
                        this.showToast('Credit card removed.');
                        this.renderRetailerStocks(); // refresh the tab
                    } catch (error) {
                        console.error('Error updating credit record: ', error);
                        this.showToast('Failed to remove the credit card.');
                    }
                });
            });

        },


        formatTimeAgo(date) {
            if (!date || !(date instanceof Date)) {
                return { text: 'Status unknown', className: 'offline' };
            }

            const now = new Date();
            const seconds = Math.round((now - date) / 1000);

            if (seconds < 60) {
                return { text: 'Online now', className: 'online' };
            }
            const minutes = Math.round(seconds / 60);
            if (minutes < 60) {
                return { text: `Online ${minutes} min ago`, className: 'online' };
            }
            const hours = Math.round(minutes / 60);
            if (hours < 24) {
                return { text: `Online ${hours} hr ago`, className: 'away' };
            }
            const days = Math.round(hours / 24);
            if (days < 7) {
                return { text: `Online ${days} day${days > 1 ? 's' : ''} ago`, className: 'offline' };
            }
            const formattedDate = date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
            return { text: `Last online: ${formattedDate}`, className: 'offline' };
        },

        // What a supplier sees of a customer's stock: only a range of tens, never the exact count
        // (0-9 -> "<10 packs left", 10-19 -> "<20 packs left", ...)
        formatStockRange(stock, unit) {
            const count = Math.max(0, Number(stock) || 0);
            return `<${(Math.floor(count / 10) + 1) * 10} ${unit || 'units'} left`;
        },

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

        async _requestPersistentStorage() {
            if (navigator.storage && navigator.storage.persist) {
                try {
                    const isPersisted = await navigator.storage.persisted();
                    console.log(`Storage is already persistent: ${isPersisted}`);
                    if (!isPersisted) {
                        const result = await navigator.storage.persist();
                        console.log(`Storage persistence successfully requested: ${result}`);
                    }
                } catch (error) {
                    console.error("Failed to request persistent storage:", error);
                }
            } else {
                console.log("Persistent Storage API not supported.");
            }
        },

        handleBeforeInstallPrompt(event) {
            event.preventDefault();
            this.state.deferredInstallPrompt = event;
            this.elements.installBtn.style.display = 'block';
            if (this._updateInstallBox) this._updateInstallBox();
        },
        promptInstall() {
            const prompt = this.state.deferredInstallPrompt;
            if (!prompt) return;
            prompt.prompt();
            prompt.userChoice.then((choice) => {
                this.state.deferredInstallPrompt = null;
                this.elements.installBtn.style.display = 'none';
                if (this._updateInstallBox) this._updateInstallBox();
            });
        },
        registerServiceWorker() { if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/serviceworker.js').then(reg => console.log('Service Worker registered.')).catch(err => console.error('Service Worker registration failed:', err)); }); } },

        async showProfileModal() {
            if (this.state.user) {
                this.elements.profileName.textContent = this.state.user.name;
                this.elements.profileBusiness.textContent = this.state.user.business;
                this.elements.profileLocation.textContent = this.state.user.location;
                this.elements.profilePhone.textContent = this.state.user.phone || this.state.user.phone; // Handle both cases
                this.elements.profileRole.textContent = this.state.user.type;

                await this.updateScanTracker();

                this.showModal('profile-modal');
            }
        },

        async updateScanTracker() {
            const count = await DB.getScanCountForToday();
            this.elements.scanCount.textContent = count;

            const progress = Math.min((count / 100) * 100, 100);
            this.elements.scanProgress.style.width = `${progress}%`;

            let rewardText = '';
            if (count >= 100) {
                rewardText = 'Over 100 scans! You are a SUPERSTAR! 🎉';
            } else if (count >= 50) {
                rewardText = 'You are on fire! Keep going! 🔥';
            } else if (count >= 25) {
                rewardText = 'Great start! Let\'s do more! 🚀';
            } else if (count > 0) {
                rewardText = '👍 Scan more for free airtime!';
            } else {
                rewardText = 'Record sales for free airtime';
            }
            this.elements.scanReward.textContent = rewardText;
        },

        async fetchAcknowledgedSales() {
            if (this.state.user.type !== 'Salesperson' || !this.state.firebaseReady) return;

            const allProducts = await DB.getAllProducts();
            const productWithSupplier = allProducts.find(p => p.supplierId);
            if (!productWithSupplier) {
                this.state.acknowledgedSalesData = {};
                return;
            }
            const supplierId = productWithSupplier.supplierId;

            try {
                const docRef = window.fb.doc(window.fb.db, `retailer_stocks/${supplierId}/supplied_retailers/${this.state.user.phone}`);
                const docSnap = await window.fb.getDoc(docRef);
                if (docSnap.exists() && docSnap.data().acknowledgedSales) {
                    this.state.acknowledgedSalesData = docSnap.data().acknowledgedSales;
                } else {
                    this.state.acknowledgedSalesData = {};
                }
            } catch (error) {
                console.error("Error fetching acknowledged sales data:", error);
                this.state.acknowledgedSalesData = {};
            }
        },
    };

    App.init();
});
