const Camera = {
    videoElement: document.getElementById('camera-feed'),
    qrCanvas: document.getElementById('qr-canvas-helper'),
    model: null,
    stream: null,
    isScanning: false,
    scanTimeout: null,
    countdownInterval: null,
    barcodeDetector: null,

    async init() {
        try {
            // Load image recognition model
            this.model = await mobilenet.load();
            console.log('MobileNet model loaded.');
        } catch (error) {
            console.error('Failed to load MobileNet model:', error);
            // Don't alert here, let the app decide how to handle it (e.g., disable AI features)
        }

        // Initialize Barcode Detector
        if ('BarcodeDetector' in window) {
            try {
                this.barcodeDetector = new window.BarcodeDetector();
                console.log('Barcode Detector initialized.');
            } catch (e) {
                console.error('Barcode Detector is supported, but failed to initialize:', e);
                this.barcodeDetector = null;
            }
        } else {
            console.warn('Barcode Detector API not supported in this browser.');
        }
    },
    
    _startCountdown(duration, countdownElement) {
        let count = duration;
        countdownElement.textContent = count;
        this.countdownInterval = setInterval(() => {
            count--;
            countdownElement.textContent = count > 0 ? count : '';
        }, 1000);
    },
    
    async _startStream() {
        if (this.stream) this.stop();
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            this.videoElement.srcObject = this.stream;
            await this.videoElement.play();
            this.isScanning = true;
            return true;
        } catch (err) {
            console.error('Error starting camera:', err);
            alert('Could not access the camera. Please grant permission and try again.');
            return false;
        }
    },

    async startAddScan(onResult, countdownElement) {
        return new Promise(async (resolve, reject) => {
            if (!this.barcodeDetector && !this.model) {
                return reject('No scanning models are ready.');
            }
            if (!await this._startStream()) return reject('Could not start camera stream.');
            
            this._startCountdown(4, countdownElement);

            const scanLoop = async () => {
                if (!this.isScanning) return;

                if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
                    // 1. Barcode and pika-log QR Scan
                    if (this.barcodeDetector) {
                        try {
                            const barcodes = await this.barcodeDetector.detect(this.videoElement);
                            if (barcodes.length > 0) {
                                const detectedValue = barcodes[0].rawValue;
                                // Check if it's a pika-log
                                try {
                                    const jsonData = JSON.parse(detectedValue);
                                    if (jsonData && jsonData.pikaLogVersion === 1) {
                                        this.stop();
                                        onResult({ type: 'qrlog', data: jsonData });
                                        resolve();
                                        return;
                                    }
                                } catch (e) { /* Not a pika log, treat as regular barcode */ }
                                
                                // It's a regular barcode
                                this.stop();
                                onResult({ type: 'barcode', data: detectedValue });
                                resolve();
                                return;
                            }
                        } catch (e) {
                             console.error("Barcode detection failed:", e);
                        }
                    }
                }
                requestAnimationFrame(scanLoop);
            };
            scanLoop();

            // 4-second timeout to capture a photo if no barcode is found
            this.scanTimeout = setTimeout(async () => {
                if (this.isScanning) {
                    const { blob, embedding } = await this.captureAndProcess();
                    onResult({ type: 'capture', blob, embedding });
                    resolve();
                }
            }, 4000);
        });
    },

    async startSellScan(onMatch, onNotFound, countdownElement) {
        return new Promise(async (resolve, reject) => {
            if (!this.barcodeDetector && !this.model) {
                return reject('No scanning models are ready.');
            }
            if (!await this._startStream()) return reject('Could not start camera stream.');

            this._startCountdown(3, countdownElement);

            const scanLoop = async () => {
                if (!this.isScanning) return;

                if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
                    // 1. Barcode Scan
                    if (this.barcodeDetector) {
                        try {
                            const barcodes = await this.barcodeDetector.detect(this.videoElement);
                            if (barcodes.length > 0) {
                                const product = await DB.getProductByBarcode(barcodes[0].rawValue);
                                if (product) {
                                    this.stop();
                                    onMatch(product);
                                    resolve();
                                    return;
                                }
                            }
                        } catch (e) {
                             console.error("Barcode detection failed:", e);
                        }
                    }

                    // 2. Image Recognition Scan
                    if (this.model) {
                        const embedding = this.getEmbedding();
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
                            onMatch(bestMatch);
                            resolve();
                            return;
                        }
                    }
                }
                requestAnimationFrame(scanLoop);
            };
            scanLoop();

            // 3-second timeout if nothing is found
            this.scanTimeout = setTimeout(() => {
                if (this.isScanning) {
                    this.stop();
                    onNotFound();
                    resolve();
                }
            }, 3000);
        });
    },

    stop() {
        this.isScanning = false;
        clearTimeout(this.scanTimeout);
        clearInterval(this.countdownInterval);
        this.scanTimeout = null;
        this.countdownInterval = null;
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.videoElement.srcObject = null;
    },

    async captureAndProcess() {
        if (!this.videoElement.videoWidth) return { blob: null, embedding: null };
        const canvas = document.createElement('canvas');
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        const embedding = this.getEmbedding(canvas);
        
        this.stop();
        return { blob, embedding };
    },

    getEmbedding(source) {
        if (!this.model) return null;
        source = source || this.videoElement;
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