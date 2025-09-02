// camera.js
let stream;
let mobilenetModel;

async function loadModel() {
    mobilenetModel = await mobilenet.load();
    return mobilenetModel;
}

async function requestCameraPermission() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        stream.getTracks().forEach(track => track.stop());
    } catch (err) {
        console.error('Camera permission denied', err);
    }
}

async function startCamera(videoId) {
    const video = document.getElementById(videoId);
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

function captureImage(videoId) {
    const video = document.getElementById(videoId);
    const canvas = document.getElementById('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg');
}

async function extractFeatures(imageData) {
    const img = new Image();
    img.src = imageData;
    await img.decode();
    const tfImg = tf.browser.fromPixels(img);
    const logits = mobilenetModel.infer(tfImg, true);
    const features = logits.dataSync();
    tfImg.dispose();
    logits.dispose();
    return Array.from(features);
}

function cosineSimilarity(a, b) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function findMatch(imageData) {
    const features = await extractFeatures(imageData);
    const products = await getProducts();
    let bestMatch = null;
    let bestScore = 0;
    products.forEach(p => {
        const score = cosineSimilarity(features, p.features);
        if (score > bestScore && score > 0.8) { // Threshold
            bestScore = score;
            bestMatch = p;
        }
    });
    return bestMatch;
}