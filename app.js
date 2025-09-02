// app.js
let deferredPrompt;
let model;
let currentView = 'loading';
let currentProductId = null;
let capturedImage = null;
let sellInterval = null;
let lastCaptured = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-btn').classList.remove('hidden');
});

document.getElementById('install-btn').addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt = null;
    }
});

async function initApp() {
    document.getElementById('loading-spinner').style.display = 'block';
    await initDB();
    model = await loadModel();
    const user = await getUser();
    if (!user) {
        showView('onboarding');
    } else {
        showView('home');
        updateHome();
    }
    document.getElementById('loading-spinner').style.display = 'none';

    setTimeout(showToast, 15000);
}

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(viewId).classList.remove('hidden');
    currentView = viewId;
}

document.getElementById('onboard-next').addEventListener('click', () => {
    const name = document.getElementById('user-name').value;
    const business = document.getElementById('business-name').value;
    if (name && business) {
        document.getElementById('permission-explain').classList.remove('hidden');
    }
});

document.getElementById('grant-permission').addEventListener('click', async () => {
    await requestCameraPermission();
    const name = document.getElementById('user-name').value;
    const business = document.getElementById('business-name').value;
    await saveUser({ name, business });
    showView('home');
    updateHome();
});

document.getElementById('to-products').addEventListener('click', () => {
    showView('my-products');
    loadProducts();
});

document.getElementById('back-to-home-from-products').addEventListener('click', () => showView('home'));

document.getElementById('add-product').addEventListener('click', () => {
    showView('add-product-view');
    startAddScan();
});

document.getElementById('cancel-add').addEventListener('click', () => {
    stopCamera();
    showView('my-products');
});

document.getElementById('cancel-scan-add').addEventListener('click', () => {
    stopCamera();
    showView('my-products');
});

async function startAddScan() {
    await startCamera('add-video');
    let countdown = 3;
    const cdElem = document.getElementById('add-countdown');
    cdElem.textContent = countdown;
    const interval = setInterval(() => {
        countdown--;
        cdElem.textContent = countdown;
        if (countdown === 0) {
            clearInterval(interval);
            capturedImage = captureImage('add-video');
            showConfirmCapture();
        }
    }, 1000);
}

function showConfirmCapture() {
    stopCamera();
    document.getElementById('camera-container').classList.add('hidden');
    const confirmDiv = document.getElementById('confirm-capture');
    confirmDiv.classList.remove('hidden');
    document.getElementById('captured-img').src = capturedImage;
}

document.getElementById('try-again').addEventListener('click', () => {
    confirmDiv.classList.add('hidden');
    document.getElementById('camera-container').classList.remove('hidden');
    startAddScan();
});

document.getElementById('confirm-img').addEventListener('click', () => {
    document.getElementById('confirm-capture').classList.add('hidden');
    document.getElementById('product-form').classList.remove('hidden');
});

document.getElementById('save-product').addEventListener('click', async () => {
    const name = document.getElementById('product-name').value;
    const price = parseFloat(document.getElementById('product-price').value);
    const stock = parseInt(document.getElementById('product-stock').value);
    const unit = document.getElementById('product-unit').value;
    if (name && price && stock && unit) {
        const features = await extractFeatures(capturedImage);
        await addProduct({ name, price, stock, unit, image: capturedImage, features });
        showView('my-products');
        loadProducts();
    }
});

async function loadProducts() {
    const products = await getProducts();
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    products.forEach(p => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.innerHTML = `
            <img src="${p.image}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>₦${p.price} / ${p.unit}</p>
            <p>${p.stock} left</p>
            <button onclick="editProduct(${p.id})">Edit</button>
        `;
        grid.appendChild(card);
    });
}

window.editProduct = async (id) => {
    const product = await getProduct(id);
    currentProductId = id;
    showView('edit-product-view');
    document.getElementById('edit-img').src = product.image;
    document.getElementById('edit-name').value = product.name;
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-stock').value = product.stock;
    document.getElementById('edit-unit').value = product.unit;
};

document.getElementById('update-product').addEventListener('click', async () => {
    const name = document.getElementById('edit-name').value;
    const price = parseFloat(document.getElementById('edit-price').value);
    const stock = parseInt(document.getElementById('edit-stock').value);
    const unit = document.getElementById('edit-unit').value;
    if (name && price && stock && unit) {
        await updateProduct(currentProductId, { name, price, stock, unit });
        showView('my-products');
        loadProducts();
    }
});

document.getElementById('back-to-products-from-edit').addEventListener('click', () => {
    showView('my-products');
});

