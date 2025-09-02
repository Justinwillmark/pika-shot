document.addEventListener('DOMContentLoaded', () => {
    const App = {
        state: {
            currentUser: null,
            currentView: 'loader',
            previousView: null,
            products: [],
            sales: [],
            isLoading: true,
            deferredInstallPrompt: null,
            scanContext: null, // 'add' or 'sell'
            scanInterval: null,
        },

        elements: {
            loader: document.getElementById('loader'),
            appContainer: document.getElementById('app-container'),
            views: {
                onboarding: document.getElementById('onboarding-view'),
                permission: document.getElementById('permission-view'),
                home: document.getElementById('home-view'),
                products: document.getElementById('products-view'),
                camera: document.getElementById('camera-view'),
            },
            nav: document.getElementById('bottom-nav'),
            modalContainer: document.getElementById('modal-container'),
            toast: document.getElementById('toast-notification'),
            camera: {
                view: document.getElementById('camera-view'),
                video: document.getElementById('camera-feed'),
                canvas: document.getElementById('capture-canvas'),
                status: document.getElementById('camera-status'),
                scanBox: document.getElementById('scan-box'),
                cancelBtn: document.getElementById('cancel-camera-btn'),
            }
        },

        async init() {
            this.showLoader('Warming up the engine...');
            this.registerServiceWorker();
            this.renderNav();
            this.addCoreEventListeners();
            feather.replace(); // Initialize Feather Icons

            try {
                await DB.init();
                await Camera.init();
                this.state.currentUser = await DB.getData('user', 'main_user');
                
                if (this.state.currentUser) {
                    await this.loadAppData();
                    this.navigateTo('home');
                } else {
                    this.navigateTo('onboarding');
                }
            } catch (error) {
                this.showToast('Initialization failed. Please refresh.', 'error');
                console.error("Initialization error:", error);
            } finally {
                this.hideLoader();
            }
        },
        
        async loadAppData() {
            this.state.products = await DB.getAllData('products');
            this.state.sales = await DB.getAllData('sales');
        },

        renderNav() {
            this.elements.nav.innerHTML = `
                <button class="nav-btn" data-view="home">
                    <i data-feather="home"></i>
                </button>
                <button class="nav-btn" data-view="products">
                    <i data-feather="archive"></i>
                </button>
                <button id="scan-to-sell-btn" class="nav-btn nav-btn-main">
                    <i data-feather="dollar-sign"></i>
                </button>
                <button class="nav-btn" data-view="reports" disabled>
                    <i data-feather="bar-chart-2"></i>
                </button>
                <button class="nav-btn" data-view="settings" disabled>
                    <i data-feather="settings"></i>
                </button>`;
            feather.replace();
        },

        navigateTo(viewName) {
            if (this.state.currentView === viewName) return;

            // Don't set previous view if coming from camera
            if(this.state.currentView !== 'camera' && this.state.currentView !== 'loader'){
                 this.state.previousView = this.state.currentView;
            }

            Object.values(this.elements.views).forEach(v => v.classList.remove('active'));
            if (this.elements.views[viewName]) {
                this.elements.views[viewName].classList.add('active');
                this.state.currentView = viewName;
                this.updateNav();
                
                const renderMethod = `render${viewName.charAt(0).toUpperCase() + viewName.slice(1)}View`;
                if (typeof this[renderMethod] === 'function') {
                    this[renderMethod]();
                }
            }
        },
        
        navigateBack() {
            const targetView = this.state.previousView || 'home';
            this.navigateTo(targetView);
        },

        updateNav() {
            this.elements.nav.querySelectorAll('.nav-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === this.state.currentView);
            });
        },

        renderOnboardingView() {
            this.elements.views.onboarding.innerHTML = `
                <div class="welcome-card">
                    <div class="logo">⚡️ pika shot</div>
                    <h1>Simplify Your Sales</h1>
                    <p>The fastest way for informal retailers to track sales and inventory. Works offline.</p>
                    <form id="onboarding-form">
                        <input type="text" id="user-name" placeholder="Your Name" required>
                        <input type="text" id="business-name" placeholder="Business Name" required>
                        <button type="submit" class="btn btn-primary">Get Started</button>
                    </form>
                </div>`;
            document.getElementById('onboarding-form').addEventListener('submit', (e) => this.handleOnboarding(e));
        },
        
        renderPermissionView() {
            this.elements.views.permission.innerHTML = `
                <div class="welcome-card">
                    <i data-feather="camera" style="width: 64px; height: 64px; color: var(--primary-color); margin-bottom: 24px;"></i>
                    <h1>Camera Access Required</h1>
                    <p>pika shot uses your camera to scan products instantly. Please grant access to continue.</p>
                    <button id="grant-permission-btn" class="btn btn-primary">Grant Access</button>
                </div>`;
            feather.replace();
            document.getElementById('grant-permission-btn').addEventListener('click', () => this.requestCameraPermission());
        },

        renderHomeView() {
            const totalSales = this.state.sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
            const itemsSold = this.state.sales.reduce((sum, sale) => sum + sale.quantity, 0);
            const recentSales = this.state.sales.slice(-5).reverse();
            
            this.elements.views.home.innerHTML = `
                <header class="app-header">
                    <div class="header-action">
                        <div>
                            <h1>Hello, ${this.state.currentUser.name.split(' ')[0]}!</h1>
                            <p>Here's your summary today.</p>
                        </div>
                        <button id="install-btn" class="add-homescreen-btn" ${this.state.deferredInstallPrompt ? '' : 'hidden'}>Add to Homescreen</button>
                    </div>
                </header>
                <div class="stat-grid">
                    <div class="stat-card">
                        <h3>Total Sales (₦)</h3>
                        <p>${totalSales.toLocaleString()}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Items Sold</h3>
                        <p>${itemsSold}</p>
                    </div>
                </div>
                <div>
                    <h2 class="section-title">Recent Sales</h2>
                    <div class="recent-sales-list">
                        ${recentSales.length > 0 ? recentSales.map(sale => this.createSaleItemHTML(sale)).join('') : '<p>No sales recorded yet.</p>'}
                    </div>
                </div>`;
            document.getElementById('install-btn')?.addEventListener('click', () => this.promptInstall());
        },

        createSaleItemHTML(sale) {
            const product = this.state.products.find(p => p.id === sale.productId);
            if (!product) return '';
            return `
                <div class="sale-item">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    <div class="sale-info">
                        <div class="product-name">${product.name}</div>
                        <div class="sale-details">${sale.quantity} x ₦${product.price.toLocaleString()}</div>
                    </div>
                    <div class="sale-price">+ ₦${sale.totalPrice.toLocaleString()}</div>
                </div>`;
        },

        renderProductsView() {
            const content = this.state.products.length === 0
                ? `<div class="empty-state">
                     <i data-feather="archive" style="width: 64px; height: 64px;"></i>
                     <h2>No Products Yet</h2>
                     <p>Tap the '+' button to scan and add your first item.</p>
                   </div>`
                : `<div class="product-grid">
                     ${this.state.products.map(p => this.createProductCardHTML(p)).join('')}
                   </div>`;
            
            this.elements.views.products.innerHTML = `
                <header class="app-header"><h1>My Products</h1></header>
                ${content}
                <button id="add-product-btn-main" class="fab">+</button>`;
            feather.replace();
                
            this.elements.views.products.querySelectorAll('.edit-btn').forEach(btn => 
                btn.addEventListener('click', (e) => this.editProduct(e.currentTarget.dataset.id))
            );
            document.getElementById('add-product-btn-main').addEventListener('click', () => this.startAddProductFlow());
        },
        
        createProductCardHTML(p) {
            const stockLevel = p.stock <= 5 ? (p.stock === 0 ? 'out' : 'low') : '';
            return `
                <div class="product-card ${p.stock === 0 ? 'out-of-stock' : ''}">
                    ${stockLevel ? `<div class="stock-badge ${stockLevel}">${stockLevel === 'low' ? 'Low Stock' : 'Sold Out'}</div>` : ''}
                    <img src="${p.image}" alt="${p.name}" class="product-image">
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <p class="price">₦${p.price.toLocaleString()}</p>
                        <p class="stock">Stock: ${p.stock}</p>
                    </div>
                    <div class="product-actions">
                        <button class="edit-btn" data-id="${p.id}">Edit</button>
                    </div>
                </div>`;
        },

        showModal(modalHTML) {
            this.elements.modalContainer.innerHTML = modalHTML;
            this.elements.modalContainer.classList.add('active');
            feather.replace();
        },
        
        hideModal() {
            this.elements.modalContainer.classList.remove('active');
            this.elements.modalContainer.innerHTML = '';
        },
        
        showToast(message, type = 'info', duration = 4000) {
            this.elements.toast.textContent = message;
            this.elements.toast.className = 'toast show';
            if (type !== 'info') this.elements.toast.classList.add(type);
            setTimeout(() => this.elements.toast.classList.remove('show'), duration);
        },

        addCoreEventListeners() {
            this.elements.nav.addEventListener('click', (e) => {
                const navBtn = e.target.closest('.nav-btn');
                if (navBtn?.dataset.view) this.navigateTo(navBtn.dataset.view);
                if (e.target.closest('#scan-to-sell-btn')) this.startSellFlow();
            });

            this.elements.camera.cancelBtn.addEventListener('click', () => this.cancelScan());

            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                this.state.deferredInstallPrompt = e;
                if(this.state.currentView === 'home') this.renderHomeView();
            });
        },
        
        async handleOnboarding(e) {
            e.preventDefault();
            const form = e.target;
            this.state.currentUser = {
                id: 'main_user',
                name: form.querySelector('#user-name').value,
                business: form.querySelector('#business-name').value,
            };
            await DB.saveData('user', this.state.currentUser);
            this.navigateTo('permission');
        },
        
        async requestCameraPermission() {
             try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop());
                await this.loadAppData();
                this.navigateTo('home');
            } catch (err) {
                this.showToast("Camera access is required to use this app.", 'error');
            }
        },
        
        async startAddProductFlow(imageDataUrl = null) {
            this.hideModal();
            this.state.scanContext = 'add';
            this.navigateTo('camera');

            if (imageDataUrl) {
                this.handleCapture(imageDataUrl);
                return;
            }

            try {
                await Camera.startCamera(this.elements.camera.video);
                this.elements.camera.status.textContent = 'Hold steady...';
                // Wait for user to position product, then capture. A button might be better.
                setTimeout(() => this.handleCapture(), 3000); 
            } catch (error) {
                this.showToast(error.message, 'error');
                this.navigateBack();
            }
        },

        async startSellFlow() {
            this.state.scanContext = 'sell';
            this.navigateTo('camera');

            try {
                await Camera.startCamera(this.elements.camera.video);
                this.elements.camera.status.textContent = 'Scanning for product...';
                this.elements.camera.scanBox.classList.remove('found');

                this.state.scanInterval = setInterval(async () => {
                    const canvas = this.elements.camera.canvas;
                    const video = this.elements.camera.video;
                    if (!video.srcObject) return;
                    
                    Camera.captureFrame(video, canvas); // Capture to canvas for embedding
                    const embedding = await Camera.getEmbedding(canvas);
                    const match = await Camera.findBestMatch(embedding, this.state.products);
                    
                    if (match) this.handleProductFound(match);
                }, 1200);

            } catch (error) {
                this.showToast(error.message, 'error');
                this.navigateBack();
            }
        },

        async handleCapture(imageDataUrl = null) {
            if (!imageDataUrl) {
                imageDataUrl = Camera.captureFrame(this.elements.camera.video, this.elements.camera.canvas);
            }
            Camera.stopCamera();
            this.showLoader('Analyzing photo...');
            
            try {
                const tempImage = new Image();
                tempImage.src = imageDataUrl;
                tempImage.onload = async () => {
                    const embedding = await Camera.getEmbedding(tempImage);
                    const currentCapture = { image: imageDataUrl, embedding };
                    this.hideLoader();
                    this.showProductDetailsModal(null, currentCapture);
                };
            } catch (error) {
                this.hideLoader();
                this.showToast('Could not analyze photo. Please try again.', 'error');
                this.navigateBack();
            }
        },
        
        handleProductFound(product) {
            this.cleanupScanner();
            this.elements.camera.status.textContent = `Found: ${product.name}`;
            this.elements.camera.scanBox.classList.add('found');
            
            setTimeout(() => {
                Camera.stopCamera();
                this.showSellModal(product);
            }, 800);
        },

        showProductDetailsModal(productToEdit = null, currentCapture = null) {
            const isEditing = !!productToEdit;
            const title = isEditing ? 'Edit Product' : 'Add New Product';
            const imageSrc = isEditing ? productToEdit.image : currentCapture.image;
            
            this.navigateTo(this.state.previousView || 'products');

            this.showModal(`
                <div class="modal-content">
                    <h2>${title}</h2>
                    <form id="product-form">
                        <input type="hidden" id="product-id" value="${isEditing ? productToEdit.id : ''}">
                        <img id="product-form-image" src="${imageSrc}" alt="Product image">
                        <input type="text" id="product-name" placeholder="Product Name (e.g., Indomie)" value="${isEditing ? productToEdit.name : ''}" required>
                        <input type="number" id="product-price" placeholder="Price per item (₦)" value="${isEditing ? productToEdit.price : ''}" required>
                        <input type="number" id="product-stock" placeholder="How many do you have?" value="${isEditing ? productToEdit.stock : ''}" required>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-product-form">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Product</button>
                        </div>
                    </form>
                </div>`);
            
            document.getElementById('product-form').addEventListener('submit', (e) => this.handleSaveProduct(e, currentCapture));
            document.getElementById('cancel-product-form').addEventListener('click', () => this.hideModal());
        },

        async handleSaveProduct(e, currentCapture) {
            e.preventDefault();
            const form = e.target;
            const id = form.querySelector('#product-id').value;
            const isEditing = !!id;

            let productData = {
                name: form.querySelector('#product-name').value,
                price: parseFloat(form.querySelector('#product-price').value),
                stock: parseInt(form.querySelector('#product-stock').value),
            };

            try {
                if (isEditing) {
                    const existingProduct = this.state.products.find(p => p.id === parseInt(id));
                    productData = { ...existingProduct, ...productData, id: parseInt(id) };
                } else {
                    productData.image = currentCapture.image;
                    productData.embedding = currentCapture.embedding;
                }

                await DB.saveData('products', productData);
                await this.loadAppData();
                
                // After saving, go to products view.
                this.navigateTo('products');
                this.hideModal();
                this.showToast(isEditing ? 'Product updated!' : 'Product added!', 'success');
            } catch (error) {
                this.showToast('Failed to save product.', 'error');
            }
        },

        async editProduct(id) {
            const product = this.state.products.find(p => p.id === parseInt(id));
            if (product) {
                this.showProductDetailsModal(product);
            }
        },
        
        showSellModal(product) {
            // After scanning, return to home view and show modal
            this.navigateTo('home');
            this.showModal(`
                <div class="modal-content" id="sell-item-modal">
                    <h2>Sell Item</h2>
                    <img id="sell-product-image" src="${product.image}" alt="${product.name}">
                    <h3 id="sell-product-name">${product.name}</h3>
                    <form id="sell-form">
                        <div class="quantity-control">
                            <label for="sell-quantity">Quantity:</label>
                            <input type="number" id="sell-quantity" value="1" min="1" max="${product.stock}" required>
                        </div>
                        <h3 class="total-price">Total: <span id="sell-total-price">₦${product.price.toLocaleString()}</span></h3>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" id="cancel-sale-btn">Cancel</button>
                            <button type="submit" class="btn btn-primary">Confirm Sale</button>
                        </div>
                    </form>
                </div>`);
            const quantityInput = document.getElementById('sell-quantity');
            const updateTotal = () => {
                const total = (parseInt(quantityInput.value) || 0) * product.price;
                document.getElementById('sell-total-price').textContent = `₦${total.toLocaleString()}`;
            };
            quantityInput.addEventListener('input', updateTotal);
            document.getElementById('sell-form').addEventListener('submit', (e) => this.confirmSale(e, product));
            document.getElementById('cancel-sale-btn').addEventListener('click', () => {
                this.hideModal();
                this.startSellFlow(); // Auto-start next scan after cancelling a sale
            });
        },
        
        async confirmSale(e, product) {
            e.preventDefault();
            const quantity = parseInt(document.getElementById('sell-quantity').value);
            
            if (quantity > product.stock) {
                return this.showToast("Not enough stock!", 'error');
            }
            
            product.stock -= quantity;
            const sale = {
                productId: product.id,
                totalPrice: product.price * quantity,
                quantity: quantity,
                timestamp: new Date().toISOString()
            };
            
            try {
                await DB.saveData('products', product);
                await DB.saveData('sales', sale);
                await this.loadAppData();
                this.hideModal();
                this.showToast(`Sold ${quantity} x ${product.name}!`, 'success');
                // Auto-start the next scan after a successful sale.
                this.startSellFlow();
            } catch (error) {
                this.showToast('Sale could not be completed.', 'error');
            }
        },

        cancelScan() {
            this.cleanupScanner();
            Camera.stopCamera();
            this.navigateBack();
        },

        cleanupScanner() {
            if (this.state.scanInterval) clearInterval(this.state.scanInterval);
            this.state.scanInterval = null;
        },

        showLoader(message) { this.elements.loader.querySelector('p').textContent = message; this.elements.loader.classList.add('active'); },
        hideLoader() { this.elements.loader.classList.remove('active'); },

        async promptInstall() {
            if (this.state.deferredInstallPrompt) {
                this.state.deferredInstallPrompt.prompt();
                await this.state.deferredInstallPrompt.userChoice;
                this.state.deferredInstallPrompt = null;
                if(document.getElementById('install-btn')) document.getElementById('install-btn').hidden = true;
            }
        },

        registerServiceWorker() {
            if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/serviceworker.js')
                        .then(reg => console.log('Service Worker registered', reg))
                        .catch(err => console.error('Service Worker registration failed', err));
                });
            }
        }
    };

    window.App = App;
    App.init();
});
