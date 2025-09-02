let model;
let cameraStream;
let isPredicting = false;
let currentCameraAction;
let predictionTimeout;

const camera = {
    view: document.getElementById('camera-view'),
    instruction: document.getElementById('camera-instruction'),
};

async function loadModel() {
    try {
        model = await mobilenet.load({ version: 2, alpha: 0.75 });
        console.log('AI Model loaded.');
    } catch (err) { console.error("Failed to load model", err); }
}

async function requestCameraPermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        stream.getTracks().forEach(track => track.stop());
        return true;
    } catch (err) {
        alert("Camera access is needed to scan products. Please allow it in your browser settings and refresh.");
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

        if (action === 'sell') {
            camera.instruction.textContent = "Scanning...";
            predictLoop();
            // NEW: If nothing is found after 5 seconds, trigger "not found" flow
            predictionTimeout = setTimeout(handleProductNotFound, 5000);
        } else if (action === 'addProduct') {
            camera.instruction.textContent = "Hold product steady...";
            setTimeout(captureForConfirmation, 2000); 
        }
    } catch (err) { console.error("Error accessing camera", err); }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
    }
    isPredicting = false;
    clearTimeout(predictionTimeout);
    camera.view.srcObject = null;
}

async function predictLoop() {
    if (!isPredicting) return;
    try {
        const embedding = getEmbeddingFromFrame();
        const matchedProduct = await getProductByEmbedding(embedding);

        if (matchedProduct) {
            isPredicting = false;
            clearTimeout(predictionTimeout);
            stopCamera();
            showSaleConfirmation(matchedProduct);
        }
    } catch (error) { /* Fail silently */ }
    if (isPredicting) requestAnimationFrame(predictLoop);
}

// NEW: Handle scan confirmation
function captureForConfirmation() {
    if (!isPredicting) return;
    isPredicting = false;

    const embedding = getEmbeddingFromFrame();
    const imageDataUrl = captureFrameAsDataURL();
    
    stopCamera();
    showConfirmCaptureModal({ embedding, imageDataUrl });
}

// NEW: Handle product not found during a sale scan
function handleProductNotFound() {
    if (!isPredicting) return; // Already found or cancelled
    isPredicting = false;
    
    const embedding = getEmbeddingFromFrame();
    const imageDataUrl = captureFrameAsDataURL();
    stopCamera();

    alert("Product not found in your records.");
    // Smoothly transition to adding the new product
    showAddProductModal({ embedding, imageDataUrl });
}

function getEmbeddingFromFrame() {
    return tf.tidy(() => {
        const frame = tf.browser.fromPixels(camera.view);
        const resized = tf.image.resizeBilinear(frame, [224, 224]);
        const normalized = resized.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1.0));
        const expanded = normalized.expandDims(0);
        const embedding = model.infer(expanded, 'mobilenet_1.0_224/features');
        return embedding.dataSync();
    });
}

function captureFrameAsDataURL() {
    const canvas = document.createElement('canvas');
    const smallerDim = Math.min(camera.view.videoWidth, camera.view.videoHeight);
    canvas.width = smallerDim;
    canvas.height = smallerDim;
    const sx = (camera.view.videoWidth - smallerDim) / 2;
    const sy = (camera.view.videoHeight - smallerDim) / 2;
    canvas.getContext('2d').drawImage(camera.view, sx, sy, smallerDim, smallerDim, 0, 0, 224, 224);
    return canvas.toDataURL('image/jpeg', 0.85); 
}