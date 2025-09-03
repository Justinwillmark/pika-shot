const Camera = {
    videoElement: document.getElementById('camera-feed'),
    qrCanvas: document.getElementById('qr-canvas-helper'),
    model: null,
    stream: null,
    isScanning: false,
    scanTimeout: null,
    captureTimeout: null,

    async init() {
        try {
            this.model = await mobilenet.load();
            console.log('MobileNet model loaded.');
        } catch (error) {
            console.error('Failed to load MobileNet model:', error);
            alert('Could not load the recognition engine. Please check your connection and refresh.');
        }
    },

    async start(onCapture, countdownElement = null) {
        if (!this.model) {
            alert('Recognition engine is not ready.');
            return;
        }
        if (this.stream) this.stop();

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            this.videoElement.srcObject = this.stream;
            await this.videoElement.play();

            if(countdownElement) {
                let count = 3;
                countdownElement.textContent = count;
                const interval = setInterval(() => {
                    count--;
                    countdownElement.textContent = count > 0 ? count : '';
                    if (count <= 0) {
                        clearInterval(interval);
                        this.captureAndProcess(onCapture);
                    }
                }, 1000);
            }
        } catch (err) {
            console.error('Error starting camera:', err);
            alert('Could not access the camera. Please grant permission.');
        }
    },

    async startScan(onMatch) {
        return new Promise(async (resolve, reject) => {
            if (!this.model) return reject('Model not loaded');
            if (this.stream) this.stop();

            try {
                this.stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
                });
                this.videoElement.srcObject = this.stream;
                await this.videoElement.play();
                this.isScanning = true;

                const qrContext = this.qrCanvas.getContext('2d');

                const scanLoop = async () => {
                    if (!this.isScanning) return;

                    // QR Code Scanning Logic
                    if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
                        this.qrCanvas.height = this.videoElement.videoHeight;
                        this.qrCanvas.width = this.videoElement.videoWidth;
                        qrContext.drawImage(this.videoElement, 0, 0, this.qrCanvas.width, this.qrCanvas.height);
                        const imageData = qrContext.getImageData(0, 0, this.qrCanvas.width, this.qrCanvas.height);
                        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
                        
                        if (code) {
                            try {
                                const jsonData = JSON.parse(code.data);
                                if (jsonData && jsonData.pikaLogVersion === 1) {
                                    this.stop();
                                    onMatch({ type: 'qrlog', data: jsonData });
                                    return; // Stop the loop
                                }
                            } catch (e) { /* Not a valid JSON QR code, ignore */ }
                        }
                    }

                    // Image Recognition Logic
                    const embedding = this.getEmbedding();
                    if (embedding) {
                        const products = await DB.getAllProducts();
                        let bestMatch = null;
                        let highestSimilarity = 0;
                        const SIMILARITY_THRESHOLD = 0.85;

                        for (const product of products) {
                            if (product.embedding) {
                                const similarity = this.cosineSimilarity(embedding, product.embedding);
                                if (similarity > highestSimilarity) {
                                    highestSimilarity = similarity;
                                    bestMatch = product;
                                }
                            }
                        }

                        if (highestSimilarity > SIMILARITY_THRESHOLD) {
                            this.stop();
                            onMatch({ type: 'product', data: bestMatch });
                            return; // Stop the loop
                        }
                    }
                    requestAnimationFrame(scanLoop);
                };
                scanLoop();
                
                this.scanTimeout = setTimeout(async () => {
                    if (this.isScanning) {
                        const { blob, embedding } = await this.captureAndProcess(() => {});
                        this.stop();
                        resolve({ reason: 'notFound', blob, embedding });
                    }
                }, 4000);

            } catch (err) {
                reject(err);
            }
        });
    },

    stop() {
        this.isScanning = false;
        clearTimeout(this.scanTimeout);
        clearTimeout(this.captureTimeout);
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.videoElement.srcObject = null;
    },

    async captureAndProcess(callback) {
        const canvas = document.createElement('canvas');
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        const embedding = this.getEmbedding(canvas);
        
        this.stop();
        if (callback) callback(blob, embedding);
        return { blob, embedding };
    },

    getEmbedding(source) {
        if (!this.model) return null;
        source = source || this.videoElement;
        // Ensure source is ready
        if (!source.videoWidth && !source.width) return null;

        return tf.tidy(() => {
            const img = tf.browser.fromPixels(source);
            const resized = tf.image.resizeBilinear(img, [224, 224]);
            const batched = resized.expandDims(0);
            const preprocessed = batched.toFloat().div(tf.scalar(127.5)).sub(tf.scalar(1));
            const embedding = this.model.infer(preprocessed, true);
            return embedding.dataSync();
        });
    },

    cosineSimilarity(vecA, vecB) {
        const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
        const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
        const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
        if (magnitudeA === 0 || magnitudeB === 0) return 0;
        return dotProduct / (magnitudeA * magnitudeB);
    }
};