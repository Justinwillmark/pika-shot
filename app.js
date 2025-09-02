let currentSaleProduct = null;
let currentEditingProduct = null;
let newProductCaptureData = {};
let installPromptEvent = null;

// Primary initialization function
window.addEventListener('load', async () => {
    const spinner = document.getElementById('loading-spinner');
    try {
        await initDB();
        const profile = await getData('user_profile', 'profile');
        if (profile) {
            await initializeApp(profile);
        } else {
            navigateTo('page-onboarding');
        }
        setupEventListeners();
        setupPWAInstall();
    } catch (error) {
        console.error("Initialization failed:", error);
        alert("Something went wrong. Please clear your browser data for this site and try again.");
    } finally {
        spinner.classList.add('hidden');
    }
});

async function initializeApp(profile) {
    document.getElementById('dashboard-business-name').textContent = profile.businessName;
    navigateTo('page-dashboard');
    await renderDashboard();
    loadModel(); // Load AI model in the background
    setTimeout(showLogRequestToast, 15000);
}

function setupEventListeners() {
    // Onboarding
    document.getElementById('finish-onboarding-btn').addEventListener('click', handleOnboarding);

    // Navigation & Core Actions
    document.getElementById('record-sale-btn').addEventListener('click', () => { navigateTo('page-camera'); startCamera('sell'); });
    document.getElementById('manage-products-btn').addEventListener('click', () => { renderProductsPage(); navigateTo('page-products'); });
    document.getElementById('add-product-btn').addEventListener('click', () => { navigateTo('page-camera'); startCamera('addProduct'); });
    document.getElementById('cancel-camera-btn').addEventListener('click', cancelCamera);

    // Modals
    document.getElementById('confirm-capture-btn').addEventListener('click', () => showAddProductModal(newProductCaptureData));
    document.getElementById('retry-capture-btn').addEventListener('click', () => { hideAllModals(); navigateTo('page-camera'); startCamera('addProduct'); });
    document.getElementById('save-product-btn').addEventListener('click', saveNewProduct);
    document.getElementById('save-edit-product-btn').addEventListener('click', saveEditedProduct);
    document.getElementById('confirm-sale-btn').addEventListener('click', processSale);
    document.querySelectorAll('.modal-cancel-btn').forEach(btn => btn.addEventListener('click', hideAllModals));
    document.querySelectorAll('.back-btn').forEach(btn => btn.addEventListener('click', (e) => navigateTo(e.currentTarget.dataset.target)));

    // Sale Quantity Input
    document.getElementById('sale-quantity').addEventListener('input', updateTotalSalePrice);
}

function setupPWAInstall() {
    const installBtn = document.getElementById('install-app-btn');
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        installPromptEvent = e;
        installBtn.classList.remove('hidden');
    });
    installBtn.addEventListener('click', async () => {
        if (!installPromptEvent) return;
        installPromptEvent.prompt();
        const { outcome } = await installPromptEvent.userChoice;
        if (outcome === 'accepted') {
            installBtn.classList.add('hidden');
        }
        installPromptEvent = null;
    });
}

// --- ONBOARDING & NAVIGATION ---
async function handleOnboarding() {
    const userName = document.getElementById('user-name').value.trim();
    const businessName = document.getElementById('business-name').value.trim();
    if (!userName || !businessName) { alert('Please fill in your details.'); return; }

    const profile = { key: 'profile', userName, businessName };
    await saveData('user_profile', profile);

    alert("Next, we'll ask for camera access to scan products.");
    const permissionGranted = await requestCameraPermission();
    if (permissionGranted) initializeApp(profile);
}

