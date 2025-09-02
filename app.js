let deferredPrompt;
let currentView = 'home';
let capturedImage = null;
let isSelling = false;
let scanInterval;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
        installBtn.style.display = 'block';
    }
});

function setupEventListeners() {
    document.getElementById('install-btn')?.addEventListener('click', handleInstall);
    document.getElementById('onboard-next').addEventListener('click', handleOnboardNext);
    document.getElementById('grant-camera').addEventListener('click', handleGrantCamera);
    document.getElementById('cancel-scan').addEventListener('click', handleCancelScan);
    document.getElementById('confirm-yes').addEventListener('click', () => showProductModal());
    document.getElementById('confirm-no').addEventListener('click', () => startScanning());
    document.getElementById('add-form').addEventListener('submit', handleSaveProduct);
    document.getElementById('cancel-add').addEventListener('click', () => {
        closeProductModal();
        showView('products');
    });
    document.getElementById('confirm-sale').addEventListener('click', handleConfirmSale);
    document.getElementById('close-sell').addEventListener('click', handleCloseSell);
    document.getElementById('sell-quantity').addEventListener('input', updateSellTotal);
    
    // Bottom Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => showView(btn.dataset.view));
    });
    document.getElementById('add-product-btn').addEventListener('click', handleAddProduct);
    document.getElementById('sell-item-btn').addEventListener('click', handleSellItem);

    // Simulated Feature Listeners
    document.getElementById('view-incoming').addEventListener('click', showIncomingModal);
    document.getElementById('accept-incoming').addEventListener('click', () => document.getElementById('incoming-modal').style.display = 'none');
    document.getElementById('decline-incoming').addEventListener('click', () => document.getElementById('incoming-modal').style.display = 'none');
}

async function initApp() {
    document.getElementById('loading-spinner').style.display = 'flex';
    await initDB();
    await loadModel();
    setupEventListeners();
    const user = await getUser();
    document.getElementById('loading-spinner').style.display = 'none';
    document.getElementById('app').style.display = 'flex';

    if (!user) {
        showView('onboarding', false); // Don't show nav during onboarding
    } else {
        document.getElementById('greeting').textContent = `Hello, ${user.name}!`;
        showView('home');
        updateHomeStats();
        setTimeout(showIncomingNotification, 15000);
    }
}

function showView(viewId, showNav = true) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId)?.classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === viewId);
    });
    
    document.getElementById('bottom-nav').style.display = showNav ? 'flex' : 'none';
    document.getElementById('sell-item-btn').style.display = showNav ? 'block' : 'none';
    currentView = viewId;

    if (viewId === 'products') loadProducts();
    if (viewId === 'home') updateHomeStats();
}

// --- Event Handlers ---

function handleInstall() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                document.getElementById('install-btn').style.display = 'none';
            }
            deferredPrompt = null;
        });
    }
}

function handleOnboardNext() {
    const name = document.getElementById('user-name').value.trim();
    const business = document.getElementById('business-name').value.trim();
    if (name && business) {
        document.getElementById('onboard-step1').style.display = 'none';
        document.getElementById('camera-explain').style.display = 'block';
    } else {
        alert('Please enter your name and business name.');
    }
}

async function handleGrantCamera() {
    try {
        await startCamera(); // Test access
        stopCamera();
        const name = document.getElementById('user-name').value;
        const business = document.getElementById('business-name').value;
        await setUser({ name, business });
        document.getElementById('greeting').textContent = `Hello, ${name}!`;
        showView('home');
        updateHomeStats();
        setTimeout(showIncomingNotification, 15000);
    } catch (err) {
        console.error('Camera access error:', err);
        alert('Camera access is required to scan products. Please enable it in your browser settings.');
    }
}

function handleAddProduct() {
    isSelling = false;
    startScanning();
}

function handleSellItem() {
    isSelling = true;
    startScanning();
}

function handleCancelScan() {
    stopCamera();
    clearInterval(scanInterval);
    if (isSelling) {
        showView('home');
    } else {
        showView('products');
    }
}

async function handleSaveProduct(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const name = document.getElementById('add-name').value;
    const price = parseFloat(document.getElementById('add-price').value);
    const stock = parseInt(document.getElementById('add-stock').value);
    const unit = document.getElementById('add-unit').value;
    
    if (id) { // Editing existing product
        await updateProduct(parseInt(id), { name, price, stock, unit });
    } else { // Adding new product
        const image = capturedImage;
        const features = await extractFeatures(image);
        await addProduct({ name, price, stock, unit, image, features });
    }
    
    capturedImage = null;
    closeProductModal();
    showView('products');
}

async function handleConfirmSale() {
    const id = parseInt(document.getElementById('sell-id').value);
    const qty = parseInt(document.getElementById('sell-quantity').value);
    const prod = await getProduct(id);
    
    if (qty > prod.stock) {
        alert('Not enough stock!');
        return;
    }
    
    const total = prod.price * qty;
    await updateStock(id, prod.stock - qty);
    await addSale({ productId: id, quantity: qty, total, date: new Date().toISOString() });
    
    document.getElementById('sell-modal').style.display = 'none';
    showToast('Sale recorded!');
    startScanning(); // Auto start next scan
}

function handleCloseSell() {
    document.getElementById('sell-modal').style.display = 'none';
    stopCamera();
    clearInterval(scanInterval);
    showView('home');
}


// --- Core Flows & UI Updates ---

