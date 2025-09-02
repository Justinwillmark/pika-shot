const Camera = {
    videoElement: document.getElementById('camera-feed'),
    canvasElement: document.getElementById('camera-canvas'),
    stream: null,
    model: null,
    isRunning: false,
    scanTimeout: null,

    async loadModel() {
        if (!this.model) {
            console.log("Loading MobileNet model...");
            this.model = await mobilenet.load();
            console.log("Model loaded.");
        }
    },

    async start(onCaptureCallback, onMatchCallback) {
        if (this.isRunning) return;
        this.isRunning = true;
        
        await this.loadModel();
        
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            this.videoElement.srcObject = this.stream;
            this.videoElement.play();

            // Set canvas dimensions once video is playing
            this.videoElement.onloadedmetadata = () => {
                this.canvasElement.width = this.videoElement.videoWidth;
                this.canvasElement.height = this.videoElement.videoHeight;
                
                const appState = window.App; // Access global App object
                if (appState.currentScanMode === 'sell') {
                    this.scanLoop(onMatchCallback, onCaptureCallback);
                } else { // 'add' mode
                    this.captureAfterDelay(onCaptureCallback);
                }
            };

        } catch (error) {
            this.isRunning = false;
            throw error;
        }
    },

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        clearTimeout(this.scanTimeout);
        this.videoElement.srcObject = null;
        this.stream = null;
        this.isRunning = false;
    },
    
    captureAfterDelay(callback) {
        // Automatically captures after a short delay for the 'add' flow.
        this.scanTimeout = setTimeout(() => {
            if (!this.isRunning) return;
            const imageData = this.captureFrame();
            this.stop();
            callback(imageData);
        }, 2000); // 2-second delay
    },
    
    async scanLoop(onMatchCallback, onCaptureCallback) {
        // Continuously scan for a match in 'sell' mode.
        if (!this.isRunning) return;

        const predictions = await this.classifyFrame();
        const products = await DB.getProducts();

        // Simple matching logic: check if prediction keywords are in product names
        let foundProduct = null;
        if (predictions && predictions.length > 0) {
            for (const product of products) {
                for (const prediction of predictions) {
                    // Check if any part of the prediction class name is in the product name
                    const keywords = prediction.className.split(', ')[0].toLowerCase();
                    if (product.name.toLowerCase().includes(keywords)) {
                        foundProduct = product;
                        break;
                    }
                }
                if (foundProduct) break;
            }
        }
        
        if (foundProduct) {
            onMatchCallback(foundProduct);
        } else {
            // If still running, loop again
            if(this.isRunning) {
                 requestAnimationFrame(() => this.scanLoop(onMatchCallback, onCaptureCallback));
            }
        }
        
        // Timeout logic: if no match found after 5s, trigger capture
        if (!this.scanTimeout) {
            this.scanTimeout = setTimeout(() => {
                 if (this.isRunning) { // check if still running and no match was found
                    const imageData = this.captureFrame();
                    this.stop();
                    onCaptureCallback(imageData);
                 }
            }, 5000);
        }
    },

    captureFrame() {
        const context = this.canvasElement.getContext('2d');
        context.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);
        return this.canvasElement.toDataURL('image/jpeg');
    },
    
    async classifyFrame() {
        if (!this.model || !this.isRunning) return null;
        try {
            const predictions = await this.model.classify(this.videoElement);
            return predictions;
        } catch (error) {
            console.error("Classification error:", error);
            return null;
        }
    }
};