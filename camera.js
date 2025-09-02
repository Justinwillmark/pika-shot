const Camera = {
  model: null,
  videoStream: null,
  isModelReady: false,
  
  async init() {
    try {
      this.model = await mobilenet.load({version: 2, alpha: 0.5});
      this.isModelReady = true;
      console.log('MobileNet model loaded (version 2, alpha 0.5).');
    } catch (error) {
      console.error('Error loading model:', error);
      this.isModelReady = false;
    }
  },

  async startCamera(videoElement) {
    if (this.videoStream) {
        this.stopCamera();
    }
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
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
        return new Promise(resolve => {
            videoElement.onloadedmetadata = () => {
                videoElement.play();
                resolve(true);
            };
        });
      } catch (err) {
        console.error("Error accessing camera:", err);
        // Provide more helpful error messages
        if(err.name === "NotAllowedError") {
            alert("Camera permission was denied. Please enable it in your browser settings to continue.");
        } else {
            alert("Could not access the camera. It might be in use by another app or not available.");
        }
        return false;
      }
    }
    return false;
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
    try {
      const tensor = tf.browser.fromPixels(imageElementOrCanvas).toFloat().div(tf.scalar(255.0)).expandDims();
      const embedding = this.model.infer(tensor, true);
      tensor.dispose();
      return embedding.dataSync();
    } catch (error) {
      console.error('Error getting embedding:', error);
      return null;
    }
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
      if (magnitudeA && magnitudeB) {
          return dotProduct / (magnitudeA * magnitudeB);
      }
      return 0;
  },

  async findBestMatch(embeddingToMatch, allProducts) {
    if (!embeddingToMatch || allProducts.length === 0) return null;

    let bestMatch = { product: null, score: 0.0 };
    const SIMILARITY_THRESHOLD = 0.92; // Stricter threshold for higher accuracy

    for (const product of allProducts) {
      if (product.embedding && product.stock > 0) { // Only match items in stock
        const similarity = this._cosineSimilarity(embeddingToMatch, product.embedding);
        if (similarity > bestMatch.score) {
          bestMatch = { product: product, score: similarity };
        }
      }
    }
    
    if (bestMatch.score > SIMILARITY_THRESHOLD) {
      console.log(`Found match: ${bestMatch.product.name} with score ${bestMatch.score}`);
      return bestMatch.product;
    }
    return null;
  }
};