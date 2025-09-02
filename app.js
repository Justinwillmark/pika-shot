let deferredPrompt;
let currentView = 'home';
let capturedImage = null;
let isSelling = false;
let scanTimeout;
let currentProductId = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-btn').style.display = 'block';
});

document.getElementById('install-btn').addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted');
            }
            deferredPrompt = null;
        });
    }
});

async function initApp() {
    document.getElementById('loading-spinner').style.display = 'flex';
    await initDB();
    await loadModel(); // From camera.js
    const user = await getUser();
    document.getElementById('loading-spinner').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    if (!user) {
        showView('onboarding');
    } else {
        showView('home');
        updateHomeStats();
        setTimeout(showIncomingNotification, 15000);
    }
}

function showView(viewId) {
    const views = document.querySelectorAll('.view');
    views.forEach(v => v.style.display = 'none');
    document.getElementById(viewId).style.display = 'block';
    currentView = viewId;
}

document.getElementById('onboard-next').addEventListener('click', () => {
    const name = document.getElementById('user-name').value;
    const business = document.getElementById('business-name').value;
    if (name && business) {
        document.getElementById('camera-explain').style.display = 'block';
        document.getElementById('onboard-next').style.display = 'none';
    }
});

document.getElementById('grant-camera').addEventListener('click', async () => {
    try {
        await startCamera(); // Test access
        stopCamera();
        const name = document.getElementById('user-name').value;
        const business = document.getElementById('business-name').value;
        await setUser({ name, business });
        showView('home');
        updateHomeStats();
        setTimeout(showIncomingNotification, 15000);
    } catch (err) {
        alert('Camera access denied. App may not work fully.');
    }
});

document.getElementById('to-products').addEventListener('click', () => {
    showView('products');
    loadProducts();
});

document.getElementById('back-to-home').addEventListener('click', () => {
    showView('home');
    updateHomeStats();
});

document.getElementById('add-product').addEventListener('click', () => {
    isSelling = false;
    startScanning();
});

document.getElementById('to-sell').addEventListener('click', () => {
    isSelling = true;
    startScanning();
});

function startScanning() {
    showView('camera-view');
    document.getElementById('scan-message').textContent = isSelling ? 'Scanning for product to sell...' : 'Scanning to add product...';
    startCamera();
    if (!isSelling) {
        // Auto capture after 3s for add
        setTimeout(async () => {
            capturedImage = await captureImage();
            stopCamera();
            showConfirmImage(capturedImage);
        }, 3000);
    } else {
        // Continuous scan for sell
        let startTime = Date.now();
        scanInterval = setInterval(async () => {
            const image = await captureImage(false); // Don't stop camera
            const features = await extractFeatures(image);
            const products = await getProducts();
            let bestMatch = null;
            let bestScore = 0;
            for (let prod of products) {
                const score = cosineSimilarity(features, prod.features);
                if (score > 0.8 && score > bestScore) { // Threshold
                    bestScore = score;
                    bestMatch = prod;
                }
            }
            if (bestMatch) {
                clearInterval(scanInterval);
                stopCamera();
                showSellModal(bestMatch);
            } else if (Date.now() - startTime > 5000) {
                clearInterval(scanInterval);
                capturedImage = await captureImage();
                stopCamera();
                document.getElementById('not-found-toast').style.display = 'block';
                setTimeout(() => {
                    document.getElementById('not-found-toast').style.display = 'none';
                    showAddProduct(capturedImage);
                }, 2000);
            }
        }, 500);
    }
}

document.getElementById('cancel-scan').addEventListener('click', () => {
    stopCamera();
    if (isSelling) {
        showView('home');
    } else {
        showView('products');
    }
    clearInterval(scanInterval);
});

function showConfirmImage(imageData) {
    showView('confirm-image');
    document.getElementById('confirm-img').src = imageData;
}

document.getElementById('confirm-yes').addEventListener('click', () => {
    showAddProduct(capturedImage);
});

document.getElementById('confirm-no').addEventListener('click', () => {
    startScanning();
});

function showAddProduct(imageData) {
    showView('add-product');
    document.getElementById('add-image').src = imageData;
}

document.getElementById('add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('add-name').value;
    const price = parseFloat(document.getElementById('add-price').value);
    const stock = parseInt(document.getElementById('add-stock').value);
    const unit = document.getElementById('add-unit').value;
    const image = capturedImage;
    const features = await extractFeatures(image);
    await addProduct({ name, price, stock, unit, image, features });
    capturedImage = null;
    showView('products');
    loadProducts();
});

