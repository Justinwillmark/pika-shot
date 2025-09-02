// Wait for the entire page to load
window.addEventListener('load', async () => {
    await initDB();
    
    const profile = await getData('user_profile', 'profile');
    if (profile) {
        // If user is onboarded, load the app
        awaitinitializeApp(profile);
    } else {
        // Otherwise, show onboarding
        navigateTo('page-onboarding');
    }

    setupEventListeners();
    
    // PWA Service Worker Registration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/serviceworker.js')
            .then(reg => console.log('Service worker registered'))
            .catch(err => console.error('Service worker not registered', err));
    }
});

let currentSaleProduct = null;

async function initializeApp(profile) {
    document.getElementById('dashboard-business-name').textContent = profile.businessName;
    navigateTo('page-dashboard');
    await renderDashboard();
    loadModel(); // Load AI model in the background
    
    // NEW: Simulate receiving a log request after 15 seconds
    setTimeout(showLogRequestToast, 15000);
}

function setupEventListeners() {
    // Onboarding
    document.getElementById('finish-onboarding-btn').addEventListener('click', async () => {
        const userName = document.getElementById('user-name').value.trim();
        const businessName = document.getElementById('business-name').value.trim();
        if (!userName || !businessName) {
            alert('Please fill in your details.');
            return;
        }

        const profile = { key: 'profile', userName, businessName };
        await saveData('user_profile', profile);

        // NEW: Ask for camera permission as part of onboarding
        alert("Next, we'll ask for camera access to scan products.");
        const permissionGranted = await requestCameraPermission();
        if (permissionGranted) {
            initializeApp(profile);
        }
    });

    // Navigation
    document.getElementById('record-sale-btn').addEventListener('click', () => {
        navigateTo('page-camera');
        startCamera('sell');
    });

    document.getElementById('manage-products-btn').addEventListener('click', () => {
        renderProductsPage();
        navigateTo('page-products');
    });

    document.getElementById('add-product-btn').addEventListener('click', () => {
        navigateTo('page-camera');
        startCamera('addProduct');
    });

    // Camera
    document.getElementById('cancel-camera-btn').addEventListener('click', () => {
        stopCamera();
        // Go back to the previous relevant page
        if (currentCameraAction === 'sell') navigateTo('page-dashboard');
        else navigateTo('page-products');
    });

    // Modals
    document.getElementById('save-product-btn').addEventListener('click', saveNewProduct);
    document.getElementById('confirm-sale-btn').addEventListener('click', processSale);

    document.querySelectorAll('.modal-cancel-btn').forEach(btn => {
        btn.addEventListener('click', hideAllModals);
    });
    
    document.getElementById('view-log-request-btn').addEventListener('click', () => {
        document.getElementById('log-request-toast').classList.add('hidden');
        showModal('modal-log-request');
    });

    document.getElementById('accept-log-btn').addEventListener('click', () => {
        alert("Success! Purchase from Tolu has been added to your records. (This is a demo)");
        hideAllModals();
    });
    
    // Dynamic price calculation in sale modal
    document.getElementById('sale-quantity').addEventListener('input', updateTotalSalePrice);
}

// Navigation and UI Helpers
function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function showModal(modalId) {
    document.querySelector('.modal-backdrop').classList.remove('hidden');
    document.getElementById(modalId).classList.remove('hidden');
}

function hideAllModals() {
    document.querySelector('.modal-backdrop').classList.add('hidden');
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

// Core App Logic
async function renderDashboard() {
    const sales = await getAllData('sales');
    const salesList = document.getElementById('sales-list');
    const totalSalesEl = document.getElementById('total-sales');
    salesList.innerHTML = '';
    let totalSales = 0;

    if (sales.length === 0) {
        salesList.innerHTML = '<p class="empty-state">No sales recorded yet.</p>';
    } else {
        sales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        sales.forEach(sale => {
            salesList.innerHTML += `
                <div class="sale-item">
                    <div class="sale-item-info">
                        <p>${sale.productName} (x${sale.quantity})</p>
                        <span>${new Date(sale.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div class="sale-item-price">₦${sale.total.toLocaleString()}</div>
                </div>
            `;
            totalSales += sale.total;
        });
    }
    totalSalesEl.textContent = `₦${totalSales.toLocaleString()}`;
}

async function renderProductsPage() {
    const products = await getAllData('products');
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    if (products.length === 0) {
        productList.innerHTML = '<p class="empty-state">Add your first product!</p>';
    } else {
        products.forEach(p => {
            const stockLevel = p.quantity <= 5 ? 'low' : '';
            productList.innerHTML += `
                <div class="product-card">
                    <img src="${p.imageDataUrl}" alt="${p.name}">
                    <p class="name">${p.name}</p>
                    <p class="price">₦${p.price.toLocaleString()}</p>
                    <span class="stock ${stockLevel}">Stock: ${p.quantity}</span>
                </div>
            `;
        });
    }
}

// Product & Sales Flow
let newProductData = {};
function showAddProductModal(data) {
    newProductData = data;
    document.getElementById('product-capture-preview').src = data.imageDataUrl;
    // Clear old input
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-quantity').value = '';
    
    navigateTo('page-products'); // Go to products page underneath
    showModal('modal-add-product');
}

async function saveNewProduct() {
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseInt(document.getElementById('product-quantity').value);

    if (!name || !price || !quantity) {
        alert("Please fill all details.");
        return;
    }

    await saveData('products', {
        name,
        price,
        quantity,
        embedding: newProductData.embedding,
        imageDataUrl: newProductData.imageDataUrl
    });

    hideAllModals();
    renderProductsPage();
}

function showSaleConfirmation(product) {
    currentSaleProduct = product;
    document.getElementById('sale-item-name').textContent = product.name;
    document.getElementById('sale-item-image').src = product.imageDataUrl;
    document.getElementById('sale-quantity').value = 1;
    document.getElementById('sale-quantity').max = product.quantity; // Can't sell more than in stock
    updateTotalSalePrice();
    navigateTo('page-dashboard');
    showModal('modal-sale-confirm');
}

function updateTotalSalePrice() {
    const quantity = parseInt(document.getElementById('sale-quantity').value);
    if (currentSaleProduct && quantity > 0) {
        const total = quantity * currentSaleProduct.price;
        document.getElementById('sale-total-price').textContent = `₦${total.toLocaleString()}`;
    }
}

async function processSale() {
    const quantity = parseInt(document.getElementById('sale-quantity').value);
    if (!quantity || quantity <= 0) {
        alert("Invalid quantity.");
        return;
    }
    if (quantity > currentSaleProduct.quantity) {
        alert(`Not enough stock. Only ${currentSaleProduct.quantity} available.`);
        return;
    }

    await saveData('sales', {
        productId: currentSaleProduct.id,
        productName: currentSaleProduct.name,
        quantity,
        price: currentSaleProduct.price,
        total: quantity * currentSaleProduct.price,
        timestamp: new Date().toISOString()
    });
    
    await updateProductStock(currentSaleProduct.id, quantity);
    
    hideAllModals();
    await renderDashboard();
}

// Log Request Simulation
function showLogRequestToast() {
    const toast = document.getElementById('log-request-toast');
    // Only show if user is on the dashboard
    if(document.getElementById('page-dashboard').classList.contains('active')) {
       toast.classList.remove('hidden');
       setTimeout(() => toast.classList.add('hidden'), 8000); // Auto-hide after 8 seconds
    }
}