function startScanning() {
    showView('camera-view', false);
    document.getElementById('scan-message').textContent = isSelling ? 'Scan item to sell' : 'Scan new product to add';
    startCamera();

    if (!isSelling) {
        // Auto-capture for adding a new product
        setTimeout(async () => {
            if (currentView !== 'camera-view') return; // User might have cancelled
            capturedImage = await captureImage();
            stopCamera();
            showConfirmImage(capturedImage);
        }, 3000);
    } else {
        // Continuous scan for selling
        const startTime = Date.now();
        scanInterval = setInterval(async () => {
            const image = await captureImage(false); // Don't stop camera stream
            if (!image) return;

            const features = await extractFeatures(image);
            const products = await getProducts();
            const match = findBestMatch(features, products, 0.85); // Increased threshold for accuracy

            if (match) {
                clearInterval(scanInterval);
                stopCamera();
                showSellModal(match);
            } else if (Date.now() - startTime > 5000) {
                // Not found after 5 seconds
                clearInterval(scanInterval);
                capturedImage = await captureImage();
                stopCamera();
                showToast('not-found-toast', 3000);
                setTimeout(() => showProductModal(capturedImage), 1000);
            }
        }, 500);
    }
}

function findBestMatch(features, products, threshold) {
    let bestMatch = null;
    let bestScore = 0;
    for (let prod of products) {
        const score = cosineSimilarity(features, prod.features);
        if (score > threshold && score > bestScore) {
            bestScore = score;
            bestMatch = prod;
        }
    }
    return bestMatch;
}

function showConfirmImage(imageData) {
    showView('confirm-image', false);
    document.getElementById('confirm-img').src = imageData;
}

function showProductModal(imageData = null) {
    const form = document.getElementById('add-form');
    form.reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('product-modal-title').textContent = 'Add New Product';
    document.getElementById('save-product-btn').innerHTML = '<i class="material-icons">save</i> Save Product';

    if (imageData) {
        capturedImage = imageData;
        document.getElementById('add-image').src = imageData;
        document.getElementById('add-image').style.display = 'block';
    } else {
        document.getElementById('add-image').style.display = 'none';
    }
    
    document.getElementById('product-modal').style.display = 'flex';
    showView(currentView, false); // Hide main view content behind modal
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

async function loadProducts() {
    const grid = document.getElementById('product-grid');
    const emptyView = document.getElementById('empty-products');
    grid.innerHTML = '';
    const products = await getProducts();

    if (products.length === 0) {
        emptyView.style.display = 'block';
        grid.style.display = 'none';
    } else {
        emptyView.style.display = 'none';
        grid.style.display = 'grid';
        products.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${prod.image}" alt="${prod.name}">
                <div class="product-card-info">
                    <h3>${prod.name}</h3>
                    <p class="price">₦${prod.price}</p>
                    <p class="stock">${prod.stock} ${prod.unit} left</p>
                    <button onclick="editProduct(${prod.id})"><i class="material-icons">edit</i> Edit</button>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}

window.editProduct = async (id) => {
    const prod = await getProduct(id);
    document.getElementById('edit-id').value = id;
    document.getElementById('add-name').value = prod.name;
    document.getElementById('add-price').value = prod.price;
    document.getElementById('add-stock').value = prod.stock;
    document.getElementById('add-unit').value = prod.unit;
    document.getElementById('add-image').src = prod.image;
    document.getElementById('add-image').style.display = 'block';
    
    document.getElementById('product-modal-title').textContent = 'Edit Product';
    document.getElementById('save-product-btn').innerHTML = '<i class="material-icons">update</i> Update Product';
    
    document.getElementById('product-modal').style.display = 'flex';
};

function showSellModal(prod) {
    document.getElementById('sell-id').value = prod.id;
    document.getElementById('sell-image').src = prod.image;
    document.getElementById('sell-name').textContent = prod.name;
    document.getElementById('sell-price').textContent = prod.price;
    document.getElementById('sell-quantity').value = 1;
    document.getElementById('sell-total').textContent = prod.price;
    document.getElementById('sell-modal').style.display = 'flex';
}

async function updateSellTotal() {
    const prodId = parseInt(document.getElementById('sell-id').value);
    const prod = await getProduct(prodId);
    if (!prod) return;
    const qty = parseInt(document.getElementById('sell-quantity').value) || 0;
    document.getElementById('sell-total').textContent = (prod.price * qty).toFixed(2);
}

async function updateHomeStats() {
    const sales = await getSales();
    const today = new Date().toISOString().slice(0, 10);
    
    const todaySales = sales.filter(s => s.date.startsWith(today));
    
    let totalSales = 0;
    let itemsSold = 0;
    todaySales.forEach(s => {
        totalSales += s.total;
        itemsSold += s.quantity;
    });
    
    document.getElementById('total-sales').textContent = `₦${totalSales.toLocaleString()}`;
    document.getElementById('items-sold').textContent = itemsSold;

    const list = document.getElementById('sales-list');
    list.innerHTML = '';
    const recent = sales.slice(-5).reverse();
    if(recent.length === 0){
        list.innerHTML = '<li>No sales recorded yet.</li>';
        return;
    }
    for (let s of recent) {
        const prod = await getProduct(s.productId);
        if (!prod) continue;
        const li = document.createElement('li');
        li.innerHTML = `<span>${s.quantity} x ${prod.name}</span> <span>₦${s.total.toLocaleString()}</span>`;
        list.appendChild(li);
    }
}


// --- Notifications ---
function showToast(elementId, duration = 2000) {
    const toast = document.getElementById(elementId);
    if(toast) {
        toast.style.display = 'flex';
        setTimeout(() => {
            toast.style.display = 'none';
        }, duration);
    }
}

function showIncomingNotification() {
    const toast = document.getElementById('incoming-toast');
    toast.style.display = 'flex';
}

function showIncomingModal() {
    document.getElementById('incoming-toast').style.display = 'none';
    document.getElementById('incoming-modal').style.display = 'flex';
}

// --- App Initialization ---
initApp();