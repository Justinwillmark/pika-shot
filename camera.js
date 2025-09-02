const Camera = {
  model: null,
  videoStream: null,
  isModelReady: false,
  
  async init() {
    try {
      this.model = await mobilenet.load({version: 2, alpha: 0.5});
      this.isModelReady = true;
      console.log('MobileNet model loaded.');
    } catch (error) {
      console.error('Error loading model:', error);
      this.isModelReady = false;
    }
  },

  async startCamera(videoElement) {
    if (this.videoStream) this.stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not available on this browser.");
    }
    
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      videoElement.srcObject = this.videoStream;
      await new Promise(resolve => {
          videoElement.onloadedmetadata = () => {
              videoElement.play();
              resolve();
          };
      });
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        throw new Error("Camera permission denied. Please enable it in your browser settings.");
      } else {
        throw new Error("Could not access camera. It may be in use.");
      }
    }
  },

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
  },

  captureFrame(videoElement, canvasElement) {
    const context = canvasElement.getContext('2d');
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    context.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
    return canvasElement.toDataURL('image/jpeg', 0.9);
  },
  
  async getEmbedding(imageElementOrCanvas) {
    if (!this.isModelReady) {
      console.error("Model not loaded yet.");
      return null;
    }
    return tf.tidy(() => {
        const tensor = tf.browser.fromPixels(imageElementOrCanvas).toFloat().div(tf.scalar(255.0)).expandDims();
        const embedding = this.model.infer(tensor, true);
        return embedding.dataSync();
    });
  },

  _cosineSimilarity(vecA, vecB) {
      let dotProduct = 0;
      let magnitudeA = 0;
      let magnitudeB = 0;
      for (let i = 0; i < vecA.length; i++) {
          dotProduct += vecA[i] * vecB[i];
          magnitudeA += vecA[i] * vecA[i];
          magnitudeB += vecB[i] * vecB[i];
      }
      magnitudeA = Math.sqrt(magnitudeA);
      magnitudeB = Math.sqrt(magnitudeB);
      return (magnitudeA && magnitudeB) ? dotProduct / (magnitudeA * magnitudeB) : 0;
  },

  async findBestMatch(embeddingToMatch, allProducts) {
    if (!embeddingToMatch || allProducts.length === 0) return null;

    let bestMatch = { product: null, score: 0.0 };
    const SIMILARITY_THRESHOLD = 0.93; // Stricter threshold for higher accuracy

    for (const product of allProducts) {
      if (product.embedding && product.stock > 0) { // Only match items in stock
        const similarity = this._cosineSimilarity(embeddingToMatch, product.embedding);
        if (similarity > bestMatch.score) {
          bestMatch = { product: product, score: similarity };
        }
      }
    }
    
    if (bestMatch.score > SIMILARITY_THRESHOLD) {
      return bestMatch.product;
    }
    return null;
  }
};