document.getElementById('to-sell').addEventListener('click', () => {
    showView('sell-view');
    startSellScan();
});

document.getElementById('cancel-sell').addEventListener('click', () => {
    stopSellScan();
    showView('home');
});

document.getElementById('cancel-scan-sell').addEventListener('click', () => {
    stopSellScan();
    showView('home');
});

async function startSellScan() {
    await startCamera('sell-video');
    let timeLeft = 5;
    const timerElem = document.getElementById('sell-timer');
    timerElem.textContent = `Scanning... ${timeLeft}s`;
    sellInterval = setInterval(async () => {
        timeLeft--;
        timerElem.textContent = `Scanning... ${timeLeft}s`;
        const frame = captureImage('sell-video');
        lastCaptured = frame;
        const match = await findMatch(frame);
        if (match) {
            stopSellScan();
            showSellConfirm(match);
        } else if (timeLeft === 0) {
            stopSellScan();
            showNotFound();
        }
    }, 1000);
}

function stopSellScan() {
    clearInterval(sellInterval);
    stopCamera();
}

async function showSellConfirm(product) {
    document.getElementById('sell-camera-container').classList.add('hidden');
    const confirmDiv = document.getElementById('sell-confirm');
    confirmDiv.classList.remove('hidden');
    document.getElementById('sell-img').src = product.image;
    document.getElementById('sell-name').textContent = product.name;
    document.getElementById('sell-price').textContent = product.price;
    const qtyInput = document.getElementById('sell-quantity');
    qtyInput.addEventListener('input', () => {
        const total = qtyInput.value * product.price;
        document.getElementById('sell-total').textContent = total;
    });
    document.getElementById('confirm-sale').onclick = async () => {
        const quantity = parseInt(qtyInput.value);
        if (quantity > 0 && quantity <= product.stock) {
            const total = quantity * product.price;
            await addSale({ product_id: product.id, quantity, total, date: new Date() });
            await updateProduct(product.id, { stock: product.stock - quantity });
            showView('home');
            updateHome();
            // Auto restart scan
            showView('sell-view');
            startSellScan();
        }
    };
}

function showNotFound() {
    document.getElementById('sell-camera-container').classList.add('hidden');
    const nfDiv = document.getElementById('not-found');
    nfDiv.classList.remove('hidden');
    document.getElementById('not-found-img').src = lastCaptured;
    capturedImage = lastCaptured;
    document.getElementById('save-not-found').onclick = async () => {
        const name = document.getElementById('not-found-name').value;
        const price = parseFloat(document.getElementById('not-found-price').value);
        const stock = parseInt(document.getElementById('not-found-stock').value);
        const unit = document.getElementById('not-found-unit').value;
        if (name && price && stock && unit) {
            const features = await extractFeatures(capturedImage);
            const newProduct = await addProduct({ name, price, stock, unit, image: capturedImage, features });
            // Now sell
            showSellConfirm(newProduct);
            nfDiv.classList.add('hidden');
        }
    };
}

async function updateHome() {
    const sales = await getSales();
    const today = new Date().toDateString();
    const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
    const totalSales = todaySales.reduce((sum, s) => sum + s.total, 0);
    const itemsSold = todaySales.reduce((sum, s) => sum + s.quantity, 0);
    const products = await getProducts();
    const lowStock = products.filter(p => p.stock < 10).length;
    document.getElementById('total-sales').textContent = `₦${totalSales}`;
    document.getElementById('items-sold').textContent = itemsSold;
    document.getElementById('low-stock').textContent = lowStock;

    const list = document.getElementById('recent-sales-list');
    list.innerHTML = '';
    todaySales.slice(0, 5).forEach(async s => {
        const product = await getProduct(s.product_id);
        const li = document.createElement('li');
        li.textContent = `${s.quantity} ${product.unit} of ${product.name} for ₦${s.total}`;
        list.appendChild(li);
    });
}

function showToast() {
    document.getElementById('toast').classList.remove('hidden');
}

document.getElementById('view-items').addEventListener('click', () => {
    document.getElementById('toast').classList.add('hidden');
    document.getElementById('communal-modal').classList.remove('hidden');
});

document.getElementById('accept-communal').addEventListener('click', () => {
    document.getElementById('communal-modal').classList.add('hidden');
    // Simulate accept, perhaps alert
    alert('Accepted!');
});

document.getElementById('decline-communal').addEventListener('click', () => {
    document.getElementById('communal-modal').classList.add('hidden');
    alert('Declined.');
});

initApp();