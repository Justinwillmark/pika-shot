let model;
let cameraStream;
let isPredicting = false;
let currentCameraAction; // 'sell' or 'addProduct'

const camera = {
    view: document.getElementById('camera-view'),
    box: document.getElementById('camera-box'),
    instruction: document.getElementById('camera-instruction'),
    feedback: document.getElementById('scan-feedback'),
};

async function loadModel() {
    console.log('Loading AI model...');
    try {
        model = await mobilenet.load({version: 2, alpha: 0.5});
        console.log('AI Model loaded.');
    } catch (err) {
        console.error("Failed to load model", err);
    }
}

// NEW: Gracefully request camera access
async function requestCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        // We got permission. Stop the stream immediately, we'll start it for real later.
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (err) {
        console.error("Camera permission denied", err);
        alert("Camera access is needed to scan products. Please allow camera access in your browser settings.");
        return false;
    }
}

async function startCamera(action) {
    if (!model) { alert("AI model is still loading, please wait."); return; }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        camera.view.srcObject = stream;
        cameraStream = stream;
        isPredicting = true;
        currentCameraAction = action;

        camera.box.classList.add('scanning');

        if (action === 'sell') {
            camera.instruction.textContent = "Scan item to sell";
            predictLoop();
        } else if (action === 'addProduct') {
            camera.instruction.textContent = "Hold product steady...";
            // NEW: Auto-capture after a short delay
            setTimeout(captureNewProduct, 2500); 
        }
    } catch (err) {
        console.error("Error accessing camera", err);
        // This shouldn't happen if permission was granted during onboarding
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    isPredicting = false;
    camera.view.srcObject = null;
    camera.box.classList.remove('scanning');
}

async function predictLoop() {
    if (!isPredicting) return;

    try {
        const embedding = getEmbeddingFromFrame();
        const matchedProduct = await getProductByEmbedding(embedding);

        if (matchedProduct) {
            isPredicting = false; // Stop loop
            showScanFeedback(`✅ Found: ${matchedProduct.name}`, true);
            setTimeout(() => {
                stopCamera();
                showSaleConfirmation(matchedProduct);
            }, 1000); // Wait a moment so user sees feedback
        }
    } catch (error) {
        // Fail silently and continue
    }
    
    // Continue loop if not stopped
    if (isPredicting) requestAnimationFrame(predictLoop);
}

// NEW: Automatically capture a new product
async function captureNewProduct() {
    if (!isPredicting) return; // If user cancelled
    isPredicting = false;
    
    const embedding = getEmbeddingFromFrame();
    const imageDataUrl = captureFrameAsDataURL();
    
    stopCamera();
    showAddProductModal({ embedding, imageDataUrl });
}

function getEmbeddingFromFrame() {
    return tf.tidy(() => {
        const frame = tf.browser.fromPixels(camera.view);
        // Resize to a smaller resolution for performance
        const resized = tf.image.resizeBilinear(frame, [224, 224]);
        const normalized = resized.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1.0));
        const expanded = normalized.expandDims(0);
        const embedding = model.infer(expanded, 'mobilenet_1.0_224/features');
        return embedding.dataSync();
    });
}

// NEW: Captures the current camera frame and compresses it
function captureFrameAsDataURL() {
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(camera.view, 0, 0, 224, 224);
    // Compress image as JPEG for smaller storage size
    return canvas.toDataURL('image/jpeg', 0.8); 
}

// NEW: Visual feedback for scanning
function showScanFeedback(message, isSuccess) {
    camera.feedback.textContent = message;
    camera.feedback.style.backgroundColor = isSuccess ? 'var(--success-color)' : 'var(--danger-color)';
    camera.feedback.classList.remove('hidden');
    
    setTimeout(() => {
        camera.feedback.classList.add('hidden');
    }, 1500);
}