document.getElementById('cancel-add').addEventListener('click', () => {
    showView('products');
});

async function loadProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    const products = await getProducts();
    products.forEach(prod => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${prod.image}" alt="${prod.name}">
            <h3>${prod.name}</h3>
            <p>₦${prod.price}</p>
            <p>${prod.stock} ${prod.unit} left</p>
            <button onclick="editProduct(${prod.id})"><i class="material-icons">edit</i> Edit</button>
        `;
        grid.appendChild(card);
    });
}

window.editProduct = async (id) => {
    const prod = await getProduct(id);
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-name').value = prod.name;
    document.getElementById('edit-price').value = prod.price;
    document.getElementById('edit-stock').value = prod.stock;
    document.getElementById('edit-unit').value = prod.unit;
    document.getElementById('edit-image').src = prod.image;
    document.getElementById('edit-modal').style.display = 'flex';
};

document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('edit-id').value);
    const name = document.getElementById('edit-name').value;
    const price = parseFloat(document.getElementById('edit-price').value);
    const stock = parseInt(document.getElementById('edit-stock').value);
    const unit = document.getElementById('edit-unit').value;
    // Image and features not updated for simplicity
    await updateProduct(id, { name, price, stock, unit });
    document.getElementById('edit-modal').style.display = 'none';
    loadProducts();
});

document.getElementById('close-edit').addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
});

function showSellModal(prod) {
    document.getElementById('sell-id').value = prod.id;
    document.getElementById('sell-image').src = prod.image;
    document.getElementById('sell-name').textContent = prod.name;
    document.getElementById('sell-price').textContent = prod.price;
    document.getElementById('sell-quantity').value = 1;
    updateSellTotal(prod.price * 1);
    document.getElementById('sell-modal').style.display = 'flex';
}

document.getElementById('sell-quantity').addEventListener('input', () => {
    const prodId = parseInt(document.getElementById('sell-id').value);
    getProduct(prodId).then(prod => {
        const qty = parseInt(document.getElementById('sell-quantity').value) || 0;
        updateSellTotal(prod.price * qty);
    });
});

function updateSellTotal(total) {
    document.getElementById('sell-total').textContent = total;
}

document.getElementById('confirm-sale').addEventListener('click', async () => {
    const id = parseInt(document.getElementById('sell-id').value);
    const qty = parseInt(document.getElementById('sell-quantity').value);
    const prod = await getProduct(id);
    if (qty > prod.stock) {
        alert('Not enough stock!');
        return;
    }
    const total = prod.price * qty;
    await updateStock(id, prod.stock - qty);
    await addSale({ productId: id, quantity: qty, total, date: new Date() });
    document.getElementById('sell-modal').style.display = 'none';
    // Auto start next scan
    startScanning();
});

document.getElementById('close-sell').addEventListener('click', () => {
    document.getElementById('sell-modal').style.display = 'none';
    showView('home');
});

async function updateHomeStats() {
    const sales = await getSales();
    let totalSales = 0;
    let itemsSold = 0;
    sales.forEach(s => {
        totalSales += s.total;
        itemsSold += s.quantity;
    });
    document.getElementById('total-sales').textContent = `₦${totalSales}`;
    document.getElementById('items-sold').textContent = itemsSold;

    const list = document.getElementById('sales-list');
    list.innerHTML = '';
    const recent = sales.slice(-5).reverse();
    for (let s of recent) {
        const prod = await getProduct(s.productId);
        const li = document.createElement('li');
        li.innerHTML = `<span>${s.quantity} x ${prod.name}</span> <span>₦${s.total}</span>`;
        list.appendChild(li);
    }
}

function showIncomingNotification() {
    document.getElementById('incoming-toast').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('incoming-toast').style.display = 'none';
    }, 5000);
}

document.getElementById('view-incoming').addEventListener('click', () => {
    document.getElementById('incoming-toast').style.display = 'none';
    document.getElementById('incoming-modal').style.display = 'flex';
});

document.getElementById('accept-incoming').addEventListener('click', () => {
    document.getElementById('incoming-modal').style.display = 'none';
    // Simulate accept, no action
});

document.getElementById('decline-incoming').addEventListener('click', () => {
    document.getElementById('incoming-modal').style.display = 'none';
});

initApp();