const Camera = {
    videoElement: document.getElementById('camera-feed'),
    stream: null,
    isScanning: false,
    scanTimeout: null,
    countdownInterval: null,
    barcodeDetector: null,

    // --- Scan engine state ---
    nativeUsable: false,      // native BarcodeDetector present AND actually works on this device
    zxing: null,              // ZXing fallback decoder ({ Z, reader }) once loaded
    _zxingPromise: null,
    _zxingFailed: false,
    _session: 0,              // bumped on every start/stop; stale async work compares against it and bails out
    _ctx: null,               // live scan context
    _watchTimer: null,
    _torchTimer: null,
    _cropCanvas: null,
    torchOn: false,
    _torchTouchedByUser: false,
    onTorchChange: null,      // optional callback(isOn) so the UI can reflect torch state

    SCAN_WINDOW_MS: 12000,    // how long one scan attempt keeps looking before giving up
    ZXING_URL: 'https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js',
    CHECKED_FORMATS: ['ean_13', 'ean_8', 'upc_a', 'upc_e'],
    STRUCTURED_FORMATS: ['qr_code', 'data_matrix', 'aztec', 'pdf417'],

    async init() {
        if ('BarcodeDetector' in window) {
            try {
                let formats = null;
                try {
                    formats = (await window.BarcodeDetector.getSupportedFormats()).filter(f => f !== 'unknown');
                } catch (e) { /* older implementations: fall back to the default format list */ }

                if (formats && formats.length === 0) {
                    // Detector exists but supports nothing on this platform (e.g. some desktops).
                    this.barcodeDetector = null;
                    this.nativeUsable = false;
                } else {
                    this.barcodeDetector = formats ? new window.BarcodeDetector({ formats }) : new window.BarcodeDetector();
                    this.nativeUsable = true;
                    this._warmUpDetector();
                }
            } catch (e) {
                console.error('Barcode Detector is supported, but failed to initialize:', e);
                this.barcodeDetector = null;
                this.nativeUsable = false;
            }
        }
        if (!this.nativeUsable) {
            console.warn('Native barcode detection unavailable; loading fallback decoder.');
            this._loadZXing();
        }
        document.addEventListener('visibilitychange', () => this._onVisibilityChange());
    },

    // True when this device can attempt a scan at all.
    isSupported() {
        const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        return hasCamera && (this.nativeUsable || !!this.zxing || !this._zxingFailed);
    },

    // Between 6:30 pm and 7:00 am the torch is switched on automatically.
    isNightTime(date = new Date()) {
        const minutes = date.getHours() * 60 + date.getMinutes();
        return minutes >= (18 * 60 + 30) || minutes < 7 * 60;
    },

    // --- Fallback decoder (ZXing) ---
    _loadZXing() {
        if (this.zxing) return Promise.resolve(true);
        if (window.ZXing) return Promise.resolve(this._initZXing());
        if (this._zxingPromise) return this._zxingPromise;
        this._zxingPromise = new Promise(resolve => {
            const s = document.createElement('script');
            s.src = this.ZXING_URL;
            s.async = true;
            s.onload = () => resolve(this._initZXing());
            s.onerror = () => {
                s.remove();
                this._zxingPromise = null;   // allow a retry on the next scan
                this._zxingFailed = true;
                resolve(false);
            };
            document.head.appendChild(s);
        });
        return this._zxingPromise;
    },

    _initZXing() {
        try {
            const Z = window.ZXing;
            if (!Z) return false;
            const hints = new Map();
            hints.set(Z.DecodeHintType.POSSIBLE_FORMATS, [
                Z.BarcodeFormat.EAN_13, Z.BarcodeFormat.EAN_8, Z.BarcodeFormat.UPC_A, Z.BarcodeFormat.UPC_E,
                Z.BarcodeFormat.CODE_128, Z.BarcodeFormat.CODE_39, Z.BarcodeFormat.CODE_93, Z.BarcodeFormat.ITF,
                Z.BarcodeFormat.CODABAR, Z.BarcodeFormat.QR_CODE, Z.BarcodeFormat.DATA_MATRIX
            ]);
            hints.set(Z.DecodeHintType.TRY_HARDER, true);
            const reader = new Z.MultiFormatReader();
            reader.setHints(hints);
            this.zxing = { Z, reader };
            this._zxingFailed = false;
            return true;
        } catch (e) {
            console.error('Failed to initialise fallback decoder:', e);
            this._zxingFailed = true;
            return false;
        }
    },

    _zxingDecode(canvas) {
        if (!this.zxing) return null;
        const { Z, reader } = this.zxing;
        try {
            const source = new Z.HTMLCanvasElementLuminanceSource(canvas);
            const bitmap = new Z.BinaryBitmap(new Z.HybridBinarizer(source));
            const result = reader.decode(bitmap);
            return {
                rawValue: result.getText(),
                format: String(Z.BarcodeFormat[result.getBarcodeFormat()] || '').toLowerCase()
            };
        } catch (e) {
            return null; // NotFoundException etc. = nothing in this frame
        } finally {
            try { reader.reset(); } catch (e) { /* ignore */ }
        }
    },

    // The first native detect() call can be slow while the platform model loads; do it ahead of time.
    _warmUpDetector() {
        try {
            const c = document.createElement('canvas');
            c.width = c.height = 32;
            Promise.race([this.barcodeDetector.detect(c), new Promise(r => setTimeout(r, 2000))]).catch(() => {});
        } catch (e) { /* ignore */ }
    },

    // --- Helpers ---
    _alive(session) {
        return session === this._session && this.isScanning;
    },

    _sleep(ms) {
        return new Promise(r => setTimeout(r, ms));
    },

    _track() {
        return this.stream ? this.stream.getVideoTracks()[0] : null;
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
                 clearInterval(this.countdownInterval);
            }
        }, 1000);
    },

    _constraintAttempts() {
        return [
            { video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false },
            { video: { facingMode: { ideal: 'environment' } }, audio: false },
            { video: true, audio: false }
        ];
    },

    _friendlyCameraError(err) {
        const name = err && err.name;
        if (name === 'NotAllowedError' || name === 'SecurityError') return 'Camera access was blocked. Please allow camera permission for PikaShot and try again.';
        if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No usable camera was found on this device.';
        if (name === 'NotReadableError' || name === 'AbortError') return 'The camera is busy in another app. Close it and try again.';
        return 'Could not start the camera. Please try again.';
    },

    // Opens (or re-opens) the camera, working through progressively simpler constraints and retrying
    // when the camera is briefly busy. Returns true when frames are flowing.
    async _openStream(session, startAttempt = 0) {
        const attempts = this._constraintAttempts();
        let lastError = null;

        for (let i = Math.min(startAttempt, attempts.length - 1); i < attempts.length; i++) {
            for (let retry = 0; retry < 3; retry++) {
                if (session !== this._session) return false;
                try {
                    const stream = await navigator.mediaDevices.getUserMedia(attempts[i]);
                    if (session !== this._session) {          // cancelled while the camera was starting
                        stream.getTracks().forEach(t => t.stop());
                        return false;
                    }
                    this._releaseStream();
                    this.stream = stream;
                    const video = this.videoElement;
                    video.muted = true;
                    video.setAttribute('playsinline', '');
                    video.srcObject = stream;
                    try { await video.play(); } catch (e) {
                        if (session !== this._session) return false;
                        await this._sleep(150);
                        await video.play();                     // one retry; throws to the outer catch if still failing
                    }
                    const track = this._track();
                    if (track) track.addEventListener('ended', () => { if (this._ctx) this._ctx.needsRestart = true; });
                    if (await this._waitForFrame(session, 4000)) return true;
                    lastError = new Error('No video frames received');
                    this._releaseStream();
                    break; // try the next, simpler constraint set
                } catch (err) {
                    lastError = err;
                    const name = err && err.name;
                    if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'NotFoundError') {
                        this.lastError = err;
                        return false;          // retrying will not help
                    }
                    if (name === 'OverconstrainedError') break;   // next constraint set
                    await this._sleep(500);                       // busy / transient: wait and retry
                }
            }
        }
        this.lastError = lastError;
        return false;
    },

    async _waitForFrame(session, timeoutMs) {
        const video = this.videoElement;
        const started = Date.now();
        while (Date.now() - started < timeoutMs) {
            if (session !== this._session) return false;
            if (video.videoWidth > 0 && video.readyState >= 2) return true;
            await this._sleep(100);
        }
        return false;
    },

    _releaseStream() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    },

    // Best-effort: ask for continuous focus / exposure so close-up barcodes sharpen on their own.
    _tuneTrack() {
        const track = this._track();
        if (!track || !track.getCapabilities) return;
        try {
            const caps = track.getCapabilities();
            const wanted = [];
            if (caps.focusMode && caps.focusMode.includes('continuous')) wanted.push({ focusMode: 'continuous' });
            if (caps.exposureMode && caps.exposureMode.includes('continuous')) wanted.push({ exposureMode: 'continuous' });
            if (caps.whiteBalanceMode && caps.whiteBalanceMode.includes('continuous')) wanted.push({ whiteBalanceMode: 'continuous' });
            wanted.forEach(c => track.applyConstraints({ advanced: [c] }).catch(() => {}));
        } catch (e) { /* ignore */ }
    },

    // --- Torch ---
    _torchSupported() {
        const track = this._track();
        try {
            const caps = track && track.getCapabilities ? track.getCapabilities() : null;
            return !!(caps && caps.torch);
        } catch (e) { return false; }
    },

    async _setTorch(on) {
        const track = this._track();
        if (!track || !this._torchSupported()) return false;
        try {
            await track.applyConstraints({ advanced: [{ torch: on }] });
            this.torchOn = on;
            if (this.onTorchChange) this.onTorchChange(on);
            return true;
        } catch (e) {
            console.error('Torch error: ', e);
            return false;
        }
    },

    async toggleTorch() {
        this._torchTouchedByUser = true;
        return this._setTorch(!this.torchOn);
    },

    // Keeps trying for a moment because many phones only report torch support once the camera is warm.
    _autoTorch(session, reason) {
        clearInterval(this._torchTimer);
        let tries = 0;
        this._torchTimer = setInterval(async () => {
            tries++;
            if (!this._alive(session) || this._torchTouchedByUser || this.torchOn || tries > 10) {
                clearInterval(this._torchTimer);
                return;
            }
            if (this._torchSupported() && await this._setTorch(true)) clearInterval(this._torchTimer);
        }, 350);
    },

    // --- Scanning ---
    async startScan(onResult, onTimeout, countdownElement, options = {}) {
        const fail = (message) => {
            if (options.onError) options.onError(message); else alert(message);
        };

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            fail('This browser cannot access the camera.');
            return;
        }
        // If the fallback decoder is needed but not loaded yet (or failed earlier), (re)start loading it in the background.
        if (!this.nativeUsable && !this.zxing) this._loadZXing();

        this.stop();                       // also invalidates any scan that is still starting up
        const session = this._session;
        this.isScanning = true;
        this._torchTouchedByUser = false;

        const ctx = {
            start: Date.now(), deadline: Date.now() + this.SCAN_WINDOW_MS,
            tick: 0, last: null, restarts: 0, nativeErrors: 0, needsRestart: false, restarting: false,
            lastVideoTime: -1, lastAdvance: Date.now(), statusShown: false, lowLightAssist: false,
            onResult, onTimeout, countdownElement, options
        };
        this._ctx = ctx;

        const opened = await this._openStream(session, 0);
        if (session !== this._session) return;   // cancelled meanwhile
        if (!opened) {
            this.stop();
            console.error('Error starting camera:', this.lastError);
            fail(this._friendlyCameraError(this.lastError));
            return;
        }

        ctx.start = Date.now();
        ctx.deadline = ctx.start + this.SCAN_WINDOW_MS;
        ctx.lastAdvance = Date.now();
        this._tuneTrack();
        if (this.isNightTime()) this._autoTorch(session, 'night');

        this._startWatch(session, ctx);
        this._scanLoop(session, ctx);
    },

    // Timer duties: countdown, timeout, stalled-camera recovery, low-light assist, helpful hints.
    _startWatch(session, ctx) {
        clearInterval(this._watchTimer);
        this._watchTimer = setInterval(async () => {
            if (!this._alive(session)) { clearInterval(this._watchTimer); return; }
            const now = Date.now();
            const video = this.videoElement;

            // 1. Stall / dead-camera recovery
            if (video.currentTime !== ctx.lastVideoTime) {
                ctx.lastVideoTime = video.currentTime;
                ctx.lastAdvance = now;
            }
            const track = this._track();
            const dead = !track || track.readyState === 'ended';
            if (!ctx.restarting && document.visibilityState === 'visible' &&
                (ctx.needsRestart || dead || now - ctx.lastAdvance > 2500)) {
                if (ctx.restarts < 3) {
                    ctx.restarting = true;
                    ctx.restarts++;
                    ctx.needsRestart = false;
                    ctx.deadline += 3000; // do not penalise the user for the recovery time
                    const ok = await this._openStream(session, Math.min(ctx.restarts, 2));
                    if (!this._alive(session)) return;
                    ctx.restarting = false;
                    ctx.lastAdvance = Date.now();
                    if (ok) {
                        this._tuneTrack();
                        const wasOn = this.torchOn;
                        if (wasOn) { this.torchOn = false; if (this.onTorchChange) this.onTorchChange(false); }
                        if (!this._torchTouchedByUser && (wasOn || this.isNightTime())) this._autoTorch(session, 'restart');
                    }
                    return;
                }
            }

            // 2. Hints and low-light assist
            const elapsed = now - ctx.start;
            if (elapsed > 4000 && !ctx.lowLightAssist) {
                ctx.lowLightAssist = true;
                if (!this.torchOn && !this._torchTouchedByUser && this._torchSupported()) this._setTorch(true);
            }
            if (elapsed > 5000 && !ctx.statusShown) {
                ctx.statusShown = true;
                if (ctx.options.onStatus) ctx.options.onStatus('Hold steady and move closer...');
            }

            // 3. Countdown (last 3 seconds) and timeout
            const remaining = ctx.deadline - now;
            const el = ctx.countdownElement;
            if (el) {
                if (remaining <= 3000 && remaining > 0) {
                    el.style.display = 'block';
                    el.textContent = Math.ceil(remaining / 1000);
                } else {
                    el.style.display = 'none';
                }
            }
            if (remaining <= 0) {
                const cb = ctx.onTimeout;
                this.stop();
                if (cb) cb();
            }
        }, 400);
    },

    _onVisibilityChange() {
        const ctx = this._ctx;
        if (document.visibilityState === 'visible' && ctx && this.isScanning) {
            // Coming back from the background: give the scan fresh time and let the watchdog re-check the camera.
            ctx.deadline = Math.max(ctx.deadline, Date.now() + 6000);
            ctx.lastAdvance = 0;
        }
    },

    _drawCrop(video, tick) {
        if (!this._cropCanvas) this._cropCanvas = document.createElement('canvas');
        const canvas = this._cropCanvas;
        const vw = video.videoWidth, vh = video.videoHeight;
        // Alternate between a wide centre crop and a tighter one (helps small barcodes).
        const tight = (tick % 6) === 0;
        const cw = Math.round(vw * (tight ? 0.6 : 0.9));
        const ch = Math.round(vh * (tight ? 0.4 : 0.7));
        const sx = Math.round((vw - cw) / 2), sy = Math.round((vh - ch) / 2);
        const scale = Math.min(1.6, 960 / cw);
        canvas.width = Math.round(cw * scale);
        canvas.height = Math.round(ch * scale);
        const g = canvas.getContext('2d', { willReadFrequently: true });
        try { g.filter = (tick % 2 === 0) ? 'grayscale(1) contrast(1.4)' : 'none'; } catch (e) { /* unsupported */ }
        g.drawImage(video, sx, sy, cw, ch, 0, 0, canvas.width, canvas.height);
        return canvas;
    },

    _pick(codes) {
        const c = codes[0];
        return { rawValue: c.rawValue, format: String(c.format || '').toLowerCase() };
    },

    _handleNativeError(e, ctx) {
        ctx.nativeErrors++;
        if ((e && e.name === 'NotSupportedError') || ctx.nativeErrors > 5) {
            console.warn('Native barcode detection is not working here; switching to fallback decoder.', e);
            this.nativeUsable = false;
            this._loadZXing();
        }
    },

    async _detectOnce(ctx) {
        const video = this.videoElement;
        if (ctx.restarting || video.readyState < 2 || !video.videoWidth) return null;
        ctx.tick++;
        const elapsed = Date.now() - ctx.start;

        if (this.nativeUsable) {
            try {
                const codes = await this.barcodeDetector.detect(video);
                if (codes.length) return this._pick(codes);
            } catch (e) { this._handleNativeError(e, ctx); }
        }

        const useCrop = !this.nativeUsable || ctx.tick % 3 === 0;
        if (!useCrop) return null;
        const canvas = this._drawCrop(video, ctx.tick);

        if (this.nativeUsable) {
            try {
                const codes = await this.barcodeDetector.detect(canvas);
                if (codes.length) return this._pick(codes);
            } catch (e) { this._handleNativeError(e, ctx); }
        }
        // The fallback decoder runs when native is missing, or as a second opinion once native has had a fair go.
        if (this.zxing && (!this.nativeUsable || elapsed > 2000)) {
            return this._zxingDecode(canvas);
        }
        if (!this.nativeUsable && !this.zxing && !this._zxingPromise) this._loadZXing();
        return null;
    },

    _checkDigitOk(value, format) {
        if (!/^\d+$/.test(value)) return false;
        const expected = { ean_13: 13, ean_8: 8, upc_a: 12 }[format];
        if (expected && value.length !== expected) return false;
        if (format === 'upc_e') return value.length === 8 || value.length === 6 || value.length === 7;
        const digits = value.split('').map(Number);
        const check = digits.pop();
        let sum = 0;
        for (let i = digits.length - 1, w = 3; i >= 0; i--, w = (w === 3 ? 1 : 3)) sum += digits[i] * w;
        return ((10 - (sum % 10)) % 10) === check;
    },

    // Rejects likely misreads: retail barcodes must have a valid check digit, and plain barcodes must be read
    // twice in a row. Structured codes (QR etc.) carry their own error correction and are accepted at once.
    _accept(found, ctx) {
        const value = found && found.rawValue ? String(found.rawValue) : '';
        if (!value.trim()) return false;
        const format = found.format || '';
        if (this.STRUCTURED_FORMATS.includes(format)) return true;
        if (this.CHECKED_FORMATS.includes(format) && !this._checkDigitOk(value.trim(), format)) return false;
        const now = Date.now();
        if (ctx.last && ctx.last.value === value && now - ctx.last.time < 1500) return true;
        ctx.last = { value, time: now };
        return false;
    },

    async _scanLoop(session, ctx) {
        while (this._alive(session)) {
            const t0 = performance.now();
            let found = null;
            try {
                found = await this._detectOnce(ctx);
            } catch (e) {
                console.error('Barcode detection failed:', e);
            }
            if (!this._alive(session)) return;
            if (found && this._accept(found, ctx)) {
                this._emit(found, ctx);
                return;
            }
            await this._sleep(Math.max(25, 70 - (performance.now() - t0)));
        }
    },

    _emit(found, ctx) {
        const onResult = ctx.onResult;
        const detectedValue = found.rawValue;
        this.stop(); // Stop scanning immediately on detection

        // Check for the new format
        if (detectedValue.startsWith('pika-log-id:')) {
            onResult({ type: 'qrlog_id', data: detectedValue.substring('pika-log-id:'.length) });
            return;
        }

        // Check if it's a pika-log QR code (old version)
        try {
            const jsonData = JSON.parse(detectedValue);
            if (jsonData && jsonData.pikaLogVersion === 1) {
                onResult({ type: 'qrlog', data: jsonData });
                return;
            }
        } catch (e) { /* Not a pika log, treat as regular barcode */ }

        // It's a regular barcode
        onResult({ type: 'barcode', data: detectedValue });
    },

    stop() {
        this._session++;               // anything still starting up or looping sees a new session and bails out
        this.isScanning = false;
        clearTimeout(this.scanTimeout);
        clearInterval(this.countdownInterval);
        clearInterval(this._watchTimer);
        clearInterval(this._torchTimer);
        this.scanTimeout = null;
        this.countdownInterval = null;
        this._watchTimer = null;
        this._torchTimer = null;

        if (this._ctx && this._ctx.countdownElement) this._ctx.countdownElement.style.display = 'none';
        this._ctx = null;

        this._releaseStream();
        try { this.videoElement.srcObject = null; } catch (e) { /* ignore */ }
        if (this.torchOn) {
            this.torchOn = false;
            if (this.onTorchChange) this.onTorchChange(false);
        }
    },

    async capturePhoto(countdownElement, feedbackElement) {
        this.stop();
        const session = this._session;
        this.isScanning = true;
        if (!await this._openStream(session, 0)) {
            if (session === this._session) {
                this.stop();
                alert(this._friendlyCameraError(this.lastError));
            }
            return { blob: null };
        }
        this._tuneTrack();

        return new Promise(async (resolve) => {
            if (feedbackElement) feedbackElement.textContent = 'Snapping Image';
            this._startCountdown(3, countdownElement);

            // Give the camera a moment to adjust focus and exposure, and for the countdown to finish
            setTimeout(async () => {
                if (session !== this._session || !this.videoElement.videoWidth) {
                    if (session === this._session) this.stop();
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
            }, 3000); // 3000ms delay for countdown
        });
    },
};
