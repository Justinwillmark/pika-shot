let stream;
let model;

async function loadModel() {
    console.log("Loading MobileNet model...");
    try {
        model = await mobilenet.load();
        console.log("Model loaded successfully.");
    } catch (err) {
        console.error("Failed to load model:", err);
    }
}

async function startCamera() {
    const video = document.getElementById('video');
    try {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 640 },
                height: { ideal: 480 }
            } 
        });
        video.srcObject = stream;
        await video.play();
    } catch (err) {
        console.error("Camera access denied:", err);
        throw err;
    }
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

async function captureImage(stop = true) {
    const video = document.getElementById('video');
    if (!video.srcObject) return null; // Camera not active
    
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    if (stop) stopCamera();
    
    return canvas.toDataURL('image/jpeg', 0.9); // Use JPEG for smaller size
}

async function extractFeatures(imageData) {
    if (!model) {
        console.error("Model not loaded!");
        return null;
    }
    const img = new Image();
    img.src = imageData;
    await new Promise(r => img.onload = r);

    return tf.tidy(() => {
        const tfImg = tf.browser.fromPixels(img).toFloat();
        const normalized = tfImg.div(255.0); // Normalize to [0, 1]
        const resized = tf.image.resizeBilinear(normalized, [224, 224]); // MobileNet input size
        const embeddings = model.infer(resized, true);
        return embeddings.arraySync()[0];
    });
}

function cosineSimilarity(a, b) {
    if (!a || !b) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dot / denominator;
}