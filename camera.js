const Camera = {
    videoElement: document.getElementById('camera-feed'),
    stream: null,
    isScanning: false,
    scanTimeout: null,
    countdownInterval: null,
    barcodeDetector: null,

    async init() {
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
        countdownElement.style.display = 'block';
        countdownElement.textContent = count;
        this.countdownInterval = setInterval(() => {
            count--;
            countdownElement.textContent = count > 0 ? count : '';
            if (count <= 0) {
                 countdownElement.style.display = 'none';
            }
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

    async startScan(onResult, onTimeout, countdownElement) {
        if (!this.barcodeDetector) {
            alert('Barcode scanner is not available.');
            return;
        }
        if (!await this._startStream()) return;
        
        this._startCountdown(3, countdownElement);

        const scanLoop = async () => {
            if (!this.isScanning) return;

            if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
                try {
                    const barcodes = await this.barcodeDetector.detect(this.videoElement);
                    if (barcodes.length > 0) {
                        this.stop(); // Stop scanning immediately on detection
                        const detectedValue = barcodes[0].rawValue;
                        // Check if it's a pika-log QR code
                        try {
                            const jsonData = JSON.parse(detectedValue);
                            if (jsonData && jsonData.pikaLogVersion === 1) {
                                onResult({ type: 'qrlog', data: jsonData });
                                return;
                            }
                        } catch (e) { /* Not a pika log, treat as regular barcode */ }
                        
                        // It's a regular barcode
                        onResult({ type: 'barcode', data: detectedValue });
                        return;
                    }
                } catch (e) {
                     console.error("Barcode detection failed:", e);
                }
            }
            // Keep scanning if nothing is found yet and we are still active
            if (this.isScanning) {
                requestAnimationFrame(scanLoop);
            }
        };
        
        requestAnimationFrame(scanLoop);

        // 3-second timeout if no barcode is found
        this.scanTimeout = setTimeout(() => {
            if (this.isScanning) { // Check if we haven't already found something
                this.stop();
                if (onTimeout) {
                    onTimeout();
                }
            }
        }, 3000);
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

    async capturePhoto() {
         if (!await this._startStream()) return { blob: null };

        return new Promise(async (resolve) => {
            // Give the camera a moment to adjust focus and exposure
            setTimeout(async () => {
                if (!this.videoElement.videoWidth) {
                    this.stop();
                    return resolve({ blob: null });
                }
                const canvas = document.createElement('canvas');
                canvas.width = this.videoElement.videoWidth;
                canvas.height = this.videoElement.videoHeight;
                const context = canvas.getContext('2d');
                context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);

                const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.9));
                
                this.stop();
                resolve({ blob });
            }, 500); // 500ms delay for auto-focus
        });
    },
};
