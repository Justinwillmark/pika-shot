document.addEventListener('DOMContentLoaded', () => {
    const ui = {
        loadingSpinner: document.getElementById('loading-spinner'),
        appContainer: document.getElementById('app-container'),
        pages: document.querySelectorAll('.page'),
        navButtons: document.querySelectorAll('.nav-btn'),
        headerTitle: document.getElementById('header-title'),
        installPwaBtn: document.getElementById('install-pwa-btn'),

        // Onboarding
        onboardingPage: document.getElementById('onboarding-page'),
        onboardingForm: document.getElementById('onboarding-form'),
        permissionPage: document.getElementById('permission-page'),
        grantPermissionBtn: document.getElementById('grant-permission-btn'),
        mainApp: document.getElementById('main-app'),

        // Home / Dashboard
        welcomeMessage: document.getElementById('welcome-message'),
        businessNameDisplay: document.getElementById('business-name-display'),
        totalSales: document.getElementById('total-sales'),
        itemsSold: document.getElementById('items-sold'),
        productsInStock: document.getElementById('products-in-stock'),
        sellItemBtn: document.getElementById('sell-item-btn'),
        
        // Products
        addProductFooterBtn: document.getElementById('add-product-footer-btn'),
        productGrid: document.getElementById('product-grid'),
        emptyProductsMessage: document.getElementById('empty-products-message'),

        // Camera
        cameraView: document.getElementById('camera-view'),
        cameraStatusText: document.getElementById('camera-status-text'),
        cancelCameraBtn: document.getElementById('cancel-camera-btn'),

        // Modals
        modalBackdrop: document.getElementById('modal-backdrop'),
        confirmImageModal: document.getElementById('confirm-image-modal'),
        capturedImagePreview: document.getElementById('captured-image-preview'),
        retakePhotoBtn: document.getElementById('retake-photo-btn'),
        confirmPhotoBtn: document.getElementById('confirm-photo-btn'),
        
        productFormModal: document.getElementById('product-form-modal'),
        productModalTitle: document.getElementById('product-modal-title'),
        productForm: document.getElementById('product-form'),
        productFormImage: document.getElementById('product-form-image'),
        productIdInput: document.getElementById('product-id'),
        productNameInput: document.getElementById('product-name'),
        productPriceInput: document.getElementById('product-price'),
        productStockInput: document.getElementById('product-stock'),
        productUnitInput: document.getElementById('product-unit'),
        cancelProductFormBtn: document.getElementById('cancel-product-form-btn'),

        salesModal: document.getElementById('sales-modal'),
        salesProductImage: document.getElementById('sales-product-image'),
        salesProductName: document.getElementById('sales-product-name'),
        salesProductPrice: document.getElementById('sales-product-price'),
        salesQuantityInput: document.getElementById('sales-quantity'),
        decreaseQtyBtn: document.getElementById('decrease-qty'),
        increaseQtyBtn: document.getElementById('increase-qty'),
        salesTotalPrice: document.getElementById('sales-total-price'),
        cancelSaleBtn: document.getElementById('cancel-sale-btn'),
        confirmSaleBtn: document.getElementById('confirm-sale-btn'),

        // Toast & Communal
        toast: document.getElementById('toast-notification'),
        toastMessage: document.getElementById('toast-message'),
        toastActionBtn: document.getElementById('toast-action-btn'),
        communalModal: document.getElementById('communal-modal'),
        declineCommunalBtn: document.getElementById('decline-communal-btn'),
        acceptCommunalBtn: document.getElementById('accept-communal-btn'),
    };

    let appState = {
        currentUser: null,
        capturedBlob: null,
        currentProductForSale: null,
        deferredInstallPrompt: null,
        currentScanningMode: null, // 'add' or 'sell'
    };

    // --- INITIALIZATION ---

    async function init() {
        try {
            await db.init();
            await camera.init();
            
            appState.currentUser = await db.getUser();

            if (!appState.currentUser) {
                showPage('onboarding-page');
            } else {
                const cameraPermission = await checkCameraPermission();
                if (cameraPermission !== 'granted') {
                    showPage('permission-page');
                } else {
                    showPage('main-app');
                    await loadDashboard();
                    await loadProducts();
                    startCommunalSimulation();
                }
            }
        } catch (error) {
            console.error("Initialization failed:", error);
            alert("App could not start. Please refresh.");
        } finally {
            ui.loadingSpinner.classList.add('hidden');
            ui.appContainer.classList.add('visible');
        }
    }

    // --- PAGE & MODAL MANAGEMENT ---

    function showPage(pageId) {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        
        if (pageId === 'main-app') {
            ui.onboardingPage.classList.add('hidden');
            ui.permissionPage.classList.add('hidden');
            ui.mainApp.classList.remove('hidden');
            navigateTo('home-page');
        } else {
            ui.mainApp.classList.add('hidden');
            ui.onboardingPage.classList.toggle('hidden', pageId !== 'onboarding-page');
            ui.permissionPage.classList.toggle('hidden', pageId !== 'permission-page');
        }
    }

    function navigateTo(pageId) {
        ui.pages.forEach(page => page.classList.add('hidden'));
        document.getElementById(pageId).classList.remove('hidden');

        const pageName = pageId.split('-')[0];
        ui.headerTitle.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1);
        
        ui.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageId);
        });
    }

    function showModal(modal) {
        ui.modalBackdrop.classList.remove('hidden');
        modal.classList.remove('hidden');
    }

    function hideAllModals() {
        ui.modalBackdrop.classList.add('hidden');
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    }

    function showToast(message, actionText = null, actionCallback = null, duration = 4000) {
        ui.toastMessage.textContent = message;
        if (actionText && actionCallback) {
            ui.toastActionBtn.textContent = actionText;
            ui.toastActionBtn.onclick = () => {
                actionCallback();
                hideToast();
            };
            ui.toastActionBtn.classList.remove('hidden');
        } else {
            ui.toastActionBtn.classList.add('hidden');
        }
        ui.toast.classList.add('show');
        setTimeout(hideToast, duration);
    }
    
    function hideToast() {
        ui.toast.classList.remove('show');
    }

    // --- ONBOARDING & PERMISSIONS ---
    
    ui.onboardingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userName = document.getElementById('user-name').value;
        const businessName = document.getElementById('business-name').value;
        appState.currentUser = { name: userName, business: businessName };
        await db.saveUser(appState.currentUser);
        showPage('permission-page');
    });

    ui.grantPermissionBtn.addEventListener('click', async () => {
        const stream = await camera.requestPermission();
        if (stream) {
            stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
            showPage('main-app');
            await loadDashboard();
            await loadProducts();
            startCommunalSimulation();
        } else {
            alert("Camera access is required to use this app.");
        }
    });

    async function checkCameraPermission() {
        try {
            const result = await navigator.permissions.query({ name: 'camera' });
            return result.state; // 'granted', 'prompt', or 'denied'
        } catch (e) {
            return 'prompt'; // Fallback for browsers that don't support query
        }
    }


    // --- DATA LOADING & RENDERING ---

    async function loadDashboard() {
        ui.welcomeMessage.textContent = `Welcome, ${appState.currentUser.name}!`;
        ui.businessNameDisplay.textContent = appState.currentUser.business;
        const stats = await db.getDashboardStats();
        ui.totalSales.textContent = `₦${stats.totalSales.toFixed(2)}`;
        ui.itemsSold.textContent = stats.itemsSold;
        ui.productsInStock.textContent = stats.productsInStock;
    }

    async function loadProducts() {
        const products = await db.getAllProducts();
        ui.productGrid.innerHTML = '';
        if (products.length === 0) {
            ui.emptyProductsMessage.classList.remove('hidden');
        } else {
            ui.emptyProductsMessage.classList.add('hidden');
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${product.imageDataUrl}" class="product-card-img" alt="${product.name}">
                    <div class="product-card-info">
                        <h4>${product.name}</h4>
                        <p class="price">₦${product.price}</p>
                        <p class="stock">${product.stock} ${product.unit} left</p>
                    </div>
                    <div class="product-card-actions">
                        <button class="edit-btn" data-id="${product.id}">Edit</button>
                    </div>
                `;
                ui.productGrid.appendChild(card);
            });
        }
    }
    
    // --- EVENT LISTENERS ---

    ui.navButtons.forEach(btn => {
        if (!btn.id.includes('main')) {
            btn.addEventListener('click', () => navigateTo(btn.dataset.page));
        }
    });

    // Add Product Flow
    ui.addProductFooterBtn.addEventListener('click', startAddProductFlow);

    async function startAddProductFlow(preCapturedBlob = null) {
        hideAllModals();
        appState.currentScanningMode = 'add';
        ui.cameraStatusText.textContent = "Hold steady to capture product...";
        ui.cameraView.classList.remove('hidden');

        if (preCapturedBlob) {
            // This is from the "product not found" flow
            appState.capturedBlob = preCapturedBlob;
            const imageUrl = URL.createObjectURL(appState.capturedBlob);
            ui.capturedImagePreview.src = imageUrl;
            ui.cameraView.classList.add('hidden');
            showModal(ui.confirmImageModal);
        } else {
            try {
                const blob = await camera.captureImageWithAutoCapture();
                appState.capturedBlob = blob;
                const imageUrl = URL.createObjectURL(appState.capturedBlob);
                ui.capturedImagePreview.src = imageUrl;
                ui.cameraView.classList.add('hidden');
                showModal(ui.confirmImageModal);
            } catch (error) {
                console.error("Error capturing image:", error);
                ui.cameraView.classList.add('hidden');
                showToast("Could not capture image. Please try again.");
            }
        }
    }

    ui.cancelCameraBtn.addEventListener('click', () => {
        camera.stop();
        ui.cameraView.classList.add('hidden');
    });

    ui.retakePhotoBtn.addEventListener('click', () => {
        hideAllModals();
        startAddProductFlow();
    });

    ui.confirmPhotoBtn.addEventListener('click', () => {
        hideAllModals();
        ui.productModalTitle.textContent = 'Add New Product';
        ui.productForm.reset();
        ui.productIdInput.value = '';
        ui.productFormImage.src = ui.capturedImagePreview.src;
        showModal(ui.productFormModal);
    });

    ui.cancelProductFormBtn.addEventListener('click', hideAllModals);

    ui.productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = ui.productIdInput.value ? parseInt(ui.productIdInput.value) : null;
        
        const productData = {
            name: ui.productNameInput.value,
            price: parseFloat(ui.productPriceInput.value),
            stock: parseInt(ui.productStockInput.value),
            unit: ui.productUnitInput.value,
        };

        try {
            if (id) { // Editing existing product
                await db.updateProduct({ id, ...productData });
                showToast("Product updated successfully!");
            } else { // Adding new product
                productData.imageDataUrl = ui.productFormImage.src;
                productData.embedding = await camera.getEmbedding(appState.capturedBlob);
                await db.saveProduct(productData);
                showToast("Product added successfully!");
            }
        } catch(err) {
            console.error("Failed to save product:", err);
            showToast("Error saving product.", null, null, 5000);
        }
        
        hideAllModals();
        await loadProducts();
        await loadDashboard();
    });

    // Edit Product Flow
    ui.productGrid.addEventListener('click', async (e) => {
        if (e.target.classList.contains('edit-btn')) {
            const id = parseInt(e.target.dataset.id);
            const product = await db.getProduct(id);
            
            ui.productModalTitle.textContent = 'Edit Product';
            ui.productIdInput.value = product.id;
            ui.productNameInput.value = product.name;
            ui.productPriceInput.value = product.price;
            ui.productStockInput.value = product.stock;
            ui.productUnitInput.value = product.unit;
            ui.productFormImage.src = product.imageDataUrl;
            
            showModal(ui.productFormModal);
        }
    });

    // Sell Item Flow
    ui.sellItemBtn.addEventListener('click', startSellItemFlow);

    function startSellItemFlow() {
        appState.currentScanningMode = 'sell';
        ui.cameraStatusText.textContent = "Scanning for products...";
        ui.cameraView.classList.remove('hidden');
        camera.startScanning(onProductFound, onProductNotFound);
    }
    
    function onProductFound(product) {
        camera.stop();
        ui.cameraView.classList.add('hidden');
        appState.currentProductForSale = product;
        
        ui.salesProductImage.src = product.imageDataUrl;
        ui.salesProductName.textContent = product.name;
        ui.salesProductPrice.textContent = product.price.toFixed(2);
        ui.salesQuantityInput.value = 1;
        updateSalesTotal();

        showModal(ui.salesModal);
    }
    
    function onProductNotFound(lastFrameBlob) {
        camera.stop();
        ui.cameraView.classList.add('hidden');
        showToast("Product not found. Let's add it!", "Add Now", () => {
            startAddProductFlow(lastFrameBlob);
        }, 6000);
    }
    
    // Sales Modal Logic
    function updateSalesTotal() {
        const quantity = parseInt(ui.salesQuantityInput.value) || 0;
        const price = appState.currentProductForSale ? appState.currentProductForSale.price : 0;
        const total = quantity * price;
        ui.salesTotalPrice.textContent = `₦${total.toFixed(2)}`;
    }

    ui.decreaseQtyBtn.addEventListener('click', () => {
        let qty = parseInt(ui.salesQuantityInput.value);
        if (qty > 1) {
            ui.salesQuantityInput.value = qty - 1;
            updateSalesTotal();
        }
    });

    ui.increaseQtyBtn.addEventListener('click', () => {
        let qty = parseInt(ui.salesQuantityInput.value);
        if (qty < appState.currentProductForSale.stock) {
            ui.salesQuantityInput.value = qty + 1;
            updateSalesTotal();
        } else {
            showToast(`Only ${appState.currentProductForSale.stock} in stock!`);
        }
    });
    
    ui.salesQuantityInput.addEventListener('input', updateSalesTotal);
    
    ui.cancelSaleBtn.addEventListener('click', hideAllModals);

    ui.confirmSaleBtn.addEventListener('click', async () => {
        const product = appState.currentProductForSale;
        const quantitySold = parseInt(ui.salesQuantityInput.value);

        if (quantitySold > 0 && quantitySold <= product.stock) {
            product.stock -= quantitySold;
            await db.updateProduct(product);
            await db.saveSale({
                productId: product.id,
                quantity: quantitySold,
                totalPrice: product.price * quantitySold,
                date: new Date()
            });

            hideAllModals();
            showToast("Sale recorded successfully!");
            await loadDashboard();
            if(document.getElementById('products-page').offsetParent !== null) {
                await loadProducts(); // Reload products only if the page is visible
            }
        } else if (quantitySold > product.stock) {
            showToast(`Not enough stock. Only ${product.stock} available.`);
        }
    });

    // --- PWA INSTALL ---
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        appState.deferredInstallPrompt = e;
        ui.installPwaBtn.classList.remove('hidden');
    });

    ui.installPwaBtn.addEventListener('click', () => {
        ui.installPwaBtn.classList.add('hidden');
        appState.deferredInstallPrompt.prompt();
        appState.deferredInstallPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
            }
            appState.deferredInstallPrompt = null;
        });
    });

    // --- COMMUNAL SIMULATION ---
    function startCommunalSimulation() {
        setTimeout(() => {
            showToast("Incoming Purchase from Tolu!", "View Items", () => {
                hideAllModals(); // ensure no other modals are open
                showModal(ui.communalModal);
            });
        }, 15000); // 15 seconds
    }

    ui.acceptCommunalBtn.addEventListener('click', () => {
        hideAllModals();
        showToast("Purchase from Tolu accepted.", null, null, 3000);
    });
    ui.declineCommunalBtn.addEventListener('click', () => {
        hideAllModals();
        showToast("Purchase from Tolu declined.", null, null, 3000);
    });

    init();
});