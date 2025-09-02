const camera = (() => {
    const videoElement = document.getElementById('camera-feed');
    let stream;
    let mobilenetModel;
    let embeddingModel;
    let scanningInterval;
    const SCAN_TIMEOUT = 5000; // 5 seconds
    const SIMILARITY_THRESHOLD = 0.85;

    async function init() {
        console.log("Loading MobileNet model...");
        mobilenetModel = await mobilenet.load();
        const layer = mobilenetModel.infer(tf.zeros([1, 224, 224, 3]), true);
        embeddingModel = tf.model({inputs: mobilenetModel.inputs, outputs: layer});
        console.log("Model loaded and embedding layer extracted.");
    }
    
    async function requestPermission() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            return stream;
        } catch (err) {
            console.error("Camera access denied:", err);
            return null;
        }
    }

    async function start() {
        if (!stream || !stream.active) {
            stream = await requestPermission();
            if (!stream) return false;
        }
        videoElement.srcObject = stream;
        videoElement.play();
        return true;
    }
    
    function stop() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        if (scanningInterval) {
            clearInterval(scanningInterval);
            scanningInterval = null;
        }
    }
    
    function captureFrameToBlob() {
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    }

    async function captureImageWithAutoCapture() {
        await start();
        return new Promise((resolve) => {
            setTimeout(async () => {
                const blob = await captureFrameToBlob();
                stop();
                resolve(blob);
            }, 2000); // Capture after 2 seconds
        });
    }
    
    async function getEmbedding(imageSource) {
        return new Promise(async (resolve, reject) => {
            const img = new Image();
            img.src = (imageSource instanceof Blob) ? URL.createObjectURL(imageSource) : imageSource;
            img.onload = async () => {
                const tensor = tf.browser.fromPixels(img)
                    .resizeNearestNeighbor([224, 224])
                    .toFloat()
                    .expandDims();
                const embedding = await embeddingModel.predict(tensor).data();
                tensor.dispose();
                URL.revokeObjectURL(img.src);
                resolve(Array.from(embedding));
            };
            img.onerror = reject;
        });
    }

    function cosineSimilarity(vecA, vecB) {
        let dotProduct = 0.0;
        let normA = 0.0;
        let normB = 0.0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    
    async function findClosestProduct(liveEmbedding, allProducts) {
        if (allProducts.length === 0) return null;

        let bestMatch = null;
        let highestSimilarity = -1;

        for (const product of allProducts) {
            if (product.embedding) {
                const similarity = cosineSimilarity(liveEmbedding, product.embedding);
                if (similarity > highestSimilarity) {
                    highestSimilarity = similarity;
                    bestMatch = product;
                }
            }
        }
        
        return (highestSimilarity >= SIMILARITY_THRESHOLD) ? bestMatch : null;
    }

    async function startScanning(onFound, onNotFound) {
        await start();
        const allProducts = await db.getAllProducts();
        let found = false;
        
        const timeoutId = setTimeout(async () => {
            clearInterval(scanningInterval);
            if (!found) {
                const lastFrame = await captureFrameToBlob();
                stop();
                onNotFound(lastFrame);
            }
        }, SCAN_TIMEOUT);

        scanningInterval = setInterval(async () => {
            const liveEmbedding = await getEmbedding(videoElement);
            const match = await findClosestProduct(liveEmbedding, allProducts);
            if (match) {
                found = true;
                clearInterval(scanningInterval);
                clearTimeout(timeoutId);
                stop();
                onFound(match);
            }
        }, 500); // Scan every 500ms
    }

    return { init, requestPermission, stop, captureImageWithAutoCapture, getEmbedding, startScanning };
})();