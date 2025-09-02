let stream;
let model;

async function loadModel() {
    model = await mobilenet.load();
}

async function startCamera() {
    const video = document.getElementById('video');
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = stream;
}

function stopCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
}

async function captureImage(stop = true) {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas') || document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    if (stop) stopCamera();
    return canvas.toDataURL('image/jpeg');
}

async function extractFeatures(imageData) {
    const img = new Image();
    img.src = imageData;
    await new Promise(r => img.onload = r);
    const tfImg = tf.browser.fromPixels(img);
    const embeddings = await model.infer(tfImg, true);
    const features = embeddings.arraySync()[0];
    tfImg.dispose();
    embeddings.dispose();
    return features;
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