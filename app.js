document.addEventListener('DOMContentLoaded', () => {
    const App = {
        // App State
        state: {
            currentUser: null,
            currentView: null,
            products: [],
            sales: [],
            isLoading: true,
            deferredInstallPrompt: null,
            activeSale: { product: null },
            currentCapture: { image: null, embedding: null },
            scanTimeout: null,
            scanInterval: null,
        },

        // DOM Elements
        elements: {
            loader: document.getElementById('loader'),
            appContainer: document.getElementById('app-container'),
            views: {
                onboarding: document.getElementById('onboarding-view'),
                permission: document.getElementById('permission-view'),
                dashboard: document.getElementById('dashboard-view'),
                products: document.getElementById('products-view'),
                camera: document.getElementById('camera-view'),
            },
            nav: document.getElementById('bottom-nav'),
            modalContainer: document.getElementById('modal-container'),
            toast: document.getElementById('toast-notification'),
        },

        // === INITIALIZATION ===
        async init() {
            this.showLoader('Warming up the engine...');
            this.registerServiceWorker();
            this.renderNav();
            this.addCoreEventListeners();

            try {
                await DB.init();
                await Camera.init();
                
                this.state.currentUser = await DB.getData('user', 'main_user');
                
                if (this.state.currentUser) {
                    await this.loadAppData();
                    this.navigateTo('dashboard');
                    this.startSimulatedNotification();
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

        // === UI & RENDERING ===
        renderNav() {
            this.elements.nav.innerHTML = `
                <button class="nav-btn" data-view="dashboard">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                </button>
                <button class="nav-btn" data-view="products">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6-2h4v2h-4V4z"/></svg>
                </button>
                <button id="sell-item-btn" class="nav-btn-main">
                    <svg fill="currentColor" viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                </button>
                <div class="nav-btn"></div> <div class="nav-btn"></div> `;
        },

        navigateTo(viewName) {
            Object.values(this.elements.views).forEach(v => v.classList.remove('active'));
            if (this.elements.views[viewName]) {
                this.elements.views[viewName].classList.add('active');
                this.state.currentView = viewName;
                this.updateNav();
                
                // Trigger render for the specific view
                const renderMethod = `render${viewName.charAt(0).toUpperCase() + viewName.slice(1)}View`;
                if (typeof this[renderMethod] === 'function') {
                    this[renderMethod]();
                }
            }
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
                    <h1>Welcome Aboard!</h1>
                    <p>Let's get your shop set up in seconds. It’s super fast and works offline.</p>
                    <form id="onboarding-form">
                        <input type="text" id="user-name" placeholder="Your Name" required>
                        <input type="text" id="business-name" placeholder="Business Name" required>
                        <select id="user-location" required>
                            <option value="" disabled selected>Select Your Location</option>
                            <option value="Lagos">Lagos</option><option value="Abuja">Abuja</option><option value="Kano">Kano</option>
                        </select>
                        <button type="submit" class="btn btn-primary">Get Started</button>
                    </form>
                </div>`;
            document.getElementById('onboarding-form').addEventListener('submit', (e) => this.handleOnboarding(e));
        },
        
        renderPermissionView() {
            this.elements.views.permission.innerHTML = `
                <div class="welcome-card">
                    <div class="icon" style="font-size: 64px;">📸</div>
                    <h1>Camera Access</h1>
                    <p>pika shot uses your camera to scan products instantly. This makes adding items and selling super fast! Please grant access to continue.</p>
                    <button id="grant-permission-btn" class="btn btn-primary">Grant Access</button>
                </div>`;
            document.getElementById('grant-permission-btn').addEventListener('click', () => this.requestCameraPermission());
        },

        renderDashboardView() {
            const totalSales = this.state.sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
            const itemsSold = this.state.sales.reduce((sum, sale) => sum + sale.quantity, 0);
            this.elements.views.dashboard.innerHTML = `
                <header class="app-header">
                    <h1 id="welcome-message">Hello, ${this.state.currentUser.name}!</h1>
                    <p>${this.state.currentUser.business}</p>
                    <button id="install-btn" class="install-btn" ${this.state.deferredInstallPrompt ? '' : 'hidden'}>Install App</button>
                </header>
                <div class="dashboard-grid">
                    <div class="stat-card">
                        <h3>Total Sales (₦)</h3>
                        <p>${totalSales.toLocaleString()}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Items Sold</h3>
                        <p>${itemsSold}</p>
                    </div>
                </div>
                <div class="quick-actions">
                    <h2>Quick Actions</h2>
                    <button id="quick-add-product-btn" class="btn btn-secondary">Add New Product</button>
                </div>`;
            document.getElementById('quick-add-product-btn').addEventListener('click', () => this.startAddProductFlow());
            document.getElementById('install-btn')?.addEventListener('click', () => this.promptInstall());
        },

        renderProductsView() {
            const content = this.state.products.length === 0
                ? `<div class="empty-state">
                     <div class="icon">📦</div>
                     <h2>No Products Yet</h2>
                     <p>Tap the '+' button to start scanning your items.</p>
                   </div>`
                : `<div class="product-grid">
                     ${this.state.products.map(this.createProductCardHTML).join('')}
                   </div>`;
            
            this.elements.views.products.innerHTML = `
                <header class="app-header"><h1>My Products</h1></header>
                ${content}
                <button id="add-product-btn-main" class="fab">+</button>`;
                
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
                        <p class="price">₦${p.price}</p>
                    </div>
                    <div class="product-actions">
                        <button class="edit-btn" data-id="${p.id}">Edit</button>
                    </div>
                </div>`;
        },

        // === MODALS & TOAST ===
        showModal(modalHTML) {
            this.elements.modalContainer.innerHTML = modalHTML;
            this.elements.modalContainer.classList.add('active');
        },
        
        hideModal() {
            this.elements.modalContainer.classList.remove('active');
            this.elements.modalContainer.innerHTML = '';
        },
        
        showToast(message, type = 'info', duration = 4000) {
            this.elements.toast.textContent = message;
            this.elements.toast.className = 'toast show'; // Reset classes
            if (type !== 'info') this.elements.toast.classList.add(type);
            setTimeout(() => this.elements.toast.classList.remove('show'), duration);
        },

        // === EVENT LISTENERS ===
        addCoreEventListeners() {
            this.elements.nav.addEventListener('click', (e) => {
                const navBtn = e.target.closest('.nav-btn');
                if (navBtn && navBtn.dataset.view) this.navigateTo(navBtn.dataset.view);
                if (e.target.closest('#sell-item-btn')) this.startSellFlow();
            });

            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                this.state.deferredInstallPrompt = e;
                const installBtn = document.getElementById('install-btn');
                if (installBtn) installBtn.hidden = false;
            });
        },
        
        // === APP LOGIC & FLOWS ===
        async handleOnboarding(e) {
            e.preventDefault();
            const form = e.target;
            this.state.currentUser = {
                id: 'main_user',
                name: form.querySelector('#user-name').value,
                business: form.querySelector('#business-name').value,
                location: form.querySelector('#user-location').value
            };
            await DB.saveData('user', this.state.currentUser);
            this.navigateTo('permission');
        },
        
        async requestCameraPermission() {
             try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop());
                await this.loadAppData();
                this.navigateTo('dashboard');
                this.startSimulatedNotification();
            } catch (err) {
                this.showToast("Camera access is required to use this app.", 'error');
            }
        },

        async startAddProductFlow(imageFromFailedScan = null) {
            this.hideModal();
            this.navigateTo('camera');
            const video = document.getElementById('camera-feed');
            
            if (imageFromFailedScan) {
                this.handleCapture(imageFromFailedScan);
                return;
            }

            if(await Camera.startCamera(video)) {
                document.getElementById('camera-status').textContent = 'Hold steady...';
                setTimeout(() => this.handleCapture(), 3000);
            } else {
                this.navigateTo(this.state.currentView || 'dashboard');
            }
        },
        
        async handleCapture(imageDataUrl = null) {
            const canvas = document.getElementById('capture-canvas');
            const video = document.getElementById('camera-feed');
            if (!imageDataUrl) {
                imageDataUrl = Camera.captureFrame(video, canvas);
            }
            Camera.stopCamera();
            this.navigateTo(this.state.currentView || 'dashboard');
            this.showLoader('Analyzing photo...');

            const tempImage = new Image();
            tempImage.src = imageDataUrl;
            tempImage.onload = async () => {
                this.state.currentCapture = {
                    image: imageDataUrl,
                    embedding: await Camera.getEmbedding(tempImage)
                };
                this.hideLoader();
                this.showPhotoConfirmationModal();
            };
        },

        // More logic follows... (continued in next block)
    };

    // Splitting app.js for clarity, this is a continuation
    Object.assign(App, {
        showPhotoConfirmationModal() {
            this.showModal(`
                <div class="modal-content">
                    <h2>Confirm Product Photo</h2>
                    <img id="captured-image-preview" src="${this.state.currentCapture.image}" alt="Captured product">
                    <div class="modal-actions">
                        <button id="try-again-btn" class="btn btn-secondary">Try Again</button>
                        <button id="confirm-photo-btn" class="btn btn-primary">Looks Good</button>
                    </div>
                </div>`);
            document.getElementById('try-again-btn').addEventListener('click', () => this.startAddProductFlow());
            document.getElementById('confirm-photo-btn').addEventListener('click', () => this.showProductDetailsModal());
        },

        showProductDetailsModal(productToEdit = null) {
            const isEditing = !!productToEdit;
            const title = isEditing ? 'Edit Product' : 'Add New Product';
            const imageSrc = isEditing ? productToEdit.image : this.state.currentCapture.image;
            
            this.showModal(`
                <div class="modal-content">
                    <h2>${title}</h2>
                    <form id="product-form">
                        <input type="hidden" id="product-id" value="${isEditing ? productToEdit.id : ''}">
                        <img id="product-form-image" src="${imageSrc}" alt="Product image">
                        <input type="text" id="product-name" placeholder="Product Name (e.g., Indomie)" value="${isEditing ? productToEdit.name : ''}" required>
                        <input type="number" id="product-price" placeholder="Price per item (₦)" value="${isEditing ? productToEdit.price : ''}" required>
                        <input type="number" id="product-stock" placeholder="How many do you have?" value="${isEditing ? productToEdit.stock : ''}" required>
                        <select id="product-unit" required>
                            ${['sachets', 'bottles', 'cans', 'pieces', 'packs'].map(u => `<option value="${u}" ${isEditing && productToEdit.unit === u ? 'selected' : ''}>${u}</option>`).join('')}
                        </select>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" onclick="App.hideModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Product</button>
                        </div>
                    </form>
                </div>`);
            document.getElementById('product-form').addEventListener('submit', (e) => this.handleSaveProduct(e));
        },

        async handleSaveProduct(e) {
            e.preventDefault();
            const form = e.target;
            const id = form.querySelector('#product-id').value;
            const isEditing = !!id;

            let productData = {
                name: form.querySelector('#product-name').value,
                price: parseFloat(form.querySelector('#product-price').value),
                stock: parseInt(form.querySelector('#product-stock').value),
                unit: form.querySelector('#product-unit').value,
            };

            try {
                if (isEditing) {
                    const existingProduct = this.state.products.find(p => p.id === parseInt(id));
                    productData = { ...existingProduct, ...productData, id: parseInt(id) };
                } else {
                    productData.image = this.state.currentCapture.image;
                    productData.embedding = this.state.currentCapture.embedding;
                }

                await DB.saveData('products', productData);
                await this.loadAppData(); // Reload all data
                this.renderProductsView();
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
        
        async startSellFlow() {
            this.navigateTo('camera');
            const video = document.getElementById('camera-feed');
            const canvas = document.getElementById('capture-canvas');
            const status = document.getElementById('camera-status');
            const scanBox = document.getElementById('scan-box');

            if (!(await Camera.startCamera(video))) {
                this.navigateTo(this.state.currentView || 'dashboard');
                return;
            }
            
            status.textContent = 'Scanning for product...';
            scanBox.classList.remove('found');
            
            let lastCapturedImage = null;

            this.state.scanInterval = setInterval(async () => {
                if (!video.srcObject) return;
                lastCapturedImage = Camera.captureFrame(video, canvas);
                const embedding = await Camera.getEmbedding(canvas);
                const match = await Camera.findBestMatch(embedding, this.state.products);
                
                if (match) this.handleProductFound(match);

            }, 1200);

            this.state.scanTimeout = setTimeout(() => this.handleProductNotFound(lastCapturedImage), 7000);
        },

        handleProductFound(product) {
            this.cleanupScanner();
            document.getElementById('camera-status').textContent = `Found: ${product.name}`;
            document.getElementById('scan-box').classList.add('found');
            
            setTimeout(() => {
                Camera.stopCamera();
                this.navigateTo(this.state.currentView || 'dashboard');
                this.state.activeSale.product = product;
                this.showSellModal(product);
            }, 800);
        },

        handleProductNotFound(lastImage) {
            this.cleanupScanner();
            Camera.stopCamera();
            this.showToast("Product not found. Let's add it!");
            this.startAddProductFlow(lastImage);
        },
        
        showSellModal(product) {
            this.showModal(`
                <div class="modal-content" id="sell-item-modal">
                    <h2>Sell Item</h2>
                    <img id="sell-product-image" src="${product.image}" alt="${product.name}">
                    <h3 id="sell-product-name">${product.name}</h3>
                    <p id="sell-product-price" style="color: var(--body-text);">Price: ₦${product.price}</p>
                    <form id="sell-form">
                        <div class="quantity-control">
                            <label for="sell-quantity">Quantity:</label>
                            <input type="number" id="sell-quantity" value="1" min="1" max="${product.stock}" required>
                        </div>
                        <h3 class="total-price">Total: <span id="sell-total-price">₦${product.price}</span></h3>
                        <div class="modal-actions">
                            <button type="button" class="btn btn-secondary" onclick="App.hideModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Confirm Sale</button>
                        </div>
                    </form>
                </div>`);
            const quantityInput = document.getElementById('sell-quantity');
            quantityInput.addEventListener('input', () => {
                const total = (parseInt(quantityInput.value) || 0) * product.price;
                document.getElementById('sell-total-price').textContent = `₦${total}`;
            });
            document.getElementById('sell-form').addEventListener('submit', (e) => this.confirmSale(e));
        },
        
        async confirmSale(e) {
            e.preventDefault();
            const quantity = parseInt(document.getElementById('sell-quantity').value);
            const { product } = this.state.activeSale;
            
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
                this.renderDashboardView();
                this.hideModal();
                this.showToast(`Sold ${quantity} x ${product.name}!`, 'success');
            } catch (error) {
                this.showToast('Sale could not be completed.', 'error');
            }
        },

        cleanupScanner() {
            if (this.state.scanInterval) clearInterval(this.state.scanInterval);
            if (this.state.scanTimeout) clearTimeout(this.state.scanTimeout);
            this.state.scanInterval = null;
            this.state.scanTimeout = null;
        },

        showLoader(message) { this.elements.loader.querySelector('p').textContent = message; this.elements.loader.classList.add('active'); },
        hideLoader() { this.elements.loader.classList.remove('active'); },
        async promptInstall() {
            if (this.state.deferredInstallPrompt) {
                this.state.deferredInstallPrompt.prompt();
                const { outcome } = await this.state.deferredInstallPrompt.userChoice;
                if (outcome === 'accepted') this.showToast('App installed successfully!', 'success');
                this.state.deferredInstallPrompt = null;
                document.getElementById('install-btn').hidden = true;
            }
        },
        startSimulatedNotification() {
            setTimeout(() => {
                const toast = this.showToast("Incoming Purchase from Tolu! [View Items]", 'info', 8000);
                this.elements.toast.onclick = () => {
                    this.showModal(`
                        <div class="modal-content">
                            <h2>Incoming Purchase from Tolu</h2>
                            <ul class="item-list" style="list-style: none; text-align: left; margin: 20px 0;">
                               <li style="padding: 8px 0; border-bottom: 1px solid var(--border-color);">5 x Peak Milk Sachet</li>
                               <li style="padding: 8px 0;">1 x 50cl Coke Bottle</li>
                            </ul>
                            <div class="modal-actions">
                                <button class="btn btn-secondary" onclick="App.hideModal(); App.showToast('Purchase declined.');">Decline</button>
                                <button class="btn btn-primary" onclick="App.hideModal(); App.showToast('Purchase accepted!', 'success');">Accept</button>
                            </div>
                        </div>`);
                    this.elements.toast.onclick = null;
                };
            }, 15000);
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
    });

    // Make App object globally accessible for inline event handlers (a simple pattern for this scale)
    window.App = App;
    App.init();
});