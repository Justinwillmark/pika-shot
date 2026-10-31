document.addEventListener('DOMContentLoaded', () => {
    // Messages and questions use PikaShot's own pop-up (App._dialog), never the browser's alert/confirm
    const say = (text, title) => App._say(text, title);
    const ask = (options) => App._ask(options);
    window.pikaSay = say;
    const CFG = window.PIKA_CONFIG || {};
    const LIMITS = { maxProducts: CFG.maxProducts || 130, editsPerHour: CFG.editsPerHour || 5, maxDevices: CFG.maxDevices || 4 };

    const App = {
        // --- DOM ELEMENTS ---
        elements: {
            appHeader: document.getElementById('app-header'),
            menuBtn: document.getElementById('menu-btn'),
            backArrowBtn: document.getElementById('back-arrow-btn'),
            welcomeName: document.getElementById('welcome-name'),
            homeView: document.getElementById('home-view'),
            offlineBanner: document.getElementById('offline-banner'),
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
            lowStockSettingsBtn: document.getElementById('low-stock-settings-btn'),
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
            discountInputWrapper: document.getElementById('discount-input-wrapper'),
            inputContactWrapper: document.getElementById('input-contact-wrapper'),
            selectContactBtn: document.getElementById('select-contact-btn'),
            selectedContactName: document.getElementById('selected-contact-name'),
            amountOwing: document.getElementById('amount-owing'),
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
            cancelEntryChoiceBtn: document.getElementById('cancel-entry-choice-btn'),
            retrySellScanBtn: document.getElementById('retry-sell-scan-btn'),
            selectFromProductsBtn: document.getElementById('select-from-products-btn'),
            scanSelectFromProductsBtn: document.getElementById('scan-select-from-products-btn'),
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
            profileModal: document.getElementById('profile-modal'),
            profileAccount: document.getElementById('profile-account'),
            profileAccountToggle: document.getElementById('profile-account-toggle'),
            profileAccountPanel: document.getElementById('profile-account-panel'),
            profileAccountName: document.getElementById('profile-account-name'),
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
        },

        // --- INITIALIZATION ---
        async init() {
            this.showLoader();
            this.registerServiceWorker();
            this.handleOnlineStatusChange = this.handleOnlineStatusChange.bind(this);
            window.addEventListener('online', () => {
                this._showConnection(true);
                if (!this.state.user) return;
                this.ensureFirebase().then(() => { this.checkIncomingTransfers(); this.watchPendingTransfers(); });
            });
            window.addEventListener('offline', () => this._showConnection(false));
            this._showConnection(navigator.onLine, true);
            this.setupEventListeners();

            try {
                await DB.init();
                this._requestPersistentStorage();
                await this.initFirebase();

                // Check if user is already logged in locally
                this.state.user = await DB.getUser();
                DB.setIdentity(this.state.user);
                if (this._isSalesperson()) {
                    // They may have been confirmed (or removed) since this phone last checked
                    const businessName = this.state.user.businessName;
                    if (await this._loadBusinessLink() === 'removed') await this._removedFromBusiness(businessName);
                }

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
            if (this.elements.todaysSalesCard) {
                this.elements.todaysSalesCard.addEventListener('click', () => this.navigateTo('all-sales-view'));
            }
            if (this.elements.itemsSoldCard) {
                this.elements.itemsSoldCard.addEventListener('click', () => this.navigateTo('all-sales-view'));
            }
            this.elements.backArrowBtn.addEventListener('click', () => this._back());
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
                document.getElementById('business-name-group').hidden = btn.dataset.value === 'Salesperson'; // they have no business to name
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
                    this._privacyBack = null;
                    this.showModal('privacy-policy-modal');
                });
            });
            // Also keep old listener if modal was opened differently
            if (this.elements.privacyLink) {
                this.elements.privacyLink.addEventListener('click', (e) => { e.preventDefault(); this.showModal('privacy-policy-modal'); });
            }
            this.elements.privacyOkBtn.addEventListener('click', () => {
                const back = this._privacyBack;
                this._privacyBack = null;
                if (back) this.showModal(back); else this.hideModal();
            });
            document.getElementById('profile-privacy-btn').addEventListener('click', () => {
                this._privacyBack = 'profile-modal';
                this.showModal('privacy-policy-modal');
                document.querySelector('#privacy-policy-modal .policy-scroll').scrollTop = 0;
            });

            // ... (Rest of event listeners) ...
            this.elements.grantLocationBtn.addEventListener('click', this.handleLocationPermission.bind(this));
            this.elements.grantCameraBtn.addEventListener('click', this.handleCameraPermission.bind(this));
            this.elements.navButtons.forEach(btn => btn.addEventListener('click', () => this.navigateTo(btn.dataset.view)));
            this.elements.sellItemBtnMain.addEventListener('click', this.startSellScan.bind(this));
            this.elements.addNewProductBtn.addEventListener('click', this.startAddProduct.bind(this));
            this.elements.productForm.addEventListener('submit', this.handleSaveProduct.bind(this));
            this.elements.deleteProductBtn.addEventListener('click', this.handleDeleteProduct.bind(this));
            this.elements.cancelProductFormBtn.addEventListener('click', () => this.hideModal());
            this.elements.cancelScanBtn.addEventListener('click', () => { this.state.isScanCanceled = true; Camera.stop(); this._back(); });
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
            // Salespeople: the admin adds one with a code; the salesperson types it in
            document.getElementById('add-salesperson-fab').addEventListener('click', () => this.openAddSalesperson());
            document.getElementById('sp-add-cancel').addEventListener('click', () => this.closeAddSalesperson());
            document.getElementById('sp-add-go').addEventListener('click', () => this.handleGetSalespersonCode());
            const spPhone = document.getElementById('sp-add-phone');
            spPhone.addEventListener('input', (e) => {
                const digits = this._localPhone(e.target.value);
                if (e.target.value !== digits) e.target.value = digits;
                document.getElementById('sp-add-error').textContent = '';
            });
            spPhone.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.handleGetSalespersonCode(); } });
            document.getElementById('sp-copy').addEventListener('click', () => this.copySalespersonCode());
            document.getElementById('sp-new').addEventListener('click', () => this.handleNewSalespersonCode());
            document.getElementById('sp-done').addEventListener('click', () => this.closeAddSalesperson());
            const spCode = document.getElementById('sp-code-input');
            spCode.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
                document.getElementById('sp-code-btn').disabled = e.target.value.length !== 4;
                document.getElementById('sp-code-error').textContent = '';
            });
            spCode.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.handleSalespersonCode(); } });
            document.getElementById('sp-code-btn').addEventListener('click', () => this.handleSalespersonCode());
            document.getElementById('sp-logout-btn').addEventListener('click', () => this.handleLogout());
            // How few left counts as "Low stock"
            this.elements.lowStockSettingsBtn.addEventListener('click', () => this.openLowStockSettings());
            document.getElementById('low-stock-cancel').addEventListener('click', () => this.hideModal());
            document.getElementById('low-stock-save').addEventListener('click', () => this.handleSaveLowStock());
            const lowInput = document.getElementById('low-stock-input');
            lowInput.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });
            lowInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); this.handleSaveLowStock(); } });
            this.elements.salespeopleView.addEventListener('click', (e) => {
                const el = e.target.closest('[data-act]');
                const card = el && el.closest('.sp-card');
                if (!card) return;
                const { phone, name } = card.dataset;
                if (el.dataset.act === 'remove') this.removeSalesperson(phone, name);
                else if (el.dataset.act === 'received') this.confirmSalespersonMoney(phone, name, el.closest('.sp-day').dataset.day);
                else if (el.dataset.act === 'credit') this.showCustomersTab();
            });
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
            this.elements.printReceiptBtn.addEventListener('click', () => { window.print(); this._nudgeAct('receipt'); });
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
            this.elements.retrySellScanBtn.addEventListener('click', () => { this.hideModal(); this.startSellScan(); });
            this.elements.selectFromProductsBtn.addEventListener('click', this.showProductSelection.bind(this));
            if (this.elements.scanSelectFromProductsBtn) {
                this.elements.scanSelectFromProductsBtn.addEventListener('click', () => {
                    this.state.isScanCanceled = true;
                    Camera.stop();
                    this.showProductSelection();
                });
            }
            // The - and + buttons count by one (a ".5" someone typed stays) and stop at what is in stock
            const stepSaleQuantity = (direction) => {
                const input = this.elements.saleQuantityInput;
                const current = Math.round(this.unformatNumber(input.value) * 2) / 2;
                const product = this.state.sellingProduct;
                const inStock = product ? product.stock + (this.state.editingSale ? this.state.editingSale.quantity : 0) : Infinity;
                const next = current + direction;
                if (next < 0.5) return;
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
            this.elements.refreshStocksBtn.addEventListener('click', () => { this.state.retailersAt = 0; this.renderRetailerStocks(); }); // (a salesperson's list is read again, not reused)
            this.elements.cartonDetailsForm.addEventListener('submit', this.handleSaveCartonDetails.bind(this));
            this.elements.cancelCartonDetailsBtn.addEventListener('click', () => { this.hideModal(); this.showModal('product-form-modal'); });
            this.elements.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
            this.elements.cancelProfileBtn.addEventListener('click', () => this.hideModal());
            this.elements.profileAccountToggle.addEventListener('click', () => this._setAccountOpen(!this.elements.profileAccount.classList.contains('open')));
            this.elements.scanReward.addEventListener('click', () => this._nudgeTap());

            this.elements.cartonSubunitTypeInput.addEventListener('input', (e) => {
                const selectedUnit = e.target.value;
                if (selectedUnit) {
                    this.elements.cartonQuantityLabel.textContent = `How many ${selectedUnit} per carton?`;
                } else {
                    this.elements.cartonQuantityLabel.textContent = 'How many per carton?';
                }
            });

            this.elements.productFilterTabs.forEach(btn => btn.addEventListener('click', () => {
                this.elements.productFilterTabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.productFilter = btn.dataset.filter;
                this.renderProducts(this.elements.productSearchInput.value);
            }));

            this.elements.stockFilterTabs.forEach(btn => btn.addEventListener('click', () => {
                this.elements.stockFilterTabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.state.stockViewFilter = btn.dataset.filter;
                this.renderRetailerStocks();
            }));

            const fieldsToFormat = [
                this.elements.productPriceInput,
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
            [this.elements.productStockInput, this.elements.saleQuantityInput].forEach(input => {
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

        // --- PINs ---
        // A PIN is never stored or sent as the number itself: a random salt is added and the result is scrambled many times.
        _toB64(bytes) { let s = ''; bytes.forEach(b => { s += String.fromCharCode(b); }); return btoa(s); },
        _fromB64(text) { const s = atob(text); const out = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i); return out; },

        async _derivePin(pin, salt, iterations) {
            const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(String(pin)), 'PBKDF2', false, ['deriveBits']);
            const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: this._fromB64(salt), iterations }, key, 256);
            return this._toB64(new Uint8Array(bits));
        },

        // What is saved instead of the PIN
        async _makePinRecord(pin) {
            const pinSalt = this._toB64(crypto.getRandomValues(new Uint8Array(16)));
            const pinIter = 150000;
            return { pinHash: await this._derivePin(pin, pinSalt, pinIter), pinSalt, pinIter };
        },

        // Does `pin` belong to this account record? (Older accounts still hold the plain PIN until their next login.)
        async _pinMatches(pin, record) {
            if (!record) return false;
            if (record.pinHash) {
                const hash = await this._derivePin(pin, record.pinSalt, Number(record.pinIter) || 150000);
                let diff = hash.length ^ String(record.pinHash).length; // same length, then every character, whatever the answer
                for (let i = 0; i < hash.length; i++) diff |= hash.charCodeAt(i) ^ String(record.pinHash).charCodeAt(i);
                return diff === 0;
            }
            return record.pin !== undefined && record.pin !== null && String(record.pin) !== '' && String(record.pin) === String(pin);
        },

        // Too many wrong PINs in a row: a short wait that grows
        _pinLock() {
            try {
                const t = JSON.parse(localStorage.getItem('pika_pin_tries')) || {};
                return t.until && t.until > Date.now() ? Math.ceil((t.until - Date.now()) / 1000) : 0;
            } catch (e) { return 0; }
        },
        _pinFailed() {
            try {
                const t = JSON.parse(localStorage.getItem('pika_pin_tries')) || { n: 0 };
                t.n = (t.n || 0) + 1;
                if (t.n % 5 === 0) t.until = Date.now() + Math.min(30 * 60000, 60000 * Math.pow(2, (t.n / 5) - 1));
                localStorage.setItem('pika_pin_tries', JSON.stringify(t));
            } catch (e) { /* the wait is a bonus */ }
        },
        _pinOk() { try { localStorage.removeItem('pika_pin_tries'); } catch (e) { /* fine */ } },
        async _pinWait() {
            const seconds = this._pinLock();
            if (!seconds) return false;
            await say(`Too many wrong PINs. Try again in ${seconds > 90 ? Math.ceil(seconds / 60) + ' minutes' : seconds + ' seconds'}.`, 'Please wait');
            return true;
        },

        // An account that still holds the plain PIN gets the scrambled version (and loses the plain one) at its next login
        async _upgradePin(pin) {
            const user = this.state.user;
            if (!user || user.pinHash || !user.pin) return;
            try {
                const record = await this._makePinRecord(pin);
                await window.fb.updateDoc(window.fb.doc(window.fb.db, 'users', user.phone), { ...record, pin: window.fb.deleteField() });
                Object.assign(user, record);
                delete user.pin;
            } catch (error) {
                console.error('Could not upgrade the PIN storage:', error); // the plain PIN keeps working; this runs again next login
            }
        },

        // An id for a new product or sale: the time plus a random part, so two phones never make the same one
        _newId() { return Date.now() * 1000 + Math.floor(Math.random() * 1000); },

        // Runs `job` one at a time under `name`: while it is still going, another call (a second tap) does nothing.
        // The button, if given, is switched off meanwhile so the person can see it is working.
        async _once(name, job, button) {
            this._busy = this._busy || {};
            if (this._busy[name]) return undefined;
            this._busy[name] = true;
            if (button) button.disabled = true;
            try { return await job(); }
            finally { this._busy[name] = false; if (button) button.disabled = false; }
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

        // Runs `action` once on press, then keeps running it 7 times a second while the button stays held down.
        _bindHoldRepeat(btn, action) {
            if (!btn) return;
            const REPEAT_MS = Math.round(1000 / 7);
            let timer = null;
            const stop = () => { clearInterval(timer); timer = null; };
            btn.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                stop();
                action();
                timer = setInterval(() => {
                    if (!btn.offsetParent) { stop(); return; } // the modal went away while the button was held
                    action();
                }, REPEAT_MS);
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
                await this._needs(this.elements.checkPhoneInput, "Enter your 11-digit WhatsApp number, like 08012345678.", "Check your number");
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
        VERIFIED_TTL_MS: 60 * 60 * 1000, // after the dashboard confirms a number they have this long to finish; then they verify again

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
            const m = this._verifiedMem;
            if (m && m.phone === phone && Date.now() - m.at < this.VERIFIED_TTL_MS) return true;
            try {
                const v = JSON.parse(localStorage.getItem('pika_verified_phone'));
                return !!v && v.phone === phone && Date.now() - v.at < this.VERIFIED_TTL_MS;
            } catch (e) { return false; }
        },
        // Confirmed on the dashboard, and not too long ago
        _verifiedFresh(d) {
            if (!d || !d.verified) return false;
            return Date.now() - DB._normalizeTimestamp(d.verifiedAt).getTime() < this.VERIFIED_TTL_MS;
        },
        // They took more than an hour after being confirmed: tell them, and start a new check
        async _verificationExpired(phone, purpose) {
            this._verifiedMem = null;
            try { localStorage.removeItem('pika_verified_phone'); } catch (e) { /* fine */ }
            this._savePending(null);
            say('Your number check expired after 1 hour. Please verify again.', 'Verify again');
            this.showLoader();
            try { await this.startPhoneVerification(phone, purpose); }
            catch (error) { console.error('Could not start a new number check:', error); this.showView('onboarding-step-1'); }
            finally { this.hideLoader(); }
        },
        _verificationRef(phone) { return window.fb.doc(window.fb.db, 'signup_verifications', phone); },

        // purpose: 'signup' (new account) or 'reset' (Forgot PIN). The dashboard shows which one it is.
        async startPhoneVerification(phone, purpose = 'signup') {
            let pending = this._pendingVerification();
            if (!pending || pending.phone !== phone || (pending.purpose || 'signup') !== purpose || Date.now() - pending.createdAt > this.CODE_TTL_MS) pending = null;
            if (pending) {
                const snap = await window.fb.getDoc(this._verificationRef(phone));
                const d = snap.exists() ? snap.data() : null;
                if (d && d.verified && d.code === pending.code && this._verifiedFresh(d)) { this._pending = pending; return this._phoneVerified(phone); }
                if (!d || d.code !== pending.code || d.verified) pending = null; // replaced, or confirmed too long ago: start over
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
                if (d && d.verified && d.code === pending.code && this._verifiedFresh(d)) this._phoneVerified(pending.phone);
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
                : `Then come back here after verification. This screen continues by itself (${Math.ceil(left / 60000)} min left).`;
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
                this._verifiedMem = { phone, at: Date.now() };
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
            if (!/^\d{6}$/.test(pin)) { await this._needs(document.getElementById('new-pin'), 'Your PIN must be 6 numbers.', 'Check your PIN'); return; }
            if (!phone || !pending || pending.phone !== phone || pending.purpose !== 'reset') {
                say('Verify your number on WhatsApp first.', 'Verify first');
                this.showView('onboarding-step-1');
                return;
            }
            try {
                const check = await window.fb.getDoc(this._verificationRef(phone));
                const confirmed = check.exists() ? check.data() : null;
                if (!confirmed || confirmed.code !== pending.code || !this._verifiedFresh(confirmed)) { await this._verificationExpired(phone, 'reset'); return; }
            } catch (e) { /* offline: saving below says so */ }
            this.showLoader();
            try {
                const userRef = window.fb.doc(window.fb.db, 'users', phone);
                const snap = await window.fb.getDoc(userRef);
                if (!snap.exists()) throw new Error('Account not found');
                const pinChangedAt = Date.now(); // other phones compare this and log themselves out
                const pinRecord = await this._makePinRecord(pin);
                await window.fb.updateDoc(userRef, { ...pinRecord, pin: window.fb.deleteField(), pinChangedAt });
                await this._clearDevices(phone); // every other phone is logged out by the new PIN, so their places are free
                // Spend the WhatsApp confirmation so it cannot open this screen again
                await window.fb.setDoc(this._verificationRef(phone), { phone, code: 'used', purpose: 'reset', createdAt: window.fb.serverTimestamp(), verified: false });
                this._pending = null;
                this._savePending(null);
                document.getElementById('new-pin').value = '';

                this.state.user = { ...snap.data(), ...pinRecord, pinChangedAt };
                delete this.state.user.pin;
                DB.setIdentity(this.state.user);
                await this._claimDevice(phone);
                await DB.saveUser(this.state.user);
                if (this._isSalesperson()) await this._loadBusinessLink();
                const synced = this._isWaiting() ? true : await DB.syncDataFromCloud(phone);
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
            if (Date.now() - p.createdAt > this.CODE_TTL_MS + this.VERIFIED_TTL_MS) { this._savePending(null); return; } // too old to still be good, confirmed or not
            try {
                const snap = await window.fb.getDoc(this._verificationRef(p.phone));
                const d = snap.exists() ? snap.data() : null;
                if (d && d.verified && d.code === p.code) {
                    if (this._verifiedFresh(d)) { this._pending = p; this._phoneVerified(p.phone); return; }
                    this._savePending(null); // confirmed more than an hour ago: they start again
                    say('Your number check expired after 1 hour. Please verify again.', 'Verify again');
                    return;
                }
            } catch (e) { /* offline: show the code anyway */ }
            this._showVerification(p);
        },

        // Follows this person's account, so every phone shows the same: a PIN reset elsewhere logs this one out,
        // and the low stock level, the edits used this hour and today's scans are shared by all of them.
        _watchAccount() {
            if (this._pinWatch) { this._pinWatch(); this._pinWatch = null; }
            const user = this.state.user;
            if (!user || !user.phone || !this.state.firebaseReady) return;
            this._pinWatch = window.fb.onSnapshot(window.fb.doc(window.fb.db, 'users', user.phone), (snap) => {
                const me = this.state.user;
                if (!snap.exists() || !me || me.phone !== user.phone) return;
                const d = snap.data();
                if ((Number(d.pinChangedAt) || 0) > (Number(me.pinChangedAt) || 0)) {
                    this._doLogout().then(() => say('Your PIN was changed on another phone. Log in with your new PIN.', 'Log in again'));
                    return;
                }
                let changed = false;
                if (Number(d.lowStockLevel) >= 1 && d.lowStockLevel !== me.lowStockLevel) {
                    me.lowStockLevel = d.lowStockLevel;
                    changed = true;
                    this.renderProducts(this.elements.productSearchInput.value);
                }
                if (Array.isArray(d.recentEdits)) {
                    const merged = [...new Set([...this._recentEdits(), ...d.recentEdits.map(Number)])].filter(t => t > 0 && Date.now() - t < 3600000).sort((x, y) => x - y);
                    if (JSON.stringify(merged) !== JSON.stringify(this._recentEdits())) { me.recentEdits = merged; changed = true; }
                }
                if (d.scans && typeof d.scans === 'object') {
                    me.scans = d.scans;
                    const day = DB._today();
                    DB.raiseScanCount(day, (Number(d.scans[day]) || 0) + (this._pendingScans || 0)).then(() => this._refreshScanCount());
                }
                if (changed) DB.saveUser(me, false);
            }, (error) => console.error('Could not follow the account:', error));
        },

        // Today's scans, added up across all the phones, shown in the profile
        async _refreshScanCount() {
            if (!this.state.user) return;
            const count = await DB.getScanCountForToday();
            this.updateScanTracker();
        },

        // Scans are counted on the phone at once and sent to the account in small batches
        async _flushScans() {
            clearTimeout(this._scanTimer);
            const count = this._pendingScans || 0;
            const user = this.state.user;
            if (!count || !user || !user.phone || !this.state.firebaseReady) return;
            this._pendingScans = 0;
            const update = { [`scans.${DB._today()}`]: window.fb.increment(count) };
            const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
            Object.keys(user.scans || {}).filter(day => day < cutoff).forEach(day => { update[`scans.${day}`] = window.fb.deleteField(); });
            try {
                await window.fb.updateDoc(window.fb.doc(window.fb.db, 'users', user.phone), update);
            } catch (error) {
                this._pendingScans += count; // try again with the next batch
                console.error('Could not send the scan count:', error);
            }
        },

        // --- Devices: an account can be logged in on up to four phones at once ---
        // Each phone holds one of four numbered places. A phone that has not been used for 30 days gives its place up.
        _deviceId() {
            try {
                let id = localStorage.getItem('pika_device_id');
                if (!id) {
                    id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
                    localStorage.setItem('pika_device_id', id);
                }
                return id;
            } catch (e) {
                return this._memDeviceId || (this._memDeviceId = `${Date.now()}-${Math.random().toString(36).slice(2)}`);
            }
        },

        _deviceLabel() {
            const ua = navigator.userAgent || '';
            const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iPhone' : /Windows/i.test(ua) ? 'Windows' : /Mac/i.test(ua) ? 'Mac' : 'Phone';
            const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
            return `${os} ${browser}`;
        },

        _deviceRef(phone, place) { return window.fb.doc(window.fb.db, `users/${phone}/devices`, String(place)); },

        // Takes (or refreshes) this phone's place. Answers 'ok', 'full' (all four places are in use) or 'error' (no connection).
        async _claimDevice(phone) {
            if (!window.fb || !phone) return 'error';
            const id = this._deviceId();
            let snaps;
            try { snaps = await window.fb.getDocs(window.fb.collection(window.fb.db, `users/${phone}/devices`)); } catch (e) { return 'error'; }
            const places = {};
            snaps.forEach(d => { places[d.id] = d.data(); });
            const stamp = { deviceId: id, label: this._deviceLabel(), lastSeen: window.fb.serverTimestamp() };
            const ok = (place) => { this._devicePlace = String(place); this._deviceCheckedAt = Date.now(); this._checkClock(this._deviceRef(phone, place)); return 'ok'; };

            const mine = Object.keys(places).find(k => places[k].deviceId === id);
            if (mine) {
                try { await window.fb.updateDoc(this._deviceRef(phone, mine), { lastSeen: window.fb.serverTimestamp() }); } catch (e) { return 'error'; }
                return ok(mine);
            }
            for (let n = 1; n <= LIMITS.maxDevices; n++) {
                if (places[String(n)]) continue;
                try { await window.fb.setDoc(this._deviceRef(phone, n), stamp); return ok(n); } catch (e) { /* taken a moment ago: try the next place */ }
            }
            const unused = Object.keys(places).find(k => { const t = DB._stampMs(places[k].lastSeen); return t && Date.now() - t > 30 * 86400000; });
            if (unused) {
                try { await window.fb.setDoc(this._deviceRef(phone, unused), stamp); return ok(unused); } catch (e) { /* not allowed after all */ }
            }
            return 'full';
        },

        _tooManyDevices() {
            say(`This account is already logged in on ${LIMITS.maxDevices} phones. Log out on one of them, or tap "Forgot PIN?" to reset your PIN and start fresh.`, 'Too many phones');
        },

        // Gives this phone's place back (logging out)
        async _releaseDevice() {
            const user = this.state.user;
            if (!user || !user.phone || !this._devicePlace || !window.fb) return;
            const place = this._devicePlace;
            this._devicePlace = null;
            await window.fb.deleteDoc(this._deviceRef(user.phone, place));
        },

        // A PIN reset logs every phone out: all the places are freed
        async _clearDevices(phone) {
            try {
                const snaps = await window.fb.getDocs(window.fb.collection(window.fb.db, `users/${phone}/devices`));
                const removals = [];
                snaps.forEach(d => removals.push(window.fb.deleteDoc(this._deviceRef(phone, d.id))));
                await Promise.all(removals);
            } catch (error) { console.error('Could not free the places:', error); }
            this._devicePlace = null;
        },

        // When the app opens or comes back: this phone still has its place (at most twice a day)
        async _ensureDevice() {
            const user = this.state.user;
            if (!user || !user.phone || !this.state.firebaseReady || this._isWaiting()) return;
            if (this._devicePlace && Date.now() - (this._deviceCheckedAt || 0) < 12 * 3600000) return;
            const result = await this._claimDevice(user.phone);
            if (result === 'full' && this.state.user && this.state.user.phone === user.phone) {
                this._doLogout().then(() => say(`Your account was opened on ${LIMITS.maxDevices} other phones while this one was away. Log in again, or reset your PIN.`, 'Logged out'));
            }
        },

        // How far this phone's clock is ahead of the online clock (behind is negative), as last measured. Times that every phone
        // must agree on, like the "recently edited" line, use the online clock, so they match even when a phone's own clock is off.
        _clockOffsetMs() {
            if (typeof this._clockOffset !== 'number') {
                let saved = 0;
                try { saved = Number(localStorage.getItem('pika_clock_offset')) || 0; } catch (e) { /* nothing saved */ }
                this._clockOffset = Math.abs(saved) < 86400000 ? saved : 0;
            }
            return this._clockOffset;
        },
        _serverNow() { return Date.now() - this._clockOffsetMs(); },
        _setClockOffset(off) {
            if (!Number.isFinite(off) || Math.abs(off) >= 86400000) return;
            const before = this._clockOffsetMs();
            this._clockOffset = off;
            try { localStorage.setItem('pika_clock_offset', String(Math.round(off))); } catch (e) { /* the next open measures it again */ }
            // lines drawn with the older figure are drawn again
            if (Math.abs(off - before) > 2000 && this.state.user && this.elements.productSearchInput) this.renderProducts(this.elements.productSearchInput.value);
        },

        // Sales are stamped with the phone's clock, so a wrong clock would put them on the wrong day on every phone
        async _checkClock(ref) {
            try {
                const snap = await window.fb.getDocFromServer(ref);
                const server = DB._stampMs(snap.exists() ? snap.data().lastSeen : null);
                const off = Date.now() - server;
                if (!server) return;
                this._setClockOffset(off);
                if (Math.abs(off) < 5 * 60000) return;
                if (Date.now() - (Number(localStorage.getItem('pika_clock_warned')) || 0) < 24 * 3600000) return;
                localStorage.setItem('pika_clock_warned', String(Date.now()));
                const minutes = Math.round(Math.abs(off) / 60000);
                const size = minutes >= 120 ? `${Math.round(minutes / 60)} hours` : `${minutes} minutes`;
                say(`Your phone's clock is about ${size} ${off > 0 ? 'ahead' : 'behind'}. Turn on automatic date and time, so your sales show the right time on every phone.`, 'Check your clock');
            } catch (e) { /* the clock check is a bonus */ }
        },

        // --- Salespeople -------------------------------------------------------------------------------
        // A salesperson sells from an admin's products and only ever sees what they recorded themselves.
        // The admin adds them with a 4-digit code (salesperson_invites). Entering it creates the link
        // (salesperson_links) that says which business they work for; deleting the link removes them.
        SALESPERSON_CODE_TTL_MS: 20 * 60 * 1000,
        MAX_SALESPEOPLE: 5,

        _isSalesperson() { const u = this.state.user; return !!u && u.type === 'Salesperson'; },
        // A salesperson who no business has confirmed yet
        _isWaiting() { const u = this.state.user; return !!u && u.type === 'Salesperson' && !u.businessPhone; },
        // The phone the products, sales and credit belong to: a salesperson's admin, otherwise the user themselves
        _businessPhone() {
            const u = this.state.user;
            if (!u) return null;
            return u.type === 'Salesperson' ? (u.businessPhone || null) : u.phone;
        },
        // Who a transfer comes "from": the business, whoever in it recorded the sale
        _sender() {
            const u = this.state.user;
            if (u.type === 'Salesperson') return { store: u.businessName || '', id: u.businessPhone, role: u.businessType || 'Wholesaler' };
            return { store: u.business, id: u.phone, role: u.type };
        },

        _linkRef(phone) { return window.fb.doc(window.fb.db, 'salesperson_links', phone); },
        _inviteRef(phone) { return window.fb.doc(window.fb.db, 'salesperson_invites', phone); },

        _applyLink(link) {
            const user = this.state.user;
            ['businessPhone', 'businessName', 'businessType', 'businessLowStock', 'businessAdminName'].forEach(k => { delete user[k]; });
            if (link && link.businessPhone) {
                user.businessPhone = link.businessPhone;
                user.businessName = link.businessName || '';
                user.businessType = link.businessType || '';
            }
            DB.setIdentity(user);
        },

        // Which business (if any) has confirmed this salesperson. Answers 'linked', 'waiting', 'removed' (confirmed on this phone
        // before, but their admin has since removed them) or 'unknown' (the server could not be reached: keep what this phone knows).
        async _loadBusinessLink() {
            const user = this.state.user;
            if (!user || user.type !== 'Salesperson' || !window.fb) return 'unknown';
            try {
                const snap = await window.fb.getDoc(this._linkRef(user.phone));
                const hadBusiness = !!user.businessPhone;
                const link = snap.exists() ? snap.data() : null;
                this._applyLink(link);
                if (link && link.businessPhone) {
                    try { // the admin's own low stock level, for the labels on the products they see
                        const business = await window.fb.getDoc(window.fb.doc(window.fb.db, 'users', link.businessPhone));
                        const level = business.exists() ? Number(business.data().lowStockLevel) : 0;
                        if (level >= 1) user.businessLowStock = level;
                        const adminName = business.exists() ? String(business.data().name || '').trim() : '';
                        if (adminName) user.businessAdminName = adminName; // who the salesperson answers to, for notices
                    } catch (e) { /* the usual level of 7 applies */ }
                }
                await DB.saveUser(user, false);
                if (link && link.businessPhone) return 'linked';
                return hadBusiness ? 'removed' : 'waiting';
            } catch (error) {
                console.error('Could not check which business this salesperson works for:', error);
                return 'unknown';
            }
        },

        // A salesperson is logged out the moment their admin removes them
        _watchLink() {
            if (this._linkWatch) { this._linkWatch(); this._linkWatch = null; }
            const user = this.state.user;
            if (!user || user.type !== 'Salesperson' || !user.businessPhone || !this.state.firebaseReady) return;
            const business = user.businessPhone;
            this._linkWatch = window.fb.onSnapshot(this._linkRef(user.phone), (snap) => {
                const me = this.state.user;
                if (!me || me.type !== 'Salesperson' || me.businessPhone !== business) return;
                if (!snap.exists() && snap.metadata && snap.metadata.fromCache) return; // the server has not answered yet
                const link = snap.exists() ? snap.data() : null;
                if (!link || link.businessPhone !== business) this._removedFromBusiness(me.businessName);
            }, (error) => console.error('Could not watch the salesperson link:', error));
        },

        // Logs them out at once; the message waits for a tap, so nothing waits on it
        _removedFromBusiness(businessName) {
            const loggedOut = this._doLogout();
            loggedOut.then(() => say(`${businessName || 'Your admin'} removed you as a salesperson. You can log in again and join another business.`, 'Removed'));
            return loggedOut;
        },

        // The only thing a salesperson sees until a business confirms them
        _showWaiting() {
            this.elements.appHeader.style.display = 'none';
            this.elements.mainContent.style.display = 'none';
            this.elements.bottomNav.style.display = 'none';
            this.elements.views.forEach(view => view.classList.remove('active'));
            this.state.currentView = null;
            const input = document.getElementById('sp-code-input');
            input.value = '';
            document.getElementById('sp-code-error').textContent = '';
            document.getElementById('sp-code-btn').disabled = true;
            this.showModal('sp-waiting-modal');
            setTimeout(() => input.focus(), 150);
        },

        async handleSalespersonCode() {
            const input = document.getElementById('sp-code-input');
            const btn = document.getElementById('sp-code-btn');
            const error = document.getElementById('sp-code-error');
            const code = input.value.trim();
            if (!/^\d{4}$/.test(code) || btn.disabled) return;
            const user = this.state.user;
            btn.disabled = true;
            error.textContent = '';
            try {
                const snap = await window.fb.getDoc(this._inviteRef(user.phone));
                const invite = snap.exists() ? snap.data() : null;
                if (!invite || String(invite.code) !== code) {
                    error.textContent = 'That code is not right. Check it with your admin.';
                    return;
                }
                if (Date.now() - DB._normalizeTimestamp(invite.createdAt).getTime() > this.SALESPERSON_CODE_TTL_MS) {
                    error.textContent = 'This code has expired. Ask your admin for a new one and use it within 20 minutes of it being generated.';
                    return;
                }
                await window.fb.setDoc(this._linkRef(user.phone), {
                    phone: user.phone,
                    name: user.name,
                    businessPhone: invite.businessPhone,
                    businessName: invite.businessName || '',
                    businessType: invite.businessType || '',
                    confirmedAt: Date.now()
                });
                window.fb.deleteDoc(this._inviteRef(user.phone)).catch(() => { /* the code is spent either way: the link now exists */ });
                await this._enterBusiness();
            } catch (e) {
                console.error('Could not check the code:', e);
                error.textContent = 'Could not check the code. Check your internet and try again.';
            } finally {
                btn.disabled = !/^\d{4}$/.test(input.value.trim());
            }
        },

        // A confirmed salesperson opens their admin's products and starts following their own sales
        async _enterBusiness() {
            this.showLoader();
            try {
                const status = await this._loadBusinessLink();
                if (status !== 'linked') throw new Error('The link was not saved');
                const synced = await DB.syncDataFromCloud(this.state.user.phone);
                this.hideModal();
                await this.loadMainApp();
                this.startRealtimeSync();
                if (!synced) say('You are in. Some data will finish syncing soon.', 'Logged in');
            } finally {
                this.hideLoader();
            }
        },

        // --- Admin side: add, summarise, confirm money, remove ---
        openAddSalesperson() {
            document.getElementById('sp-add-form').hidden = false;
            document.getElementById('sp-add-done').hidden = true;
            const phone = document.getElementById('sp-add-phone');
            phone.value = '';
            document.getElementById('sp-add-error').textContent = '';
            this.showModal('add-salesperson-modal');
            setTimeout(() => phone.focus(), 150);
        },

        closeAddSalesperson() {
            clearInterval(this._spTimer);
            this._spCode = null;
            this.hideModal();
        },

        // Makes a fresh 4-digit code for a number that signed up as a salesperson. Answers { error } or { phone, name, code, createdAt }.
        async _createSalespersonCode(phone) {
            if (!navigator.onLine || !this.state.firebaseReady) return { error: 'You need internet to add a salesperson.' };
            const me = this.state.user;
            const userSnap = await window.fb.getDoc(window.fb.doc(window.fb.db, 'users', phone));
            const found = userSnap.exists() ? userSnap.data() : null;
            if (!found || found.type !== 'Salesperson' || !(found.pin || found.pinHash)) return { error: "This number hasn't signed up as a salesperson before." };
            const first = String(found.name || '').split(' ')[0] || phone;

            const linkSnap = await window.fb.getDoc(this._linkRef(phone));
            if (linkSnap.exists()) {
                return { error: linkSnap.data().businessPhone === me.phone ? `${first} is already your salesperson.` : `${first} already works for another business.` };
            }
            const mine = await window.fb.getDocs(window.fb.query(window.fb.collection(window.fb.db, 'salesperson_links'), window.fb.where('businessPhone', '==', me.phone)));
            if (mine.size >= this.MAX_SALESPEOPLE) return { error: `You can add up to ${this.MAX_SALESPEOPLE} salespeople.` };

            const code = String(1000 + Math.floor(Math.random() * 9000));
            const createdAt = Date.now(); // for this screen's countdown; the code itself is stamped by the server
            await window.fb.setDoc(this._inviteRef(phone), { phone, code, businessPhone: me.phone, businessName: me.business || '', businessType: me.type, createdAt: window.fb.serverTimestamp() });
            this._shareProductPictures(); // so the salesperson sees the pictures too
            return { phone, name: found.name || phone, code, createdAt };
        },

        async handleGetSalespersonCode() {
            const input = document.getElementById('sp-add-phone');
            const error = document.getElementById('sp-add-error');
            const btn = document.getElementById('sp-add-go');
            const phone = this._localPhone(input.value);
            error.textContent = '';
            if (!/^0\d{10}$/.test(phone)) { error.textContent = 'Enter their 11-digit phone number.'; return; }
            btn.disabled = true;
            try {
                const result = await this._createSalespersonCode(phone);
                if (result.error) error.textContent = result.error;
                else this._showSalespersonCode(result);
            } catch (e) {
                console.error('Could not make a salesperson code:', e);
                error.textContent = 'Could not get a code. Check your internet and try again.';
            } finally {
                btn.disabled = false;
            }
        },

        _showSalespersonCode(result) {
            this._spCode = result;
            const first = String(result.name).split(' ')[0];
            document.getElementById('sp-add-form').hidden = true;
            document.getElementById('sp-add-done').hidden = false;
            document.getElementById('sp-done-title').textContent = `Code for ${first}`;
            document.getElementById('sp-done-sub').textContent = `Ask ${first} to enter this code in PikaShot.`;
            const box = document.querySelector('#sp-add-done .sp-code-box');
            const timer = document.getElementById('sp-timer');
            const copyBtn = document.getElementById('sp-copy');
            document.getElementById('sp-code-value').textContent = result.code;
            clearInterval(this._spTimer);
            const tick = () => {
                const left = result.createdAt + this.SALESPERSON_CODE_TTL_MS - Date.now();
                const expired = left <= 0;
                box.classList.toggle('expired', expired);
                copyBtn.disabled = expired;
                if (expired) {
                    timer.textContent = 'This code has expired. Tap New code.';
                    clearInterval(this._spTimer);
                    return;
                }
                const secs = Math.ceil(left / 1000);
                timer.textContent = `Expires in ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;
            };
            tick();
            this._spTimer = setInterval(tick, 1000);
        },

        async handleNewSalespersonCode() {
            if (!this._spCode) return;
            const btn = document.getElementById('sp-new');
            btn.disabled = true;
            try {
                const result = await this._createSalespersonCode(this._spCode.phone);
                if (result.error) say(result.error, 'Cannot make a code');
                else this._showSalespersonCode(result);
            } catch (e) {
                console.error('Could not make a new salesperson code:', e);
                say('Check your internet and try again.', 'No internet');
            } finally {
                btn.disabled = false;
            }
        },

        copySalespersonCode() {
            if (!this._spCode) return;
            const done = () => this.showToast('Code copied.');
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(this._spCode.code).then(done, () => {});
            else done();
        },

        // Products that have a picture on this phone but no small copy online get one (a few at a time, so it costs almost nothing)
        async _backfillThumbs(limit = 12) {
            if (this._isSalesperson()) return;
            try {
                const all = await DB.getAllProducts();
                let done = 0;
                for (const product of all) {
                    if (done >= limit) break;
                    if (!(product.image instanceof Blob) || product.thumb) continue;
                    const thumb = await this._productThumb(product.image);
                    if (!thumb) continue;
                    product.thumb = thumb;
                    await DB.saveProduct(product, { only: ['thumb'], thumb: true });
                    done++;
                }
            } catch (e) { console.error('Could not prepare product pictures:', e); }
        },
        _shareProductPictures() { return this._backfillThumbs(40); },

        // The Salespeople tab: one card per salesperson, with a summary for every day whose money is not confirmed yet
        _renderSalespeople() {
            const view = this.elements.salespeopleView;
            if (this.state.retailerListener) { this.state.retailerListener(); this.state.retailerListener = null; }
            if (this.state.linksListener) { this.state.linksListener(); this.state.linksListener = null; }
            view.innerHTML = '<div class="spinner"></div>';
            let first = true;
            const links = window.fb.query(window.fb.collection(window.fb.db, 'salesperson_links'), window.fb.where('businessPhone', '==', this.state.user.phone));
            this.state.linksListener = window.fb.onSnapshot(links, (snap) => {
                const people = [];
                snap.forEach(d => people.push(d.data()));
                this.state.salespeople = people.sort((a, b) => (Number(a.confirmedAt) || 0) - (Number(b.confirmedAt) || 0));
                if (!first) snap.docChanges().forEach(change => { if (change.type === 'added') this._salespersonJoined(change.doc.data()); });
                first = false;
                this._drawSalespeople();
            }, (error) => {
                console.error('Could not load salespeople:', error);
                view.innerHTML = '<p class="empty-state">Error loading data.</p>';
            });
        },

        _salespersonJoined(link) {
            const first = String(link.name || link.phone).split(' ')[0];
            if (this._spCode && this._spCode.phone === link.phone) this.closeAddSalesperson();
            this.showToast(`${first} joined as your salesperson.`);
        },

        async _drawSalespeople() {
            const view = this.elements.salespeopleView;
            const people = this.state.salespeople || [];
            if (!people.length) {
                view.innerHTML = '<p class="empty-state">No salespeople yet. Tap the + button to add one.</p>';
                return;
            }
            const sales = await DB.getAllSales();
            if (!this.state.user) return; // logged out while this was loading
            view.innerHTML = people.map(person => this._salespersonCard(person, sales.filter(s => s.recordedBy === person.phone && !s.moneyConfirmed))).join('');
        },

        _dayKey(value) {
            const d = DB._normalizeTimestamp(value);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        },

        _dayLabel(key) {
            const [y, m, d] = key.split('-').map(Number);
            const date = new Date(y, m - 1, d);
            const today = this._dayKey(new Date());
            const yesterday = this._dayKey(new Date(Date.now() - 86400000));
            const short = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            if (key === today) return `Today · ${short}`;
            if (key === yesterday) return `Yesterday · ${short}`;
            return `${date.toLocaleDateString('en-GB', { weekday: 'short' })} · ${short}`;
        },

        // What one day of one salesperson's sales adds up to
        _summariseSales(sales) {
            const sum = { count: sales.length, total: 0, items: 0, discount: 0, discountedItems: 0, credit: 0, transfers: 0, edits: 0 };
            sales.forEach(sale => {
                const qty = Number(sale.quantity) || 0;
                const paid = Number(sale.total) || 0;
                const gross = qty * (Number(sale.price) || 0);
                sum.total += paid;
                sum.items += qty;
                if (sale.saleType === 'credit') {
                    if (!sale.creditSettled) sum.credit += Math.max(0, gross - paid);
                } else if (Number(sale.discount) > 0) {
                    sum.discount += Number(sale.discount);
                    sum.discountedItems += qty;
                }
                if (sale.sharedAsLog || this._pendingLogIds(sale).length) sum.transfers++;
                if (sale.edited) sum.edits++;
            });
            return sum;
        },

        _salespersonCard(person, pending) {
            const e = (v) => this._esc(v);
            const money = (n) => `₦${this.formatNumber(n)}`;
            const trash = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
            const days = {};
            pending.forEach(sale => { (days[this._dayKey(sale.timestamp)] = days[this._dayKey(sale.timestamp)] || []).push(sale); });
            const cards = Object.keys(days).sort().reverse().map(key => {
                const s = this._summariseSales(days[key]);
                const none = '<strong class="sp-none">–</strong>';
                return `
                    <div class="sp-day" data-day="${key}">
                        <div class="sp-day-top"><span>${e(this._dayLabel(key))}</span><span>${s.count} ${s.count === 1 ? 'sale' : 'sales'}</span></div>
                        <div class="sp-day-total"><span>Total sales</span><strong>${money(s.total)}</strong></div>
                        <div class="sp-rows">
                            <div class="sp-row"><span>Items sold</span><strong>${this.formatNumber(s.items)}</strong></div>
                            <div class="sp-row"><span>Discounts</span>${s.discount ? `<strong>${money(s.discount)} · ${this.formatNumber(s.discountedItems)} ${s.discountedItems === 1 ? 'item' : 'items'}</strong>` : none}</div>
                            ${s.credit
                                ? `<button type="button" class="sp-row sp-row-link" data-act="credit"><span>Credit</span><strong>${money(s.credit)} <i aria-hidden="true">›</i></strong></button>`
                                : `<div class="sp-row"><span>Credit</span>${none}</div>`}
                            <div class="sp-row"><span>Transfers</span>${s.transfers ? `<strong>${s.transfers}</strong>` : none}</div>
                            <div class="sp-row"><span>Sale edits</span>${s.edits ? `<strong>${s.edits}</strong>` : none}</div>
                        </div>
                        <button type="button" class="btn btn-primary sp-received" data-act="received">I received the money</button>
                    </div>`;
            }).join('');
            const initial = (String(person.name || '?').trim().charAt(0) || '?').toUpperCase();
            return `
                <div class="card sp-card" data-phone="${e(person.phone)}" data-name="${e(person.name || person.phone)}">
                    <div class="sp-head">
                        <div class="sp-avatar">${e(initial)}</div>
                        <div class="sp-id"><h4>${e(person.name || person.phone)}</h4><p>${e(person.phone)}</p></div>
                        <button type="button" class="sp-remove" data-act="remove" aria-label="Remove ${e(person.name || person.phone)}">${trash}</button>
                    </div>
                    ${cards || '<p class="sp-empty">Nothing waiting. All money is confirmed.</p>'}
                </div>`;
        },

        async confirmSalespersonMoney(phone, name, dayKey) {
            const sales = (await DB.getAllSales()).filter(s => s.recordedBy === phone && !s.moneyConfirmed && this._dayKey(s.timestamp) === dayKey);
            if (!sales.length) { this._drawSalespeople(); return; }
            const total = sales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
            const first = String(name).split(' ')[0];
            const confirmed = await this.requestPin(`Confirm you received ₦${this.formatNumber(total)} from ${first} for ${this._dayLabel(dayKey)}.`);
            if (!confirmed) return;
            const at = Date.now();
            try {
                // Only the sales that were on the card: anything recorded since gets its own card
                await Promise.all(sales.map(s => DB.patchSale(s.id, { moneyConfirmed: true, moneyConfirmedAt: at })));
                this.showToast(`Confirmed ₦${this.formatNumber(total)} from ${first}.`);
            } catch (error) {
                console.error('Could not confirm the money:', error);
                say('That was not saved. Check your internet and try again.', 'Not saved');
            }
            this._drawSalespeople();
        },

        async removeSalesperson(phone, name) {
            const first = String(name).split(' ')[0];
            const confirmed = await this.requestPin(`Remove ${first}? They are logged out right away, and their unconfirmed sales summaries are lost. Confirm any money you received first.`);
            if (!confirmed) return;
            try {
                await window.fb.deleteDoc(this._linkRef(phone));
                window.fb.deleteDoc(this._inviteRef(phone)).catch(() => { /* there may be no code to remove */ });
                this.showToast(`${first} was removed.`);
            } catch (error) {
                console.error('Could not remove the salesperson:', error);
                say('Check your internet and try again.', 'Not removed');
            }
        },

        showCustomersTab() {
            this.state.stockViewFilter = 'customers';
            this.renderRetailerStocks();
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
                await this._needs(this.elements.loginPinInput, "Enter your 6-digit PIN.", "Check your PIN");
                return;
            }

            // Verify PIN against cloud data
            if (await this._pinWait()) { this.elements.loginPinInput.value = ''; return; }
            this.showLoader();
            const pinOk = await this._pinMatches(pin, this.state.tempUserCloudData);
            if (pinOk) {
                this._pinOk();
                // A phone needs a free place: an account can be on four at once
                if (await this._claimDevice(this.state.tempPhone) === 'full') {
                    this.hideLoader();
                    this.elements.loginPinInput.value = '';
                    this._tooManyDevices();
                    return;
                }
                // Login successful
                this.state.user = this.state.tempUserCloudData;
                DB.setIdentity(this.state.user);
                await this._upgradePin(pin); // an older account swaps its plain PIN for the scrambled one
                await DB.saveUser(this.state.user); // Save locally
                if (this._isSalesperson()) await this._loadBusinessLink(); // which business (if any) has confirmed them

                // Sync data (a salesperson who is still waiting has none yet)
                const success = this._isWaiting() ? true : await DB.syncDataFromCloud(this.state.tempPhone);
                if (!success) {
                    say("You are in. Some data will finish syncing soon.", "Logged in");
                }

                this.elements.loginPinInput.value = '';
                await this.loadMainApp();
                this.startRealtimeSync(); // Start listeners
                this.hideLoader();
            } else {
                this.hideLoader();
                this._pinFailed();
                this.elements.loginPinInput.value = '';
                await this._needs(this.elements.loginPinInput, "That PIN is wrong. Try again.", "Wrong PIN");
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

            if (!firstName || !lastName || !gender || (!business && type !== 'Salesperson') || !type || !location || pin.length !== 6) {
                const e = this.elements;
                const missing = !firstName ? e.firstNameInput : !lastName ? e.lastNameInput : !gender ? e.genderInput : !location ? e.businessLocationInput
                    : (!business && type !== 'Salesperson') ? e.businessNameInput : !type ? document.getElementById('business-type-options') : e.createPinInput;
                await this._needs(missing, missing === e.createPinInput ? 'Your PIN must be 6 numbers.' : 'Fill in every box.', 'Check your details'); return;
            }
            if (!this._verifiedOnThisPhone(this.state.tempPhone)) { await this._verificationExpired(this.state.tempPhone, 'signup'); return; }

            this.showLoader();
            const uid = window.fb.auth.currentUser ? window.fb.auth.currentUser.uid : null;

            const newUser = {
                id: 1, // Local ID
                phone: this.state.tempPhone,
                ...(await this._makePinRecord(pin)),
                name, gender, business, type, location, uid,
                createdAt: window.fb.serverTimestamp()
            };

            try {
                // Save to IndexedDB and Sync to Cloud (handled by db.js)
                DB.setIdentity(newUser);
                await DB.saveUser(newUser);
                this.state.user = newUser;
                this._claimDevice(newUser.phone);
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
            if (this._isWaiting()) { this._showWaiting(); return; } // nothing to show until a business confirms them
            this.elements.appHeader.style.display = 'flex';
            this.elements.mainContent.style.display = 'block';
            this.elements.bottomNav.style.display = 'flex';

            const initialView = window.location.hash.substring(1) || 'home-view';
            this._modalStale = false;
            history.replaceState({ view: initialView }, '', `#${initialView}`);
            this.navigateTo(initialView, true);

            await this.updateDashboard();
            await this.renderProducts();
            this._backfillGeo();
            this._refreshCustomerStock();
            this._nudgeOnOpen();
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
            if (!this.state.firebaseReady || !this.state.user || !this.state.user.phone || this._isSalesperson()) return;
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
            if (!this.state.firebaseReady || !this.state.user || !this.state.user.phone || this._isSalesperson()) return;
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
            if (this.state.user && this.state.user.phone && !this._isWaiting()) {
                DB.setIdentity(this.state.user);
                DB.setupRealtimeListeners(
                    this._businessPhone(),
                    () => { // On Products Change
                        this.renderProducts(this.elements.productSearchInput.value);
                    },
                    () => { // On Sales Change
                        this.updateDashboard();
                        this.watchPendingTransfers();
                        if (this.state.currentView === 'all-sales-view') {
                            this.renderAllSales();
                        }
                        if (this.state.currentView === 'stock-levels-view') {
                            if (this._isSalesperson()) this._renderSalespersonCustomers();
                            else if (this.state.stockViewFilter === 'salespeople') this._drawSalespeople();
                            else this._drawCustomers();
                        }
                    }
                );

                if (!this._isSalesperson()) this._listenForIncomingTransfers(); // a salesperson has no stock of their own to receive
                this._watchAccount();
                this._watchLink();
                this._ensureDevice();
                setTimeout(() => this._backfillThumbs(), 6000);

                this.watchPendingTransfers();

                // Re-fetch sales when user returns to the app tab
                // This catches any sales missed while the listener was disconnected
                if (this._visibilityHandler) {
                    document.removeEventListener('visibilitychange', this._visibilityHandler);
                }
                this._visibilityHandler = async () => {
                    if (document.visibilityState === 'hidden') { this._flushScans(); return; } // the other phones should see them now
                    if (document.visibilityState === 'visible' && this.state.user) {
                        this.ensureFirebase().then(() => this.checkIncomingTransfers());
                        await DB.catchUp(); // only what changed while away
                        this._refreshCustomerStock();
                        this._nudgeOnOpen();
                        this.updateDashboard();
                        this.renderProducts(this.elements.productSearchInput.value);
                        if (this.state.currentView === 'all-sales-view') {
                            this.renderAllSales();
                        }
                        this._ensureDevice();
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
                try { await Promise.race([this._flushScans(), new Promise(r => setTimeout(r, 1500))]); } catch (e) { /* the scans were only counts */ }
                try { await Promise.race([this._releaseDevice(), new Promise(r => setTimeout(r, 2500))]); } catch (e) { /* offline: the place frees up by itself */ }
                if (this._pinWatch) { this._pinWatch(); this._pinWatch = null; }
                if (this._linkWatch) { this._linkWatch(); this._linkWatch = null; }
                if (this.state.linksListener) { this.state.linksListener(); this.state.linksListener = null; }
                clearInterval(this._spTimer);
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
                this._nudgeShake(); // (takes the dot off the menu button)
                this.state.tempPhone = null;
                this.state.tempUserCloudData = null;
                this.state.stockViewFilter = 'customers';
                this.state.retailersData = null;
                this.state.retailersAt = 0;
                this.state.focusCustomer = null;
                this.state.focusProduct = null;
                this.state.salespeople = null;
                ['recentSalesList', 'allSalesList', 'productGrid', 'retailerStockView', 'salespeopleView'].forEach(key => { if (this.elements[key]) this.elements[key].innerHTML = ''; });
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
        // A modal has a step of its own in the browser's history, so the phone's Back button closes it instead of leaving the page.
        //   _modalLive:  a modal is showing and its step is the newest one
        //   _modalStale: the modal has been closed but its step is still the newest one: the next view takes its place, or the next Back goes past it
        showModal(modalId) {
            this.elements.modalContainer.style.display = 'flex';
            this.elements.modalContainer.querySelectorAll('.modal-content').forEach(m => m.style.display = 'none');
            const modalToShow = document.getElementById(modalId);
            if (modalToShow) { modalToShow.style.display = 'flex'; }
            this._followKeyboard(true);
            if (this._modalStale) this._modalStale = false; // (the step of the modal before is used again)
            else if (!this._modalLive) this._pushStep({ modal: true });
            this._modalLive = true;
        },
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
                    this._closeDialog = null;
                    resolve(answer);
                };
                const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); finish(false); } };
                okBtn.onclick = () => finish(true);
                cancelBtn.onclick = () => finish(false);
                layer.onclick = (e) => { if (e.target === layer) finish(false); };
                document.addEventListener('keydown', onKey, true);
                this._closeDialog = finish;
                (danger && cancel ? cancelBtn : okBtn).focus({ preventScroll: true }); // a risky question starts on "Cancel"
            });
        },
        _say(text, title = 'Please check') { return this._dialog({ title, text }); },
        // Says what is missing and, only once the person has read it and tapped OK, shakes the field that needs them
        async _needs(field, text, title) {
            await this._say(text, title);
            this._shake(field);
        },
        _shake(field) {
            if (!field) return;
            const target = (field.closest && field.closest('.quantity-stepper, .pin-input-wrap, .input-with-prefix, .form-group, .reg-segment')) || field;
            if (target.scrollIntoView) target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            target.classList.remove('input-error-shake');
            void target.offsetWidth; // lets the shake play again if it was just playing
            target.classList.add('input-error-shake');
            setTimeout(() => target.classList.remove('input-error-shake'), 1200);
        },
        _ask(options) { return this._dialog(options); },
        hideModal() {
            this._hideModalBox();
            if (this._modalLive) { this._modalLive = false; this._modalStale = true; }
        },
        _hideModalBox() { this.elements.modalContainer.style.display = 'none'; this.elements.modalContainer.querySelectorAll('.modal-content').forEach(m => m.style.display = 'none'); this._followKeyboard(false); },

        // Adds a step to the history, but only once a step back that is still on its way has arrived (a step added before then would be lost in it)
        _pushStep(extra) {
            const push = () => { const view = this.state.currentView; history.pushState(Object.assign({ view }, extra), '', view ? `#${view}` : undefined); };
            if (this._backPending > 0) (this._stepQueue = this._stepQueue || []).push(push); else push();
        },
        _runSteps() { const queue = this._stepQueue || []; this._stepQueue = []; queue.forEach(fn => fn()); },
        // One step back in the history (an open modal is closed first: its step goes with it)
        _back() {
            if (this._modalLive) { this._hideModalBox(); this._modalLive = false; this._modalStale = true; }
            this._rawBack();
        },
        _rawBack() {
            this._backPending = (this._backPending || 0) + 1;
            clearTimeout(this._backGuard);
            this._backGuard = setTimeout(() => { this._backPending = 0; this._runSteps(); }, 800); // (in case no step comes back, as on the first page)
            history.back();
        },
        // The Back button was pressed with a modal open: its own Close / Cancel button is pressed for it, so whatever waits on it is let go
        _backClosesModal(landed) {
            const view = this.state.currentView;
            this._modalLive = false; // the browser has taken its step away
            if (landed.view && landed.view !== view) history.pushState({ view }, '', view ? `#${view}` : undefined); // (the step below belonged to another view: this one is put back)
            const open = Array.from(this.elements.modalContainer.querySelectorAll('.modal-content')).find(m => m.style.display !== 'none');
            const button = open && Array.from(open.querySelectorAll('[data-back]')).find(b => b.offsetParent !== null);
            if (!open) { this._hideModalBox(); return; }
            if (!button) { this._rawBack(); return; } // it cannot be closed (a salesperson waiting to be confirmed): Back goes on as if it were not there
            button.click();
            const closed = open.style.display === 'none' || this.elements.modalContainer.style.display === 'none';
            if (!closed) { this._modalLive = true; this._pushStep({ modal: true }); } // it stayed open (it was busy): its step goes back
        },
        // A pop-up (message or question) closes by itself on Back; the page behind it must not move, so the step Back took is put back
        _restoreStep() {
            const view = this.state.currentView;
            history.pushState(this._modalLive ? { view, modal: true } : { view }, '', view ? `#${view}` : undefined);
        },

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
            if (this._pinLock()) {
                el.pinConfirmError.textContent = `Too many wrong PINs. Try again in ${this._pinLock()} seconds.`;
                el.pinConfirmInput.value = '';
                return;
            }
            const record = await this._getPinRecord();
            if (record === null) {
                el.pinConfirmError.textContent = "Couldn't check your PIN. Try again.";
                el.pinConfirmOkBtn.disabled = false;
                return;
            }
            if (await this._pinMatches(entered, record)) {
                this._pinOk();
                this._finishPin(true);
                return;
            }
            this._pinFailed();
            el.pinConfirmError.textContent = 'Wrong PIN. Try again.';
            el.pinConfirmInput.value = '';
            el.pinInputWrap.classList.add('input-error-shake');
            setTimeout(() => el.pinInputWrap.classList.remove('input-error-shake'), 600);
            el.pinConfirmInput.focus();
        },

        // What this phone knows about the PIN; if it has nothing, ask the account
        async _getPinRecord() {
            const user = this.state.user || {};
            if (user.pinHash || (user.pin !== undefined && user.pin !== null && String(user.pin) !== '')) return user;
            try {
                if (user.phone && window.fb) {
                    const snap = await window.fb.getDoc(window.fb.doc(window.fb.db, 'users', user.phone));
                    if (snap.exists() && (snap.data().pinHash || snap.data().pin)) return snap.data();
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
                if (this._modalStale) { history.replaceState({ view: viewId }, '', `#${viewId}`); this._modalStale = false; } // (the closed modal's step becomes this view's)
                else history.pushState({ view: viewId }, '', `#${viewId}`);
            }

            if (this.state.productSelectionMode && viewId !== 'products-view') {
                this.state.productSelectionMode = false;
            }

            if (viewId === 'all-sales-view') {
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
                if (this.state.linksListener) {
                    this.state.linksListener();
                    this.state.linksListener = null;
                }
            }

            if (viewId === 'products-view' && !this.state.productSelectionMode) {
                this.elements.productSearchInput.value = '';
                const tab = this.state.openProductsOn || 'all'; // a message can open it on the Low stock or Out of stock tab
                this.state.openProductsOn = null;
                this.state.productFilter = tab;
                this.elements.productFilterTabs.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.filter === tab);
                });
                this.renderProducts();
            }

            this.showView(viewId);
            this.elements.navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewId));

            if (viewId === 'home-view') {
                this.elements.menuBtn.style.display = 'block';
                this.elements.backArrowBtn.style.display = 'none';
                if (this._chimeWaiting) { const loud = this._chimeWaiting === 'loud'; this._chimeWaiting = false; setTimeout(() => this._nudgeChime(loud), 600); } // a message came while scanning: now it can be heard (if it still fits the limits)
            } else {
                this.elements.menuBtn.style.display = 'none';
                this.elements.backArrowBtn.style.display = 'block';
            }

            this.elements.productsView.classList.toggle('selection-mode', this.state.productSelectionMode);
            this.elements.addNewProductBtn.style.display = (this.state.productSelectionMode || viewId !== 'products-view' || (this.state.user && this.state.user.type === 'Salesperson')) ? 'none' : 'flex';

            this.exitSelectionMode();
        },

        handlePopState(event) {
            const byApp = this._backPending > 0; // a step back the app asked for itself (not the Back button)
            if (byApp) this._backPending--;
            try {
                const landed = event.state || {};
                if (!byApp && this._closeDialog) { const close = this._closeDialog; this._restoreStep(); close(false); return; } // Back with a pop-up open closes the pop-up; nothing else moves
                if (!byApp && this._modalLive) { this._backClosesModal(landed); return; } // Back with a modal open closes the modal
                if (this._modalStale) { this._modalStale = false; this._rawBack(); return; } // the closed modal's step: on to the one before
                if (landed.modal) { this._rawBack(); return; } // the step of a modal closed long ago
                if (this._isWaiting()) return;
                this.navigateTo(landed.view || 'home-view', true);
            } finally {
                if (!(this._backPending > 0)) this._runSteps();
            }
        },

        // The teal part of the home page says so when there is no internet (and, for a moment, when it is back)
        _showConnection(online, atStart) {
            const banner = this.elements.offlineBanner, home = this.elements.homeView;
            if (!banner || !home) return;
            clearTimeout(this._backTimer);
            const title = document.getElementById('offline-title'), sub = document.getElementById('offline-sub');
            if (!online) {
                title.textContent = "You're offline";
                sub.textContent = 'Reconnect to use PikaShot and see new records';
                sub.style.display = '';
                banner.classList.remove('is-back');
                banner.hidden = false;
                home.classList.add('is-offline');
                return;
            }
            if (banner.hidden || atStart) { banner.hidden = true; home.classList.remove('is-offline'); return; } // it was never offline: nothing to say
            title.textContent = "You're back online";
            sub.style.display = 'none';
            banner.classList.add('is-back');
            this._backTimer = setTimeout(() => { banner.hidden = true; banner.classList.remove('is-back'); home.classList.remove('is-offline'); }, 2200);
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
                    this.elements.shareLogBtn.style.display = (this.state.user.type === 'Retailer' || this.state.user.type === 'Salesperson') ? 'none' : 'block';
                } else {
                    this.elements.seeStockLevelsContainer.style.display = 'none';
                    this.elements.shareLogBtn.style.display = 'none';
                }
            }
            const date = new Date();
            this.elements.welcomeDate.textContent = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

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

            // The total worth of the inventory (My Products) follows the same hide / show choice. A salesperson never sees it.
            const inventory = this.state.inventoryValue;
            const inventoryHidden = hidden || this._isSalesperson();
            if (this.elements.productTotalValue) {
                this.elements.productTotalValue.textContent = inventory == null ? '' : (inventoryHidden ? '***' : inventory);
            }
            if (this.elements.toggleInventoryFiguresBtn) {
                this.elements.toggleInventoryFiguresBtn.style.display = inventory == null ? 'none' : '';
            }

            [[this.elements.toggleFiguresBtn, hidden], [this.elements.toggleInventoryFiguresBtn, inventoryHidden]].forEach(([btn, isHidden]) => {
                if (!btn) return;
                btn.setAttribute('aria-pressed', String(isHidden));
                btn.setAttribute('aria-label', isHidden ? 'Show figures' : 'Hide figures');
                const open = btn.querySelector('.eye-open'), closed = btn.querySelector('.eye-closed');
                if (open) open.style.display = isHidden ? 'none' : '';
                if (closed) closed.style.display = isHidden ? '' : 'none';
            });
        },

        toggleFigures(e) {
            e.stopPropagation(); // the card itself opens All Sales
            if (this._isSalesperson() && e.currentTarget === this.elements.toggleInventoryFiguresBtn) { // that eye stays closed, and they are told why
                const admin = this.state.user.businessAdminName || this.state.user.businessName;
                say(`The total worth of the products is only visible to your admin${admin ? ` (${admin})` : ''}.`, 'Admin only');
                return;
            }
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
                const imageUrl = imageBlob ? URL.createObjectURL(imageBlob) : (this._safeImageUrl(matchedProduct && matchedProduct.thumb) || 'icons/icon-192.png');

                // Add discount marker if applicable
                let discountMark = '';
                if (sale.saleType === 'credit') {
                    discountMark = '<sup class="discount-mark" style="color:red;">**</sup>';
                } else if (sale.discount && sale.discount > 0) {
                    discountMark = '<sup class="discount-mark">**</sup>';
                }

                saleEl.innerHTML = `<div class="sale-item-overlay">Previously Transferred</div><img src="${imageUrl}" alt="${this._esc(sale.productName)}"><div class="sale-info"><p>${this._esc(sale.productName)}</p><span>${this.formatNumber(sale.quantity)} x &#8358;${this.formatNumber(sale.price)}</span></div><p class="sale-price">${discountMark}&#8358;${this.formatNumber(sale.total)}</p>${this._saleEditExtrasHtml(sale)}`;

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

                const groupSales = groupedSales[groupTitle];
                let totalHtml = `<p class="sales-group-total">&#8358;${this.formatNumber(dailyTotal)}</p>`;
                let acknowledgedHtml = '';

                // A salesperson sees which days their admin has confirmed the money for
                if (this._isSalesperson() && Array.isArray(groupSales) && groupSales.length && groupSales.every(sale => sale.moneyConfirmed)) {
                    const checkmarkIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="checkmark-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
                    totalHtml = `<p class="sales-group-total acknowledged">${checkmarkIcon} &#8358;${this.formatNumber(dailyTotal)}</p>`;
                    acknowledgedHtml = `<span class="acknowledgement-text">Money confirmed by ${this._esc(this.state.user.businessName || 'your admin')}.</span>`;
                }

                groupHeader.innerHTML = `<h3>${this._esc(groupTitle)}</h3>${totalHtml}`;
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
                    const imageUrl = imageBlob ? URL.createObjectURL(imageBlob) : (this._safeImageUrl(matchedProduct && matchedProduct.thumb) || 'icons/icon-192.png');

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

                    saleEl.innerHTML = `<div class="sale-item-overlay">Previously Transferred</div>${numberingHtml}<img src="${imageUrl}" alt="${this._esc(sale.productName)}"><div class="sale-info"><p>${this._esc(sale.productName)}</p><span>${this.formatNumber(sale.quantity)} x &#8358;${this.formatNumber(sale.price)}</span></div><p class="sale-price">${discountMark}&#8358;${this.formatNumber(sale.total)}</p>${this._saleEditExtrasHtml(sale)}`;
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
            const lowLevel = this._lowStockLevel();
            const isLow = (p) => p.stock > 0 && p.stock < lowLevel;
            this._setTabCount('restock', 'Low stock', allProducts.filter(isLow).length);
            this._setTabCount('outofstock', 'Out of stock', allProducts.filter(p => p.stock <= 0).length);
            this.elements.lowStockSettingsBtn.style.display = this._isSalesperson() ? 'none' : ''; // only the admin sets it
            if (filterType === 'restock') {
                filteredProducts = allProducts.filter(isLow);
            } else if (filterType === 'outofstock') {
                filteredProducts = allProducts.filter(p => p.stock <= 0);
            }

            // Then apply search text filter
            const products = searchText
                ? filteredProducts.filter(p => p.name.toLowerCase().includes(searchText.toLowerCase()))
                : filteredProducts;

            if (allProducts.length > 0) {
                this.elements.productSearchContainer.style.display = 'block';
                document.getElementById('product-filter-tabs').style.display = 'flex';
                this.elements.productSkuCount.style.display = 'block';
            } else {
                this.elements.productSearchContainer.style.display = 'none';
                document.getElementById('product-filter-tabs').style.display = 'none';
                this.elements.productSkuCount.style.display = 'none';
            }

            if (products.length === 0) {
                if (this._isSalesperson() && !searchText && filterType === 'all') {
                    this.elements.productGrid.innerHTML = '<p class="empty-state">Your admin has not added any products yet.</p>';
                } else if (searchText) {
                    this.elements.productGrid.innerHTML = '<p class="empty-state">No products match your search.</p>';
                } else if (filterType === 'restock') {
                    this.elements.productGrid.innerHTML = `<p class="empty-state">No products below ${lowLevel} units yet</p>`;
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
                card.dataset.productId = product.id;
                const imageUrl = product.image ? URL.createObjectURL(product.image) : (this._safeImageUrl(product.thumb) || 'icons/icon-192.png');

                let badgeHtml = '';
                if (product.stock <= 0) {
                    badgeHtml = '<div class="out-of-stock-badge">Out of Stock</div>';
                } else if (this._isSalesperson()) {
                    if (isLow(product)) badgeHtml = '<div class="restock-badge">Low stock!</div>';
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
                } else if (isLow(product)) {
                    badgeHtml = '<div class="restock-badge">Low stock!</div>';
                }

                const words = product.name.split(' ');
                const displayName = words.length > 2 ? words.slice(0, 2).join(' ') + '...' : product.name;

                const pencilIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
                card.innerHTML = `
                    ${badgeHtml}
                    ${this._isSalesperson() ? '' : `<button class="edit-btn-icon">${pencilIconSVG}</button>`}
                    <div class="product-card-image-wrapper">
                        <img src="${imageUrl}" alt="${this._esc(product.name)}">
                    </div>
                    <div class="product-card-info">
                        <h4>${this._esc(displayName)}</h4>
                        <p class="product-price">&#8358;${this.formatNumber(product.price)}</p>
                        <p class="product-stock">${product.stock > 0 ? `${this.formatNumber(product.stock)} ${this._esc(product.unit)} left` : ''}</p>
                    </div>${this._productEditMarkHtml(product)}`;

                const editBtn = card.querySelector('.edit-btn-icon');
                if (editBtn) editBtn.addEventListener('click', (e) => {
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
            this._flashCard('focusProduct', `[data-product-id="${CSS.escape(String((this.state.focusProduct || {}).id))}"]`);
        },

        // Scrolls to a card a message pointed at and lets it flash. `what` names where the target is kept in state: it is waited for
        // up to 15 seconds, and once it has flashed it is kept for 4 more, so a list drawn again a moment later (a second update) flashes it again.
        _flashCard(what, selector) {
            const target = this.state[what];
            if (!target) return;
            if (Date.now() > target.until) { this.state[what] = null; return; }
            const card = document.querySelector(selector);
            if (!card) return;
            if (!target.at) { // the first time: scroll to it
                target.at = Date.now();
                target.until = target.at + 4000;
                card.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
            card.classList.remove('focus-flash');
            void card.offsetWidth;
            card.classList.add('focus-flash');
            setTimeout(() => card.classList.remove('focus-flash'), 2600);
        },

        // --- Low stock level: how few units left makes a product "Low stock" (the admin sets it; a salesperson sees theirs) ---
        _lowStockLevel() {
            const u = this.state.user || {};
            const level = Number(u.type === 'Salesperson' ? u.businessLowStock : u.lowStockLevel);
            return level >= 1 ? Math.floor(level) : 7;
        },

        // "Low stock" / "Out of stock" tabs show how many products are in them (nothing when there are none)
        _setTabCount(filter, label, count) {
            const btn = document.querySelector(`#product-filter-tabs [data-filter="${filter}"]`);
            if (!btn) return;
            btn.textContent = count > 0 ? `${label} ` : label;
            if (!(count > 0)) return;
            const badge = document.createElement('span');
            badge.className = 'tab-count';
            badge.textContent = String(count);
            btn.appendChild(badge);
        },

        openLowStockSettings() {
            const input = document.getElementById('low-stock-input');
            input.value = String(this._lowStockLevel());
            this.showModal('low-stock-modal');
            setTimeout(() => { input.focus(); input.select(); }, 150);
        },

        async handleSaveLowStock() {
            const input = document.getElementById('low-stock-input');
            const level = parseInt(input.value, 10);
            if (!(level >= 1)) { await this._needs(input, 'Enter a number from 1 up, like 7.', 'Check your entry'); return; }
            const user = this.state.user;
            user.lowStockLevel = level;
            this.hideModal();
            try {
                await DB.saveUser(user, false);
                if (this.state.firebaseReady) await window.fb.setDoc(window.fb.doc(window.fb.db, 'users', user.phone), { lowStockLevel: level }, { merge: true });
            } catch (error) {
                console.error('Could not save the low stock level:', error);
            }
            await this.renderProducts(this.elements.productSearchInput.value);
            this.showToast(`Low stock now shows below ${level}.`);
        },

        // --- Limits: how many products an account can hold, and how often one can be edited by hand ---
        async _roomForProducts(extra) {
            const count = (await DB.getAllProducts()).length;
            if (count + extra <= LIMITS.maxProducts) return true;
            const left = Math.max(0, LIMITS.maxProducts - count);
            say(`You can keep up to ${LIMITS.maxProducts} products and you have ${count}${left ? `, so there is room for ${left} more` : ''}. Delete a product you no longer sell to make room.`, 'Product limit');
            return false;
        },

        // How many products a transfer would add (the ones that match something already in the list are just topped up)
        _countNewProducts(items, products) {
            const known = [...products];
            let added = 0;
            for (const item of items || []) {
                const name = String(item.name || '').toLowerCase();
                const hit = known.find(p => (item.barcode && this._barcodesMatch(p.barcode, item.barcode)) || String(p.originalName || p.name || '').toLowerCase() === name);
                if (!hit) { added++; known.push({ barcode: item.barcode, name: item.name }); }
            }
            return added;
        },

        _recentEdits() {
            const list = (this.state.user && Array.isArray(this.state.user.recentEdits)) ? this.state.user.recentEdits : [];
            return list.map(Number).filter(t => t > 0 && Date.now() - t < 3600000).sort((x, y) => x - y);
        },

        async _checkEditQuota() {
            const recent = this._recentEdits();
            if (recent.length < LIMITS.editsPerHour) return true;
            const minutes = Math.max(1, Math.ceil((recent[0] + 3600000 - Date.now()) / 60000));
            say(`You can edit products ${LIMITS.editsPerHour} times an hour, and you have used all ${LIMITS.editsPerHour}. Try again in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`, 'Edit limit');
            return false;
        },

        async _recordEdit() {
            const user = this.state.user;
            user.recentEdits = [...this._recentEdits(), Date.now()];
            try {
                await DB.saveUser(user, false);
                if (this.state.firebaseReady) await window.fb.setDoc(window.fb.doc(window.fb.db, 'users', user.phone), { recentEdits: user.recentEdits }, { merge: true });
            } catch (error) { console.error('Could not note the edit:', error); }
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
            const base = { userId: this._businessPhone() || this.state.user.phone, total: sale.total, timestamp: window.fb.serverTimestamp() };
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

        // Where this shop is, to the nearest few hundred metres. It is kept in a private spot that only the dashboard can read,
        // never on the profile (a profile can be looked up by anyone who has the phone number). Only called after location was allowed.
        async _saveGeo(position) {
            const user = this.state.user;
            if (!user || !user.phone || !position || !position.coords || !this.state.firebaseReady) return;
            return this._sendGeo(user, {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                accuracy: Math.round(position.coords.accuracy || 0)
            });
        },

        async _sendGeo(user, place) {
            const lat = Number(Number(place.lat).toFixed(3));
            const lng = Number(Number(place.lng).toFixed(3));
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
            const geo = { lat, lng, accuracy: Math.max(0, Math.round(Number(place.accuracy) || 0)) };
            user.geo = geo;
            user.geoSent = true; // once per sign-in
            try { await DB.saveUser(user, false); } catch (error) { /* the cloud copy below is what matters */ }
            try {
                await window.fb.setDoc(window.fb.doc(window.fb.db, 'user_geo', user.phone), { ...geo, at: window.fb.serverTimestamp() });
            } catch (error) {
                console.error('Could not save location:', error);
                user.geoSent = false; // try again at the next start
                return;
            }
            try { // accounts from before kept it on the profile: tidy that away
                await window.fb.updateDoc(window.fb.doc(window.fb.db, 'users', user.phone), { geo: window.fb.deleteField() });
            } catch (error) { /* the profile may already be clean */ }
        },

        // Anyone who already allowed location (it is asked for at sign-up) but was never saved, or whose location still sits on the
        // profile from the older version: no new prompt is shown
        async _backfillGeo() {
            try {
                const user = this.state.user;
                if (!user || user.geoSent || !this.state.firebaseReady) return;
                if (user.geo && Number.isFinite(Number(user.geo.lat)) && Number.isFinite(Number(user.geo.lng))) {
                    await this._sendGeo(user, user.geo);
                    return;
                }
                if (!navigator.geolocation || !navigator.permissions) return;
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
                    this._saveGeo(position);
                    this.showView('camera-permission-view');
                },
                (error) => {
                    console.warn('Location permission denied:', error.message);
                    this.showToast("Location is off. You can turn it on later in your browser settings.");
                    this.showView('camera-permission-view');
                },
                { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 } // the general area is enough, and is found faster indoors
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
                    this._back();
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
                    notes.forEach(({ freq, start, dur, type, vol, release, attack }) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        const t0 = base + start;
                        const peak = vol || 0.15;
                        const rise = attack || 0.01; // how gently the note starts
                        osc.type = type || 'sine';
                        osc.frequency.value = freq;
                        gain.gain.setValueAtTime(0.0001, t0);
                        gain.gain.linearRampToValueAtTime(peak, t0 + rise);
                        gain.gain.setValueAtTime(peak, t0 + Math.max(rise + 0.001, dur - (release || 0.09))); // hold, then release
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

        // One short, clean blip for a good scan: a pure E6 (clear on a phone speaker) with a soft octave below for warmth and a faint octave above
        // for sparkle. It starts gently and dies away at once, with no hard edges (the old one was a sharp 2300 Hz square wave).
        _playScanBeep() {
            this._playNotes([
                { freq: 1318.5, start: 0, dur: 0.26, vol: 0.17, attack: 0.012, release: 0.2 },
                { freq: 659.25, start: 0, dur: 0.28, vol: 0.045, attack: 0.014, release: 0.22 },
                { freq: 2637, start: 0, dur: 0.18, vol: 0.022, attack: 0.012, release: 0.14 }
            ]);
        },

        async _handleSuccessfulScan() {
            this._playScanBeep();
            await DB.incrementScanCount();
            this._nudgeAct('scan');
            this._pendingScans = (this._pendingScans || 0) + 1;
            clearTimeout(this._scanTimer);
            this._scanTimer = setTimeout(() => this._flushScans(), 30000); // sent together, not one by one
            this.updateScanTracker();
        },

        async startAddProduct() {
            if (this._isSalesperson()) {
                this.showToast('Only your admin can add products.');
                return;
            }
            if (!(await this._roomForProducts(1))) return;
            this._setCameraActions(false);
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
                        this._back();
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
                    this._back();
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
                    this._back();
                    this.handlePikaLogScanned(result.data);
                    break;
                case 'qrlog_id':
                    this._handleSuccessfulScan();
                    this._back();
                    this.handlePikaLogIdScanned(result.data);
                    break;
            }
        },

        // New users sometimes tap Record Sale before adding anything to sell: guide them to Products first.
        redirectToAddProducts() {
            const isSalesperson = this.state.user && this.state.user.type === 'Salesperson';
            this.showToast(isSalesperson
                ? "Your admin has not added any products yet."
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
            this._setCameraActions(true);
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

                    this._back();
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
                    this._back();
                    this.handleSellScanNotFound(true);
                },
                this.elements.scanTimerDisplay,
                this._scanOptions()
            );
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
            this.state.newProductKey = this._newId(); // this form makes ONE product
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
            return this._once('saveProduct', () => this._saveProduct(), this.elements.saveProductBtn);
        },

        async _saveProduct() {
            if (this._isSalesperson()) return;

            // NEW: Enforce internet connection for product management
            if (!navigator.onLine) {
                this.showToast("Internet connection required to manage products.");
                return;
            }

            const isEditing = !!this.state.editingProduct;

            let productData = {
                id: isEditing ? this.state.editingProduct.id : (this.state.newProductKey || (this.state.newProductKey = this._newId())), // one id for the whole form: saving twice is the same product
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

            if (isEditing) productData.editedAt = this._serverNow(); // every edit starts the product's "recently edited" line afresh (online time, so every phone agrees)

            const form = this.elements;
            if (!productData.name) { await this._needs(form.productNameInput, 'Add the product name.', 'Check your entry'); return; }
            if (form.productPriceInput.value.trim() === '' || isNaN(productData.price)) { await this._needs(form.productPriceInput, 'Add the price.', 'Check your entry'); return; }
            if (form.productStockInput.value.trim() === '' || isNaN(productData.stock)) { await this._needs(form.productStockInput, 'Add how many are in stock.', 'Check your entry'); return; }

            if (!productData.image) {
                await this._needs(form.addChangePictureBtn, 'Add a photo of the product first.', 'Photo needed');
                return;
            }

            if (isEditing && this.state.editingProduct.needsSetup === 'barcode-and-price' && !productData.barcode) {
                await this._needs(form.scanNewBarcodeBtn, 'Scan this product\'s barcode first.', 'Barcode needed');
                return;
            }

            // New products need room; an edit counts towards the hourly limit (finishing a received product's setup does not)
            let saveOptions = null;
            if (!isEditing) {
                if (!(await DB.getProduct(productData.id)) && !(await this._roomForProducts(1))) return; // (a product already saved by an earlier try needs no new room)
            } else {
                const before = this.state.editingProduct;
                const changed = ['name', 'price', 'stock', 'unit', 'barcode', 'stockVisible'].filter(k => JSON.stringify(productData[k] === undefined ? null : productData[k]) !== JSON.stringify(before[k] === undefined ? null : before[k]));
                const pictureChanged = !!this.state.capturedBlob && this.state.capturedBlob !== before.image; // a new picture, not the old one loaded into the form
                if (!changed.length && !pictureChanged) {
                    this.hideModal();
                    this.state.editingProduct = null;
                    this.showToast('Nothing was changed.');
                    return;
                }
                const counts = !before.needsSetup;
                if (counts && !(await this._checkEditQuota())) return;
                saveOptions = { only: [...changed, 'editedAt', ...(before.needsSetup ? ['needsSetup'] : [])], counts };
            }

            if (productData.unit === 'cartons' && this.state.user.type === 'Wholesaler') {
                this.elements.cartonDetailsForm.reset();
                this.elements.cartonProductNameLabel.textContent = "What's inside?";
                this.elements.cartonQuantityLabel.textContent = 'How many per carton?';
                this.state.tempProductDataForCarton = productData;
                this.state.tempSaveOptions = saveOptions && { counts: saveOptions.counts }; // the carton details are saved with the whole product
                this.hideModal();
                this.showModal('carton-details-modal');
                return;
            }

            await this._commitProductSave(productData, saveOptions);
        },

        async handleSaveCartonDetails(e) {
            e.preventDefault();
            return this._once('saveProduct', () => this._saveCartonDetails());
        },

        async _saveCartonDetails() {
            if (!this.state.tempProductDataForCarton) return;

            const subUnitType = this.elements.cartonSubunitTypeInput.value;
            const subUnitQuantity = this.unformatNumber(this.elements.cartonSubunitQuantityInput.value);

            if (!subUnitType) { await this._needs(this.elements.cartonSubunitTypeInput, 'Choose what is inside.', 'Check your entry'); return; }
            if (isNaN(subUnitQuantity) || subUnitQuantity <= 0) { await this._needs(this.elements.cartonSubunitQuantityInput, 'Add how many are in each carton.', 'Check your entry'); return; }

            let productData = this.state.tempProductDataForCarton;
            productData.subUnitType = subUnitType;
            productData.subUnitQuantity = subUnitQuantity;

            await this._commitProductSave(productData, this.state.tempSaveOptions);
            this.state.tempProductDataForCarton = null;
            this.state.tempSaveOptions = null;
        },

        async _commitProductSave(productData, saveOptions) {
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

            // A small copy of the picture is saved online with the product, so it is still there after logging out or
            // clearing the phone's data. It is made again only when the picture itself is new.
            let thumbChanged = false;
            const newPicture = !!this.state.capturedBlob && !(before && before.image === this.state.capturedBlob);
            if (productData.image instanceof Blob && (newPicture || !(before && before.thumb))) {
                const thumb = await this._productThumb(productData.image);
                if (thumb) { productData.thumb = thumb; thumbChanged = true; }
            } else if (before && before.thumb) {
                productData.thumb = before.thumb;
            }
            if (before && before._seenInCloud) productData._seenInCloud = true;

            let options = null;
            if (saveOptions && saveOptions.only) {
                options = { only: thumbChanged ? [...saveOptions.only, 'thumb'] : saveOptions.only, thumb: thumbChanged };
            } else if (before) {
                options = { thumb: thumbChanged }; // the whole product goes (cartons), the picture only if it is new
            } else {
                options = { thumb: true };
            }
            await DB.saveProduct(productData, options);
            if (saveOptions && saveOptions.counts) this._recordEdit();
            await this._syncSupplierStock(productData); // no-op unless this product came from a supplier

            this.hideModal();
            this.state.capturedBlob = null;
            this.state.capturedBarcode = null;
            this.state.editingProduct = null;
            this.state.newProductKey = null;

            this.navigateTo('products-view');
            await this.renderProducts();
        },

        handleEditProduct(product) {
            if (this._isSalesperson()) { this.showToast('Only your admin can edit products.'); return; }
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
            if (this._isSalesperson()) { say('Only your admin can delete products.', 'Admin only'); return; }
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

        // The camera screen's buttons: only a sale scan offers "Select from products"
        _setCameraActions(withSelect) {
            if (!this.elements.scanSelectFromProductsBtn) return;
            this.elements.scanSelectFromProductsBtn.style.display = withSelect ? 'block' : 'none';
            this.elements.cancelScanBtn.style.flex = withSelect ? '0 0 30%' : '0 0 100%';
            this.elements.cancelScanBtn.style.maxWidth = withSelect ? '100px' : '300px';
        },

        async handleAddOrChangePicture() {
            this.hideModal();

            // Hide scan-related UI elements for photo capture
            document.querySelector('#camera-overlay .scan-box').style.display = 'none';
            this._setCameraActions(false); // taking a picture has nothing to do with selling
            this.elements.scanFeedback.textContent = 'Hold steady...';

            const attempt = this._photoAttempt = (this._photoAttempt || 0) + 1;
            this.navigateTo('camera-view');
            try {
                const { blob } = await Camera.capturePhoto(this.elements.scanTimerDisplay, this.elements.scanFeedback);
                if (attempt !== this._photoAttempt) return; // a newer picture was started meanwhile
                if (this.state.currentView === 'camera-view') this._back(); // Cancel has already gone back once
                if (blob) {
                    this.state.capturedBlob = blob;
                    this.elements.capturedImagePreview.src = URL.createObjectURL(blob);
                    this.showModal('confirm-picture-modal');
                }
            } catch (error) {
                console.error("Error capturing image:", error);
                say("The photo did not work. Please try again.", "Photo failed");
                if (this.state.currentView === 'camera-view') this._back();
            }
        },

        startBarcodeAssignmentScan() {
            this.hideModal();
            this._setCameraActions(false);
            this.elements.scanFeedback.textContent = 'Scan new barcode...';
            this.navigateTo('camera-view');
            Camera.startScan(
                this.handleBarcodeAssignmentResult.bind(this),
                () => {
                    this.elements.scanFeedback.textContent = 'Product not found.';
                    setTimeout(() => {
                        this._back();
                        this.showModal('product-form-modal');
                        say('No barcode found. Hold the phone steady and try again.', 'Not found');
                    }, 500);
                },
                this.elements.scanTimerDisplay,
                this._scanOptions()
            );
        },

        async handleBarcodeAssignmentResult(result) {
            this._back();
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
            this.state.saleKey = this._newId(); // this box makes ONE sale: every tap on Confirm is that same sale
            this.elements.saleModalTitle.textContent = 'Confirm Sale';
            this.elements.saleProductImage.src = product.image ? URL.createObjectURL(product.image) : (this._safeImageUrl(product.thumb) || 'icons/icon-192.png');
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

            // Credit: a part payment can never be more than the total, and what is left to pay shows as they type
            const owing = this.elements.amountOwing;
            const paidInput = this.elements.discountAmountInput;
            if (activeRadio && activeRadio.value === 'credit' && paidInput.value.trim() !== '') {
                let paid = this.unformatNumber(paidInput.value) || 0;
                if (paid > total) {
                    paid = total;
                    paidInput.value = this.formatNumber(total);
                    const wrap = this.elements.discountInputWrapper;
                    wrap.classList.remove('input-error-shake');
                    void wrap.offsetWidth; // lets the shake play again if it was just playing
                    wrap.classList.add('input-error-shake');
                    setTimeout(() => wrap.classList.remove('input-error-shake'), 500);
                }
                owing.innerHTML = `Owing: <strong>₦${this.formatNumber(total - paid)}</strong>`;
                owing.style.display = 'block';
            } else {
                owing.style.display = 'none';
                owing.textContent = '';
            }
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
                    await this._needs(this.elements.selectContactBtn, 'Pick who is buying on credit.', 'Customer needed');
                    return false;
                }
                if (this.elements.discountAmountInput.value.trim() === '') {
                    await this._needs(this.elements.discountAmountInput, 'How much did they pay now? Enter 0 if nothing.', 'Amount needed');
                    return false;
                }
                customerName = this.state.selectedContact.name;
            }

            const editing = this.state.editingSale;
            // When editing, the original sale's quantity goes back into stock before the new quantity is taken out
            const availableStock = product ? product.stock + (editing ? editing.quantity : 0) : 0;
            const unitPrice = editing ? editing.price : (product ? product.price : 0);

            if (!product) { say('This product is no longer available.', 'Not available'); return false; }
            if (quantity <= 0) { await this._needs(this.elements.saleQuantityInput, 'Enter how many you are selling.', 'Check your entry'); return false; }
            if (quantity > availableStock) { await this._needs(this.elements.saleQuantityInput, `Only ${this.formatNumber(availableStock)} ${product.unit} left in stock.`, 'Not enough stock'); return false; }
            if (partPayment !== null && partPayment > Math.round(quantity * unitPrice)) { await this._needs(this.elements.discountAmountInput, 'The part payment cannot be more than the total.', 'Check the amount'); return false; }

            let total = Math.max(0, Math.round((quantity * unitPrice) - discount));
            if (activeRadio && activeRadio.value === 'credit') {
                total = partPayment; // User requested: part payment becomes recorded total
            }

            // The id is made when the confirm box opens, so a second tap, or a retry after a slow connection, is the same sale and never a new one
            const id = editing ? editing.id : this.state.saleKey;
            if (!id) return false; // this box was already used: there is nothing left to record

            const sale = {
                ...(editing || {}),
                id,
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
            if (!editing && this._isSalesperson()) { // the admin sees who recorded it
                sale.recordedBy = this.state.user.phone;
                sale.recordedByName = this.state.user.name;
            }

            // A credit sale to a customer who has PikaShot is also sent to them. The copy's id comes from the sale's id,
            // so it can only ever exist once (not repeated when an existing sale is edited)
            const transferTo = (!editing && sale.saleType === 'credit' && this.state.selectedContact && this.state.selectedContact.phone)
                ? this.state.selectedContact.phone.trim().replace(/\s+/g, '') : null;
            const sendTransfer = !!transferTo && transferTo.length >= 10 && !!this.state.firebaseReady && !!window.fb;
            if (sendTransfer) {
                // The sale only counts as transferred once the recipient accepts it
                sale.pendingTransfer = { logId: `xfer_${sale.id}`, to: transferTo };
                sale.pendingTransfers = [sale.pendingTransfer];
            }

            // Saved on this phone in one step: the sale and the stock it takes out (for an edit: the difference). Nothing online comes first.
            const done = editing ? await DB.editSale(sale, product.id) : await DB.recordSale(sale, product.id, -quantity);
            if (done.product) product.stock = done.product.stock;
            if (!editing && !done.inserted) return true; // an earlier tap already recorded this sale: nothing more to do

            if (editing) {
                this._logSale(sale, product, true);
            } else {
                this._logSale(sale, product);
                this._nudgeAct('sale');
            }
            // What needs the internet happens after the sale is safe, and never holds the screen
            if (sendTransfer) this._sendCreditTransfer(sale, product, transferTo);
            this._reportSupplierStock(product);
            return true;
        },

        // The copy of a credit sale that goes to the customer's PikaShot. Its id is made from the sale's id, so it cannot be made twice.
        async _sendCreditTransfer(sale, product, targetPhone) {
            try {
                const sender = this._sender();
                const logData = {
                    pikaLogVersion: 2,
                    senderStore: sender.store,
                    senderId: sender.id,
                    senderRole: sender.role,
                    ...(this._isSalesperson() ? { sentBy: this.state.user.phone, sentByName: this.state.user.name } : {}),
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
                await window.fb.setDoc(window.fb.doc(window.fb.db, 'shared_logs', sale.pendingTransfer.logId), logData);
                this._nudgeAct('transfer');
            } catch (error) {
                console.error("Error auto-transferring credit sale:", error);
            }
        },

        // Tells the supplier how much of their product is left (in the background)
        _reportSupplierStock(product) {
            if (!(this.state.firebaseReady && product.supplierId && this._businessPhone() && product.stockVisible !== false)) return;
            try {
                const retailerDocRef = window.fb.doc(window.fb.db, `retailer_stocks/${product.supplierId}/supplied_retailers/${this._businessPhone()}`);
                const updateData = {};
                const firebaseProductName = product.originalName || product.name;
                updateData[`products.${firebaseProductName}.stock`] = product.stock;
                updateData[`products.${firebaseProductName}.lastSaleTimestamp`] = window.fb.serverTimestamp();
                updateData.lastUpdate = window.fb.serverTimestamp();
                window.fb.updateDoc(retailerDocRef, updateData).catch((error) => console.error("Failed to sync sale to Firebase:", error));
            } catch (error) {
                console.error("Failed to sync sale to Firebase:", error);
            }
        },

        async handleConfirmSale() {
            if (this._confirmingSale) return; // a second tap while the first is still being saved does nothing
            if (!navigator.onLine) {
                this.elements.saleOfflineNotice.style.display = 'block';
                return; // Stop execution
            }

            this._confirmingSale = true;
            const button = this.elements.confirmSaleBtn;
            const label = button.innerHTML;
            button.disabled = true;
            button.textContent = 'Saving…';
            try {
                const wasEditing = !!this.state.editingSale;
                const success = await this._processSale();

                this.elements.saleOfflineNotice.style.display = 'none'; // Hide if online
                if (success) {
                    this.state.editingSale = null;
                    this.state.saleKey = null; // used: a late tap on this box can not record anything
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
                this.elements.saleOfflineNotice.style.display = 'block'; // trying again is safe: it is the same sale
            } finally {
                this._confirmingSale = false;
                button.disabled = false;
                button.innerHTML = label;
            }
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

        // "Recorded by you" / "Recorded by Chidi": shown when a sale is swiped to the left
        _recordedByText(sale) {
            const me = this.state.user && this.state.user.phone;
            if (!sale.recordedBy || sale.recordedBy === me) return 'Recorded by you';
            return `Recorded by ${sale.recordedByName || 'a salesperson'}`;
        },

        // Every sale sits in a row: small labels beside it (Edited, Credit, Transferred) and, hidden behind it, who recorded it
        _appendSaleEl(container, saleEl, sale) {
            const { right, left } = this._saleSideLabels(sale);
            const row = document.createElement('div');
            row.className = 'sale-row';
            const by = document.createElement('div');
            by.className = 'sale-by';
            const byText = document.createElement('span');
            byText.textContent = this._recordedByText(sale);
            by.appendChild(byText);
            row.appendChild(by);
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

        addSaleItemEventListeners(element, sale) {
            this._bindSaleSwipe(element);
            element.addEventListener('click', (e) => {
                if (Date.now() - (element._swipedAt || 0) < 400) return; // the end of a swipe is not a tap
                if (element.classList.contains('revealed')) { this._closeSwipe(element); return; }
                if (e.target.classList.contains('sale-item-overlay')) return;
                if (!this.state.isSelectionMode) {
                    this.enterSelectionMode(element, sale);
                } else {
                    this.toggleSaleSelection(element, sale);
                }
            });
        },

        // Drag a sale to the left to see who recorded it; it slides back by itself after a moment
        _bindSaleSwipe(element) {
            const REVEAL = 124;
            let startX = 0, startY = 0, base = 0, pointer = null, tracking = false, horizontal = false;
            const move = (x) => element.style.setProperty('--swipe', `${x}px`);
            const row = () => element.parentElement;
            element.addEventListener('pointerdown', (e) => {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                startX = e.clientX; startY = e.clientY; pointer = e.pointerId;
                tracking = true; horizontal = false;
                base = element.classList.contains('revealed') ? -REVEAL : 0;
            });
            element.addEventListener('pointermove', (e) => {
                if (!tracking || e.pointerId !== pointer) return;
                const dx = e.clientX - startX, dy = e.clientY - startY;
                if (!horizontal) {
                    if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { tracking = false; return; } // the page is being scrolled
                    if (Math.abs(dx) < 10) return;
                    horizontal = true;
                    this._closeOtherSwipes(element);
                    clearTimeout(element._swipeTimer);
                    element.classList.add('swiping');
                    if (row()) row().classList.add('peek');
                    try { element.setPointerCapture(pointer); } catch (err) { /* not every browser lets the sale keep the pointer */ }
                }
                move(Math.max(-REVEAL, Math.min(0, base + dx)));
            });
            const finish = (e) => {
                if (!tracking || e.pointerId !== pointer) return;
                tracking = false;
                if (!horizontal) return;
                element._swipedAt = Date.now();
                element.classList.remove('swiping');
                const x = parseFloat(element.style.getPropertyValue('--swipe')) || 0;
                if (x < -REVEAL / 2) {
                    element.classList.add('revealed');
                    move(-REVEAL);
                    element._swipeTimer = setTimeout(() => this._closeSwipe(element), 3500);
                } else {
                    this._closeSwipe(element);
                }
            };
            element.addEventListener('pointerup', finish);
            element.addEventListener('pointercancel', finish);
        },

        _closeSwipe(element) {
            clearTimeout(element._swipeTimer);
            element.classList.remove('revealed', 'swiping');
            element.style.setProperty('--swipe', '0px');
            const row = element.parentElement;
            if (row) setTimeout(() => { if (!element.classList.contains('revealed') && !element.classList.contains('swiping')) row.classList.remove('peek'); }, 250);
        },

        _closeOtherSwipes(except) {
            document.querySelectorAll('.sale-item.revealed').forEach(el => { if (el !== except) this._closeSwipe(el); });
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
            if (!sale || sale.edited || sale.sharedAsLog || sale.pendingTransfer || sale.moneyConfirmed) return false;
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
            const elapsed = this._serverNow() - editedAt; // both on the online clock
            if (elapsed >= this.PRODUCT_EDIT_MARK_MS || elapsed < -60000) return ''; // expired, or stamped far in the future
            const expires = Date.now() + (this.PRODUCT_EDIT_MARK_MS - Math.max(0, elapsed)); // on this phone's own clock, for the tick that removes it
            return `<div class="product-edit-timer" data-expires="${Math.round(expires)}" style="animation-duration: ${this.PRODUCT_EDIT_MARK_MS / 1000}s; animation-delay: -${(Math.max(0, elapsed) / 1000).toFixed(2)}s"></div>`;
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
                    this._nudgeAct('receipt');
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
            this.state.transferKey = this._newId(); // this box sends ONE transfer: a second tap or a retry is the same one
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

            if (targetPhone === this.state.user.phone || targetPhone === this._businessPhone()) {
                this._setTransferState('error', targetPhone === this.state.user.phone ? "You can't transfer products to yourself." : "You can't transfer products to your own business.");
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
                if (userData.type === 'Salesperson') {
                    this._setTransferState('error', "You can't transfer products to a salesperson.");
                    return;
                }
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
            return this._once('transfer', () => this._sendTransfer());
        },

        async _sendTransfer() {
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

                const sender = this._sender();
                const logData = {
                    pikaLogVersion: 2,
                    senderStore: sender.store,
                    senderId: sender.id,
                    senderRole: sender.role,
                    ...(this._isSalesperson() ? { sentBy: this.state.user.phone, sentByName: this.state.user.name } : {}),
                    targetPhone: targetPhone,
                    claimed: false,
                    saleIds: selectedSaleObjects.map(s => s.id),
                    timestamp: window.fb.serverTimestamp(),
                    items: aggregatedSaleObjects.map(sale => {
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
                        Object.assign(item, this._settlementFields(selectedSaleObjects.filter(s => s.productId === sale.productId)));
                        return item;
                    })
                };

                await this._attachItemImages(logData.items, aggregatedSaleObjects, allProducts);

                // The transfer's id is made when the box opens, so tapping twice, or trying again after a slow connection, is the same transfer
                const logRef = window.fb.doc(window.fb.db, 'shared_logs', `xfer_${this.state.transferKey || (this.state.transferKey = this._newId())}`);
                const already = await window.fb.getDoc(logRef).catch(() => null);
                if (!(already && already.exists())) await window.fb.setDoc(logRef, logData); // one that is already there is never written over (it may be accepted by now)

                // Confirm the transfer really is on the server before telling the user it was sent
                const saved = await window.fb.getDoc(logRef);
                if (!saved.exists() || saved.data().targetPhone !== targetPhone) {
                    throw new Error('Transfer was not saved correctly');
                }
                this.state.transferKey = null;

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
        _makeThumbnail(blob, maxSide, quality) {
            return new Promise((resolve) => {
                const url = URL.createObjectURL(blob);
                const img = new Image();
                const finish = (value) => { URL.revokeObjectURL(url); resolve(value); };
                img.onload = () => {
                    try {
                        const side = Math.min(img.naturalWidth, img.naturalHeight);
                        if (!side) { finish(null); return; }
                        const size = Math.min(maxSide || this.THUMB_SIZE, side);
                        const canvas = document.createElement('canvas');
                        canvas.width = canvas.height = size;
                        canvas.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
                        finish(canvas.toDataURL('image/jpeg', quality || 0.55));
                    } catch (e) { finish(null); }
                };
                img.onerror = () => finish(null);
                img.src = url;
            });
        },

        // The picture that is saved online with a product: small enough to cost almost nothing, clear enough to know the product by
        async _productThumb(blob) {
            let thumb = await this._makeThumbnail(blob, 240, 0.68);
            if (thumb && thumb.length > 45000) thumb = await this._makeThumbnail(blob, 200, 0.55);
            return thumb && thumb.length <= 60000 ? thumb : null;
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

        async handleLogShared(logId, targetPhone) {
            this._nudgeAct('transfer');
            this.hideModal();
            const allSales = await DB.getAllSales();
            const updates = [];

            for (const saleId of this.state.selectedSales) {
                const saleToUpdate = allSales.find(s => s.id === saleId);
                if (saleToUpdate) {
                    saleToUpdate.pendingTransfer = { logId, to: targetPhone }; // latest transfer
                    const earlier = saleToUpdate.pendingTransfers || [];
                    saleToUpdate.pendingTransfers = earlier.some(t => t.logId === logId) ? earlier : [...earlier, { logId, to: targetPhone }]; // (the same transfer is never listed twice)
                    updates.push(DB.updateSale(saleToUpdate, ['pendingTransfer', 'pendingTransfers']));
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
                return DB.updateSale(sale, ['sharedAsLog', 'transferredTo']);
            }));

            await this.updateDashboard();
            if (this.state.currentView === 'all-sales-view') await this.renderAllSales();
            // The celebration is for whoever recorded the sale
            if (!affected.some(sale => !sale.recordedBy || sale.recordedBy === this.state.user.phone)) return;

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
            let outcome = 'ok';
            try {
                await window.fb.runTransaction(window.fb.db, async (tx) => {
                    const logSnap = await tx.get(logRef);
                    if (!logSnap.exists()) throw taken();
                    const current = logSnap.data();
                    outcome = 'ok'; // (this part can run again if two phones clash)
                    if (current.claimed && current.claimedBy === me) { outcome = current.appliedAt ? 'applied' : 'resume'; return; } // mine from an earlier try
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
                return outcome;
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
                    `<div class="rc-calc">${this.formatNumber(item.quantity)} ${this._esc(unit)} &times; ${money(item.price)}</div>${sub}` +
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
            return this._once('accept', () => this._acceptLog());
        },

        async _acceptLog() {
            if (!this.state.scannedLogData) return;

            const isSalesperson = this.state.user.type === 'Salesperson';
            const isRetailerReceiving = this.state.user.type === 'Retailer';
            const log = this.state.scannedLogData;
            const supplierId = log.senderId;

            // The new products must fit in the list before the transfer is claimed
            {
                const current = await DB.getAllProducts();
                const added = this._countNewProducts(log.items, current);
                if (current.length + added > LIMITS.maxProducts) {
                    const room = Math.max(0, LIMITS.maxProducts - current.length);
                    say(`This transfer brings ${added} new ${added === 1 ? 'product' : 'products'} and you have room for ${room} more (the limit is ${LIMITS.maxProducts}). Delete products you no longer sell, then accept it again.`, 'Product limit');
                    return;
                }
            }

            // Added already (this phone remembers it): nothing more to do
            const addedBefore = async () => { this.hideModal(); this.state.scannedLogData = null; say('These items are already in your products.', 'Already added'); };
            if (log.id && await DB.getMeta('applied:' + log.id)) { await addedBefore(); return; }

            // Only the first person to accept gets the products
            this.showLoader();
            let claim;
            try { claim = await this._claimTransfer(log); } finally { this.hideLoader(); }
            if (claim === 'applied') { await addedBefore(); return; }
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
                let thumbSentHere = false; // the sender's small picture became this product's online picture

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
                        if (sentImage) { existingProduct.image = sentImage; existingProduct.thumb = this._safeImageUrl(item.image); thumbSentHere = true; }
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
                        id: this._newId(),
                        name: item.name,
                        originalName: originalName,
                        price: costPrice,
                        stock: stockToAdd,
                        unit: unitType,
                        image: this._imageUrlToBlob(item.image),
                        thumb: this._safeImageUrl(item.image) || undefined,
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
                if (existingProduct) {
                    // the stock is added to whatever it is now; the fields that changed are sent, nothing else
                    productUpdates.push(DB.saveProduct(finalProduct, { delta: stockToAdd, thumb: thumbSentHere,
                        only: ['supplierId', 'barcode', 'needsSetup', 'lockedUntilOOS', 'isSalesperson', 'originalName', 'wholesalerPrice', 'subUnitType', 'subUnitQuantity', 'thumb'] }));
                } else {
                    productUpdates.push(DB.saveProduct(finalProduct, { thumb: true }));
                }
                if (finalProduct.stockVisible !== false) {
                    updatedProductsForFirebase[finalProduct.originalName] = { stock: finalProduct.stock, unit: finalProduct.unit, isSalesperson };
                }
            }

            await Promise.all(productUpdates);
            if (log.id) { // written down so this transfer can never be added a second time, even from another phone or after logging out
                DB.setMeta('applied:' + log.id, Date.now());
                if (this.state.firebaseReady) window.fb.updateDoc(window.fb.doc(window.fb.db, 'shared_logs', log.id), { appliedAt: window.fb.serverTimestamp() }).catch(() => { /* the phone's own note still stops it */ });
            }

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
            this._nudgeAct('transfer');
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
            if (this._isSalesperson()) { this._renderSalespersonCustomers(); return; }
            if (!navigator.onLine) {
                this.elements.internetNotice.style.display = 'flex';
                this.elements.retailerStockView.innerHTML = '';
                this.elements.salespeopleView.innerHTML = '';
                return;
            }
            this.elements.internetNotice.style.display = 'none';

            const onSalespeople = this.state.stockViewFilter === 'salespeople';
            document.querySelectorAll('#stock-view-filter-tabs .filter-tab-btn').forEach(btn => {
                btn.style.display = '';
                btn.classList.toggle('active', btn.dataset.filter === this.state.stockViewFilter);
            });
            this.elements.stockViewFilterTabs.style.display = 'flex';
            this.elements.retailerStockView.style.display = onSalespeople ? 'none' : 'block';
            this.elements.salespeopleView.style.display = onSalespeople ? 'block' : 'none';
            const fab = document.getElementById('add-salesperson-fab');
            if (fab) fab.style.display = onSalespeople ? 'block' : 'none';

            if (!this.state.firebaseReady || !this.state.user.phone) {
                const errorHtml = `<p class="empty-state">Could not connect to online services.</p>`;
                this.elements.retailerStockView.innerHTML = errorHtml;
                this.elements.salespeopleView.innerHTML = errorHtml;
                return;
            }
            if (onSalespeople) this._renderSalespeople();
            else this._renderCustomers();
        },

        // A salesperson's Customers tab: who owes on the credit sales they recorded
        async _renderSalespersonCustomers() {
            this.elements.internetNotice.style.display = 'none';
            this.elements.stockViewFilterTabs.style.display = 'none';
            this.elements.retailerStockView.style.display = 'block';
            this.elements.salespeopleView.style.display = 'none';
            const fab = document.getElementById('add-salesperson-fab');
            if (fab) fab.style.display = 'none';
            if (!this.elements.retailerStockView.innerHTML.trim()) this.elements.retailerStockView.innerHTML = '<div class="spinner"></div>';
            await this._loadBusinessCustomers(); // a wholesaler's customers and their stock, as the admin sees them (read again only after 10 minutes)
            if (!this.state.user) return; // logged out while this was loading
            await this._drawCustomers();
        },

        // A wholesaler's customers (the ones who accepted their transfers): read once and kept for 10 minutes. A salesperson sees their business's.
        async _loadBusinessCustomers(force) {
            const u = this.state.user, biz = this._businessPhone();
            if (!u || !biz || !(u.type === 'Wholesaler' || (u.type === 'Salesperson' && u.businessType === 'Wholesaler'))) return;
            if (!this.state.firebaseReady || !navigator.onLine) return;
            if (!force && this.state.retailersData && Date.now() - (this.state.retailersAt || 0) < 600000) return;
            try {
                const snap = await window.fb.getDocs(window.fb.collection(window.fb.db, `retailer_stocks/${biz}/supplied_retailers`));
                const list = [];
                snap.forEach(d => list.push({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
                if (!this.state.user) return;
                this.state.retailersData = list;
                this.state.retailersAt = Date.now();
                this._saveCustomerStock(list);
            } catch (error) { console.error('Could not load customers:', error); }
        },

        // What the profile messages need to know about customers running short. Kept on the phone, so asking costs nothing.
        _custStockKey() { return `pika_custstock_${this._businessPhone()}`; },
        _saveCustomerStock(retailers) {
            try {
                const list = [];
                (retailers || []).forEach(r => {
                    const products = r.products || {};
                    if (Object.values(products).some(p => p && p.isSalesperson)) return; // (a salesperson's own stock is not a customer's)
                    const items = [];
                    Object.keys(products).forEach(name => { const p = products[name]; if (p && Number(p.stock) < 10) items.push({ name, stock: Number(p.stock) }); }); // (10: where the customer card turns red)
                    if (items.length && r.retailerName) list.push({ id: r.id, name: r.retailerName, items });
                });
                localStorage.setItem(this._custStockKey(), JSON.stringify({ at: Date.now(), list }));
            } catch (e) { /* the messages simply leave customers out */ }
        },
        _customerStock() {
            try {
                const saved = JSON.parse(localStorage.getItem(this._custStockKey()));
                if (saved && Date.now() - saved.at < 3 * 86400000) return saved.list || []; // older than 3 days: not trusted
            } catch (e) { /* none */ }
            return [];
        },
        // Opening the app (at most every 12 hours, in the background): bring that list up to date
        _refreshCustomerStock() {
            let at = 0;
            try { at = (JSON.parse(localStorage.getItem(this._custStockKey())) || {}).at || 0; } catch (e) { /* never read */ }
            if (Date.now() - at < 12 * 3600000) return;
            this._loadBusinessCustomers(true).catch(() => { /* next time */ });
        },

        _flashCustomer() {
            const t = this.state.focusCustomer;
            if (!t) return;
            this._flashCard('focusCustomer', t.sale ? `[data-credit-id="${CSS.escape(String(t.sale))}"]` : `[data-retailer-id="${CSS.escape(String(t.customer))}"]`);
        },

        _renderCustomers() {
            const view = this.elements.retailerStockView;
            if (this.state.linksListener) { this.state.linksListener(); this.state.linksListener = null; }
            if (this.state.retailerListener) { this.state.retailerListener(); this.state.retailerListener = null; }
            view.innerHTML = '<div class="spinner"></div>';
            try {
                const retailersRef = window.fb.collection(window.fb.db, `retailer_stocks/${this.state.user.phone}/supplied_retailers`);
                this.state.retailerListener = window.fb.onSnapshot(window.fb.query(retailersRef), (querySnapshot) => {
                    const retailers = [];
                    querySnapshot.forEach(doc => retailers.push({ id: doc.id, ...doc.data({ serverTimestamps: 'estimate' }) }));
                    this.state.retailersData = retailers;
                    this.state.retailersAt = Date.now();
                    this._saveCustomerStock(retailers);
                    this._drawCustomers();
                }, (error) => {
                    console.error("Error fetching retailer stocks in real-time:", error);
                    view.innerHTML = `<p class="empty-state">Error loading data.</p>`;
                });
            } catch (error) {
                console.error("Error setting up retailer stocks listener:", error);
                view.innerHTML = `<p class="empty-state">Error loading data.</p>`;
            }
        },

        // The customers: everyone who owes on a credit sale (whoever recorded it) and the customers who accepted a transfer
        async _drawCustomers() {
            const retailersData = (this.state.retailersData || []).filter(r => !Object.values(r.products || {}).some(p => p.isSalesperson));
            const allSales = await DB.getAllSales();
            if (!this.state.user) return; // logged out while this was loading
            const creditSales = allSales.filter(s => s.saleType === 'credit' && !s.creditSettled);

            if (retailersData.length === 0 && creditSales.length === 0) {
                const isRetailer = this.state.user && this.state.user.type === 'Retailer';
                this.elements.retailerStockView.innerHTML = this._isSalesperson()
                    ? '<p class="empty-state">Customers who owe you on credit show here.</p>'
                    : isRetailer
                        ? `<p class="empty-state">Make credit sales to see customers owing you here.</p>`
                        : `<p class="empty-state">Sell and transfer products to the purchasing retailer or make credit sales to see customers here.</p>`;
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
                if (!renderedCreditCustomers.has(retailer.id)) {
                    // when they first came on board (older customers fall back to their last activity)
                    const joined = (retailer.joinedAt && retailer.joinedAt.toDate && retailer.joinedAt.toDate()) ||
                        (retailer.lastUpdate && retailer.lastUpdate.toDate && retailer.lastUpdate.toDate());
                    customerCards.push({ time: joined ? joined.getTime() : 0, html: this.buildCustomerCard(retailer) });
                }
            }
            customerCards.sort((a, b) => b.time - a.time);

            this.elements.retailerStockView.innerHTML = customerCards.map(card => card.html).join('') || `<p class="empty-state">No customers added yet.</p>`;
            this.addDeleteEventListeners();
            this._flashCustomer(); // a message may have sent them to one customer
        },

        buildCustomerCard(retailer) {
            let productsHtml = '';
            if (this.state.user.type !== 'Retailer') {
                if (retailer.products && Object.keys(retailer.products).length > 0) {
                    for (const productName in retailer.products) {
                        const product = retailer.products[productName];
                        const stockClass = product.stock <= 0 ? 'out-of-stock' : (product.stock < 10 ? 'restock-now' : '');
                        productsHtml += `<div class="retailer-product-item ${stockClass}"><span>${this._esc(productName)}</span><strong>${this._esc(this.formatStockRange(product.stock, product.unit))}</strong></div>`;
                    }
                } else {
                    productsHtml = `<div class="retailer-product-item"><span>No product data available.</span></div>`;
                }
            } else {
                productsHtml = `<div class="retailer-product-item"><span>Not tracking customer stock.</span></div>`;
            }

            const phoneIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
            const callButton = retailer.retailerPhone ? `<a href="tel:${this._esc(retailer.retailerPhone)}" class="retailer-call-btn" title="Call ${this._esc(retailer.retailerName)}">${phoneIcon}</a>` : '';
            const deleteIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
            const status = this.formatTimeAgo(retailer.lastUpdate?.toDate());
            const where = retailer.retailerLocation ? `${this._esc(retailer.retailerLocation)} &middot; ` : '';

            // Laid out like the credit card: who, a tag for what the card is, their details, one action
            return `
                <div class="card stock-card" data-retailer-id="${this._esc(retailer.id)}" data-retailer-name="${this._esc(retailer.retailerName)}">
                    <div class="credit-top">
                        <div class="credit-who">
                            <h4><span class="credit-name">${this._esc(retailer.retailerName)}</span><span class="credit-pill stock-pill">Stock</span></h4>
                            <p class="credit-when">${where}<span class="retailer-status ${status.className}">${this._esc(status.text)}</span></p>
                        </div>
                        ${callButton}
                    </div>
                    <div class="credit-stock">${productsHtml}</div>
                    ${this._isSalesperson() ? '' : `<button type="button" class="delete-retailer-btn">${deleteIcon}<span>Remove from list</span></button>`}
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
            const byName = (sale.recordedBy && sale.recordedBy !== this.state.user.phone) ? (sale.recordedByName || 'a salesperson') : '';

            return `
                <div class="card credit-card" data-credit-id="${sale.id}" data-customer-name="${e(sale.customerName)}"${retailer ? ` data-retailer-id="${e(retailer.id)}"` : ''}>
                    <div class="credit-top">
                        <div class="credit-who">
                            <h4><span class="credit-name">${e(sale.customerName)}</span><span class="credit-pill">Credit</span></h4>
                            <p class="credit-when">${this.formatCreditDate(sale.timestamp)}</p>
                            ${byName ? `<p class="credit-by">Recorded by ${e(byName)}</p>` : ''}
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
                    if (this._isSalesperson()) { say('Only your admin can mark a credit as fully repaid.', 'Admin only'); return; }
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
                        await DB.updateSale(sale, ['creditSettled', 'creditSettledAt']);
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
                this.elements.profileBusiness.textContent = this._isSalesperson() ? (this.state.user.businessName || '') : this.state.user.business;
                this.elements.profileLocation.textContent = this.state.user.location;
                this.elements.profilePhone.textContent = this.state.user.phone || this.state.user.phone; // Handle both cases
                this.elements.profileRole.textContent = this.state.user.type;
                this.elements.profileAccountName.textContent = this.state.user.name;
                this._setAccountOpen(false); // the account details start folded away every time

                await this.updateScanTracker();
                await this._renderNudge();

                this.showModal('profile-modal');
            }
        },

        // Unfolds or folds the account details (Name ... Type, and Logout) in the profile
        _setAccountOpen(open) {
            this.elements.profileAccount.classList.toggle('open', open);
            this.elements.profileModal.classList.toggle('account-open', open);
            this.elements.profileAccountToggle.setAttribute('aria-expanded', String(open));
            this.elements.profileAccountPanel.inert = !open; // (folded away: its buttons cannot be reached)
            if (open) setTimeout(() => this.elements.profileAccount.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 320); // (on a short screen, bring the whole section into view)
        },

        async updateScanTracker() {
            const count = await DB.getScanCountForToday();
            this.elements.scanCount.textContent = count;

            const progress = Math.min((count / 100) * 100, 100);
            this.elements.scanProgress.style.width = `${progress}%`;

        },

        // --- The message in the Profile card (the words and rules live in nudges.js) ---
        _nudgeKey() { return `pika_nudge_${this.state.user.phone}`; },

        _nudgeLoad() {
            try {
                const saved = JSON.parse(localStorage.getItem(this._nudgeKey()));
                if (saved && saved.v === 1) { saved.acts = saved.acts || { receipt: [], transfer: [] }; saved.recent = saved.recent || []; return saved; }
            } catch (e) { /* a fresh start */ }
            const seed = (window.crypto && crypto.getRandomValues) ? crypto.getRandomValues(new Uint32Array(1))[0] : Math.floor(Math.random() * 4294967296);
            return PikaNudges.newState(seed); // everyone's run of messages starts from their own seed
        },

        _nudgeSave(state) {
            try { localStorage.setItem(this._nudgeKey(), JSON.stringify(state)); } catch (e) { /* it simply starts over next time */ }
        },

        // One job at a time, so quick actions (a scan and a sale together) never overwrite each other
        _nudgeRun(job) {
            this._nudgeChain = (this._nudgeChain || Promise.resolve()).then(job).catch((e) => { console.error('Profile message:', e); });
            return this._nudgeChain;
        },

        async _nudgeContext(state) {
            const user = this.state.user;
            const now = new Date();
            const [sales, products] = await Promise.all([DB.getAllSales(), DB.getAllProducts()]);
            const lowLevel = this._lowStockLevel();
            PikaNudges.trackStock(state, products, lowLevel, now); // writes down how long products have been low or out
            return PikaNudges.buildContext({ sales, products, user, now, lowLevel, acts: state.acts, lowSince: state.lowSince, role: user.type, customers: this._customerStock(), canTransfer: user.type === 'Wholesaler', canFund: user.type !== 'Salesperson' });
        },

        // A message that has not been read: the menu button's lines ripple for 30 seconds and it keeps a dot until the profile is opened
        _nudgeShake() {
            clearTimeout(this._shakeTimer);
            const menu = this.elements.menuBtn;
            if (!menu) return;
            let freshAt = 0;
            try { if (this.state.user) freshAt = Number(this._nudgeLoad().freshAt) || 0; } catch (e) { /* no dot */ }
            const left = freshAt + 30000 - Date.now();
            const live = left > 0 && left <= 30000;
            const unread = freshAt > 0;
            menu.classList.toggle('has-nudge', unread);
            menu.classList.toggle('nudge-live', live);
            menu.setAttribute('aria-label', unread ? 'Menu, you have a new message' : 'Menu');
            if (live) this._shakeTimer = setTimeout(() => menu.classList.remove('nudge-live'), left);
        },

        // A new message has arrived by itself: the menu button gets its dot and ripple, and a soft double beep plays:
        // a clear one for messages worth stopping for (`loud`), a very quiet one for all the others
        _nudgeAlert(loud) {
            this._nudgeShake();
            this._nudgeChime(!!loud);
        },

        // Two kinds of double beep, both kept within limits so they never become a nuisance. It waits until the person is out of the scanner,
        // and a beep that did not play (see below) is not counted.
        //   important (money owed, stock, a win): louder, at most 4 a day, at least 15 minutes after the last important one
        //   all the others: very quiet, at most 6 a day, at least 10 minutes after the last beep of any kind
        _nudgeChime(loud) {
            if (!this.state.user) return;
            if (this.state.currentView === 'camera-view') { if (loud || !this._chimeWaiting) this._chimeWaiting = loud ? 'loud' : 'quiet'; return; } // not over the scanner's own beeps: it plays once they are back home
            const key = `pika_chime_${this.state.user.phone}`, today = PikaNudges.todayIndex(), now = Date.now();
            let rec = {};
            try { rec = JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { rec = {}; }
            if (rec.day !== today) rec = { day: today, n: 0, q: 0, at: rec.at || 0, last: rec.last || rec.at || 0 };
            if (loud ? (rec.n || 0) >= 4 || now - (rec.at || 0) < 15 * 60000 : (rec.q || 0) >= 6 || now - (rec.last || rec.at || 0) < 10 * 60000) return;
            if (!this._playNudgeChime(loud)) return;
            if (loud) { rec.n = (rec.n || 0) + 1; rec.at = now; } else rec.q = (rec.q || 0) + 1;
            rec.last = now;
            try { localStorage.setItem(key, JSON.stringify(rec)); } catch (e) { /* the limits just start again */ }
        },

        // Warm, calm and a little excited: two soft notes going up (D5 then A5), each with a quiet octave above for sparkle.
        // The important one is about 5 times louder than the other (14 dB). Says whether it played.
        _playNudgeChime(loud) {
            const ctx = this._getAudioCtx();
            if (!ctx || ctx.state !== 'running') return false; // the phone has not been touched since the app opened (browsers do not allow sound before a tap): stay quiet rather than beep out of the blue later
            const v = loud ? { a: 0.18, b: 0.2, sa: 0.03, sb: 0.032 } : { a: 0.035, b: 0.04, sa: 0.006, sb: 0.007 };
            this._playNotes([
                { freq: 587.33, start: 0, dur: 0.24, vol: v.a, release: 0.16 },
                { freq: 1174.66, start: 0, dur: 0.24, vol: v.sa, release: 0.16 },
                { freq: 880, start: 0.2, dur: 0.5, vol: v.b, release: 0.36 },
                { freq: 1760, start: 0.2, dur: 0.5, vol: v.sb, release: 0.36 }
            ]);
            return true;
        },

        // A tap on the message goes where it points: money for stock opens WhatsApp, a customer opens their card, a product opens its tab
        _nudgeTap() {
            const go = this._nudgeGo, arg = this._nudgeArg;
            if (go === 'funding') {
                window.open(`https://wa.me/${this.WA_NUMBER}?text=${encodeURIComponent("I'm a PikaShot top seller and need money for stock.")}`, '_blank', 'noopener');
            } else if (go === 'customers') {
                this.hideModal();
                this.state.focusCustomer = arg ? Object.assign({ until: Date.now() + 15000 }, arg) : null;
                this.state.stockViewFilter = 'customers';
                this.navigateTo('stock-levels-view');
            } else if (go === 'product' && arg) {
                this.hideModal();
                this.state.focusProduct = { id: arg.id, until: Date.now() + 15000 };
                this.state.openProductsOn = arg.tab;
                this.navigateTo('products-view');
            }
        },

        // One more thing done: a sale, a scan, a transfer, a receipt shared or printed. Every 5 of them (in any mix) bring a new message.
        _nudgeAct(kind) {
            return this._nudgeRun(async () => {
                if (!this.state.user || !window.PikaNudges) return;
                const state = this._nudgeLoad();
                PikaNudges.act(state, kind, new Date());
                let arrived = false, loud = false;
                if (kind === 'sale' && !state.welcomed) { // the very first sale gets a welcome, straight away
                    const total = await DB.countSales();
                    if (total === 1) { PikaNudges.welcome(state, null); arrived = true; loud = true; }
                    else if (total > 1) state.welcomed = true; // an account that was selling long before this existed
                }
                if (!arrived && state.actions >= PikaNudges.EVERY) { // the 5th action: the next message comes up now
                    loud = !!PikaNudges.show(state, await this._nudgeContext(state)).chime;
                    arrived = true;
                }
                if (arrived) state.freshAt = Date.now();
                this._nudgeSave(state);
                if (arrived) this._nudgeAlert(loud);
            });
        },

        // The app opened (or came back) after a day or more without a sale: a kind nudge, once a day
        _nudgeOnOpen() {
            return this._nudgeRun(async () => {
                if (!this.state.user || !window.PikaNudges || this._isWaiting()) return;
                const state = this._nudgeLoad();
                if (state.openDay === PikaNudges.todayIndex()) { this._nudgeShake(); return; } // (a message that arrived a moment ago may still be shaking)
                const ctx = await this._nudgeContext(state);
                const arrived = PikaNudges.onOpen(state, ctx);
                if (arrived) state.freshAt = Date.now();
                this._nudgeSave(state);
                if (arrived) this._nudgeAlert(PikaNudges.chimes(state.id)); else this._nudgeShake();
            });
        },

        _renderNudge() {
            return this._nudgeRun(async () => {
                const el = this.elements.scanReward;
                let view = { text: 'Every sale counts toward your airtime benefits. 🎁', go: null };
                try {
                    if (this.state.user && window.PikaNudges) {
                        const state = this._nudgeLoad();
                        const ctx = await this._nudgeContext(state);
                        view = PikaNudges.show(state, ctx);
                        state.freshAt = 0; // it has been seen: the capsule stops shaking
                        this._nudgeSave(state);
                    }
                } catch (e) { console.error('Could not choose the profile message:', e); }
                el.textContent = view.text.replace(/ ([^ ]*)$/, '\u00A0$1').replace(/ ([^ ]*\u00A0[^ ]*)$/, '\u00A0$1'); // the last words stay with the emoji, so it never sits alone on a second line
                el.classList.toggle('is-link', !!view.go);
                this._nudgeGo = view.go || null;
                this._nudgeArg = view.arg || null;
                el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; // plays the little entrance
                this._nudgeShake();
            });
        },
    };

    App.init();
});