function navigateTo(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

function cancelCamera() {
    stopCamera();
    if (currentCameraAction === 'sell') navigateTo('page-dashboard');
    else navigateTo('page-products');
}

// --- UI & MODALS ---
function showModal(modalId) {
    document.getElementById('modal-backdrop').classList.remove('hidden');
    document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
    document.getElementById(modalId).classList.remove('hidden');
}

function hideAllModals() {
    document.getElementById('modal-backdrop').classList.add('hidden');
}

// --- RENDERING ---
async function renderDashboard() {
    const sales = await getAllData('sales');
    const salesList = document.getElementById('sales-list');
    let totalSales = 0;
    salesList.innerHTML = sales.length === 0 ? '<p class="empty-state">No sales recorded yet.</p>' : '';
    sales.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(sale => {
        salesList.innerHTML += `<div class="sale-item">...</div>`; // Simplified for brevity
        totalSales += sale.total;
    });
    document.getElementById('total-sales').textContent = `₦${totalSales.toLocaleString()}`;
}

async function renderProductsPage() {
    const products = await getAllData('products');
    const productList = document.getElementById('product-list');
    productList.innerHTML = products.length === 0 ? '<p class="empty-state">Add your first product!</p>' : '';
    products.forEach(p => {
        const stockUnit = p.unitType ? p.unitType : 'items';
        const stockLevel = p.quantity <= 5 ? 'low' : '';
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <button class="product-edit-btn" data-product-id="${p.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
            </button>
            <img src="${p.imageDataUrl}" alt="${p.name}">
            <p class="name">${p.name}</p>
            <p class="price">₦${p.price.toLocaleString()}</p>
            <span class="stock ${stockLevel}">${p.quantity} ${stockUnit} left</span>
        `;
        card.querySelector('.product-edit-btn').addEventListener('click', () => showEditProductModal(p));
        productList.appendChild(card);
    });
}

// --- PRODUCT MANAGEMENT ---
function showConfirmCaptureModal(data) {
    newProductCaptureData = data;
    document.getElementById('capture-preview-img').src = data.imageDataUrl;
    hideAllModals();
    showModal('modal-confirm-capture');
}

function showAddProductModal(data) {
    newProductCaptureData = data; // Carry over data
    document.getElementById('product-name').value = '';
    document.getElementById('product-price').value = '';
    document.getElementById('product-quantity').value = '';
    document.getElementById('product-unit').value = '';
    hideAllModals();
    showModal('modal-add-product');
    if (currentCameraAction === 'sell') navigateTo('page-dashboard');
    else navigateTo('page-products');
}

async function saveNewProduct() {
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const quantity = parseInt(document.getElementById('product-quantity').value);
    const unitType = document.getElementById('product-unit').value.trim();
    if (!name || !price || !quantity) { alert("Please fill all details."); return; }
    await saveData('products', { name, price, quantity, unitType, ...newProductCaptureData });
    hideAllModals();
    renderProductsPage();
    navigateTo('page-products');
}

function showEditProductModal(product) {
    currentEditingProduct = product;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-quantity').value = product.quantity;
    document.getElementById('edit-product-unit').value = product.unitType || '';
    showModal('modal-edit-product');
}

async function saveEditedProduct() {
    currentEditingProduct.name = document.getElementById('edit-product-name').value.trim();
    currentEditingProduct.price = parseFloat(document.getElementById('edit-product-price').value);
    currentEditingProduct.quantity = parseInt(document.getElementById('edit-product-quantity').value);
    currentEditingProduct.unitType = document.getElementById('edit-product-unit').value.trim();
    await saveData('products', currentEditingProduct);
    hideAllModals();
    renderProductsPage();
}

// --- SALES FLOW ---
function showSaleConfirmation(product) {
    currentSaleProduct = product;
    document.getElementById('sale-item-name').textContent = product.name;
    document.getElementById('sale-item-image').src = product.imageDataUrl;
    document.getElementById('sale-item-price').textContent = `₦${product.price.toLocaleString()} per ${product.unitType || 'item'}`;
    document.getElementById('sale-quantity').value = 1;
    document.getElementById('sale-quantity').max = product.quantity;
    updateTotalSalePrice();
    navigateTo('page-dashboard');
    showModal('modal-sale-confirm');
}

function updateTotalSalePrice() {
    const quantity = parseInt(document.getElementById('sale-quantity').value);
    if (currentSaleProduct && quantity > 0) {
        document.getElementById('sale-total-price').textContent = `₦${(quantity * currentSaleProduct.price).toLocaleString()}`;
    }
}

async function processSale() {
    const quantity = parseInt(document.getElementById('sale-quantity').value);
    if (quantity > currentSaleProduct.quantity) { alert(`Not enough stock. Only ${currentSaleProduct.quantity} available.`); return; }
    await saveData('sales', {
        productName: currentSaleProduct.name, quantity, total: quantity * currentSaleProduct.price,
        timestamp: new Date().toISOString()
    });
    await updateProductStock(currentSaleProduct.id, quantity);
    hideAllModals();
    await renderDashboard();
}

// --- SIMULATION ---
function showLogRequestToast() { /* Unchanged */ }