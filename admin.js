document.addEventListener('DOMContentLoaded', () => {
    const DAY = 86400000;
    const ACTIVE_DAYS = 3;      // used the app within this many days: Active
    const DROP_DAYS = 7;        // nothing for this many days after using it before: Dropped off
    const PAGE = 40;            // rows shown before "Show more"
    const PERIODS = { '7': 7, '30': 30, '90': 90, 'all': null };
    const REWARD_DEFAULTS = { '7': [4, 2], '30': [12, 5], '90': [30, 10], 'all': [30, 10] }; // [days with a sale, transfers]
    const SEGMENT_COLORS = ['#008C95', '#3361c4', '#d98c0a', '#a14fc4', '#c93c3c', '#6b7785'];

    // ---------- small helpers ----------
    const $ = (id) => document.getElementById(id);
    const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const num = (n) => Math.round(n || 0).toLocaleString('en-NG');
    const naira = (n) => '₦' + num(n);
    const qty = (n) => (Math.round((n || 0) * 2) / 2).toLocaleString('en-NG'); // units can be sold in halves
    const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
    const plural = (n, one, many) => `${num(n)} ${n === 1 ? one : (many || one + 's')}`;
    const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase() || '?';
    const toMs = (t) => {
        if (t == null) return null;
        if (typeof t === 'number') return t;
        if (t.toMillis) return t.toMillis();
        if (t.toDate) return t.toDate().getTime();
        if (t.seconds != null) return t.seconds * 1000;
        if (t instanceof Date) return t.getTime();
        return null;
    };
    const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
    const dayNum = (ms) => Math.floor((ms - new Date(ms).getTimezoneOffset() * 60000) / DAY); // whole local days
    const fmtDay = (ms) => new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const fmtDate = (ms) => new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const fmtTime = (ms) => `${fmtDay(ms)}, ${new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    const ago = (ms) => {
        if (!ms) return '—';
        const s = (Date.now() - ms) / 1000;
        if (s < 60) return 'just now';
        if (s < 3600) return `${Math.floor(s / 60)} min ago`;
        if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
        const d = Math.floor(s / 86400);
        if (d === 1) return 'yesterday';
        if (d < 14) return `${d} days ago`;
        if (d < 60) return `${Math.floor(d / 7)} weeks ago`;
        return fmtDate(ms);
    };
    const countBy = (list) => { const m = new Map(); list.forEach((k) => m.set(k, (m.get(k) || 0) + 1)); return m; };
    const top = (map) => { let best = null; map.forEach((v, k) => { if (!best || v > best[1]) best = [k, v]; }); return best; };
    const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
    const niceMax = (v) => {
        if (v <= 5) return 5;
        const p = Math.pow(10, Math.floor(Math.log10(v)));
        const f = v / p;
        return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
    };
    const compact = (n) => n >= 1e6 ? `${+(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${+(n / 1e3).toFixed(1)}k` : String(Math.round(n));
    const emptyStats = () => ({ sales: 0, volume: 0, units: 0, sellDays: new Set(), sent: 0, sentValue: 0, sentUnits: 0, accepted: 0, acceptedValue: 0, acceptedUnits: 0, scans: 0, calls: 0, days: new Set(), last: 0 });
    const readLocal = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } };
    const writeLocal = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ } };

    // Line icons (24px grid, drawn with the current text colour)
    const ICONS = {
        grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
        users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        award: '<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
        trend: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
        pulse: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
        repeat: '<polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
        userMinus: '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="17" y1="11" x2="23" y2="11"/>',
        bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
        box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
        send: '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>',
        check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
        refresh: '<polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>',
        logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
        calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
        chevronRight: '<polyline points="9 18 15 12 9 6"/>',
        back: '<polyline points="15 18 9 12 15 6"/>',
        chevronDown: '<polyline points="6 9 12 15 18 9"/>',
        alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
        shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
        close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
    };
    const icon = (name, size = 18) => `<svg class="ico" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
    // On phones the dashboard is only the sign-up verification tool
    const PHONE_ONLY = window.matchMedia('(max-width: 699px)');
    const CODE_TTL_MS = 20 * 60 * 1000; // must match the app
    const REPLIES = {
        verified: 'Verified. Please return to PikaShot to create your account now. Thanks',
        verifiedReset: 'Verified. Please return to PikaShot to set your new PIN now. Thanks',
        missing: 'We couldn\'t find a PikaShot sign-up for this number. Please open PikaShot, enter this WhatsApp number, tap "Verify on WhatsApp" and send the message. Thanks',
        mismatch: 'That message doesn\'t match your sign-up. Please open PikaShot, tap "Verify on WhatsApp" and send the message without changing it. Thanks',
        expired: 'That request has expired. Please open PikaShot, tap "Try again", then "Verify on WhatsApp" and send the message. Thanks'
    };
    // +234 803 123 4567, 2348031234567 and 08031234567 all become 08031234567, the form the app saves
    const localPhone = (v) => {
        let d = String(v || '').replace(/\D/g, '');
        if (d.startsWith('234')) d = d.slice(3);
        if (d.length === 10) d = '0' + d;
        return d;
    };
    const NAV = [['overview', 'Overview', 'grid'], ['users', 'Users', 'users'], ['rewards', 'Rewards', 'award'], ['insights', 'Insights', 'trend'], ['activity', 'Activity', 'pulse']];

    const App = {
        D: null,           // everything loaded from Firestore, tidied
        act: new Map(),    // user id -> { days, first, last } across all counted activity
        m: null,           // numbers for the chosen period
        state: {
            tab: 'overview',
            period: '7',
            floor: null,        // ignore everything before this moment
            floorSynced: true,
            loaded: false,
            problems: [],
            chartBy: 'users',
            f: { q: '', status: 'all', type: 'all', location: 'all', gps: 'all', sort: 'recent', limit: PAGE },
            rewards: { filter: 'all', limit: PAGE },
            insights: { by: 'revenue', q: '', open: new Set(), limit: 12 },
            activity: { folds: new Set(['calls']), callQ: '', barQ: '', diffOnly: false, trQ: '', limits: { calls: PAGE, barcodes: PAGE, transfers: PAGE } },
            sheets: [],
        },

        // ================= sign-in =================
        init() {
            $('login-form').addEventListener('submit', (e) => this.handleLogin(e));
            const navHtml = NAV.map(([key, label, ico]) => `<button type="button" data-tab="${key}">${icon(ico, 20)}<span>${label}</span></button>`).join('');
            $('rail-nav').innerHTML = navHtml;
            $('bottom-nav').innerHTML = navHtml;
            document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = icon(el.dataset.icon); });
            document.addEventListener('click', (e) => {
                const hit = (sel) => e.target.closest(sel);
                let el;
                if ((el = hit('[data-tab]'))) return this.setTab(el.dataset.tab);
                if ((el = hit('[data-period]'))) return this.setPeriod(el.dataset.period);
                if ((el = hit('[data-act]'))) {
                    const act = el.dataset.act;
                    if (act === 'refresh') this.refresh();
                    else if (act === 'since') this.openSinceSheet();
                    else if (act === 'signout') window.fb.signOut(window.fb.auth);
                }
            });
            $('main').addEventListener('click', (e) => this.onClick(e));
            $('verify-form').addEventListener('submit', (e) => this.verifySignup(e));
            $('verify').addEventListener('click', (e) => { const b = e.target.closest('[data-paste]'); if (b) this.pasteInto(b.dataset.paste); });
            $('v-copy').addEventListener('click', () => this.copyReply());
            // Pasting the whole message ("Verify 4821 for PikaShot") keeps just the code
            $('v-code').addEventListener('input', (e) => {
                const m = e.target.value.match(/\d{4}/);
                if (m && /\D/.test(e.target.value)) e.target.value = m[0];
            });
            $('v-next').addEventListener('click', () => this.resetVerify());
            const fold = $('verify-fold');
            if (readLocal('pika_admin_verify_open') === false && !PHONE_ONLY.matches) fold.open = false;
            fold.addEventListener('toggle', () => {
                if (PHONE_ONLY.matches) { if (!fold.open) fold.open = true; return; }
                writeLocal('pika_admin_verify_open', fold.open);
            });
            PHONE_ONLY.addEventListener('change', () => {
                this.renderChrome();
                if (!PHONE_ONLY.matches && !this.state.loaded && $('dashboard-container').style.display !== 'none') this.refresh();
            });
            $('main').addEventListener('input', (e) => this.onInput(e));
            $('main').addEventListener('change', (e) => this.onInput(e));
            $('main').addEventListener('toggle', (e) => this.onToggle(e), true);
            $('sheet-body').addEventListener('click', (e) => this.onClick(e));
            $('sheet-body').addEventListener('input', (e) => this.onInput(e));
            $('sheet').addEventListener('click', (e) => { if (e.target.closest('[data-close]')) this.closeSheet(); });
            $('sheet-back').addEventListener('click', () => this.backSheet());
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('sheet').hidden) this.closeSheet(); });
            const tabs = ['overview', 'users', 'rewards', 'insights', 'activity'];
            const hash = location.hash.replace('#', '');
            if (tabs.includes(hash)) this.state.tab = hash;
            window.addEventListener('hashchange', () => {
                const h = location.hash.replace('#', '');
                if (tabs.includes(h) && h !== this.state.tab) this.setTab(h);
            });
            this.checkAuthState();
        },

        checkAuthState() {
            window.fb.onAuthStateChanged(window.fb.auth, (user) => {
                if (user) {
                    $('login-modal').style.display = 'none';
                    $('dashboard-container').style.display = ''; // the stylesheet decides the layout
                    this.renderChrome();
                    if (!PHONE_ONLY.matches) this.refresh(); // phones only verify sign-ups, so nothing else is downloaded
                } else {
                    $('login-modal').style.display = 'flex';
                    $('dashboard-container').style.display = 'none';
                    this.state.loaded = false;
                }
            });
        },

        async handleLogin(e) {
            e.preventDefault();
            try {
                await window.fb.signInWithEmailAndPassword(window.fb.auth, $('email-input').value, $('password-input').value);
                $('error-message').textContent = '';
            } catch (error) {
                console.error('Login failed:', error);
                const messages = {
                    'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
                    'auth/operation-not-allowed': 'Email sign-in is switched off in Firebase.',
                    'auth/network-request-failed': 'No connection. Check your internet.'
                };
                $('error-message').textContent = messages[error.code] || 'Wrong email or password.';
            }
        },

        // ================= sign-up verification =================
        // The app saved signup_verifications/{phone} = { code, createdAt, verified } when the user asked for a code.
        // A match within 20 minutes marks it verified, and the app then opens Create Account by itself.
        async verifySignup(e) {
            e.preventDefault();
            const fb = window.fb;
            const err = $('v-error');
            const phone = localPhone($('v-phone').value);
            const code = (String($('v-code').value).match(/\d{4}/) || [])[0];
            err.textContent = '';
            if (!/^0\d{10}$/.test(phone)) { err.textContent = 'Enter the WhatsApp number the message came from.'; $('v-phone').focus(); return; }
            if (!code) { err.textContent = 'Enter the 4-digit code from their message.'; $('v-code').focus(); return; }
            const btn = $('v-check');
            btn.disabled = true;
            btn.textContent = 'Checking…';
            try {
                const ref = fb.doc(fb.db, 'signup_verifications', phone);
                const snap = await fb.getDoc(ref);
                const d = snap.exists() ? snap.data() : null;
                const purpose = d ? (d.purpose === 'reset' ? 'reset' : 'signup') : null;
                const done = purpose === 'reset' ? REPLIES.verifiedReset : REPLIES.verified;
                const age = d ? Date.now() - (toMs(d.createdAt) || 0) : Infinity;
                let result;
                if (!d) result = { ok: false, title: 'No request from this number', reply: REPLIES.missing };
                else if (String(d.code) !== code) result = { ok: false, title: 'The code does not match', reply: REPLIES.mismatch };
                else if (d.verified) result = { ok: true, title: 'Already verified', reply: done };
                else if (age > CODE_TTL_MS) result = { ok: false, title: 'This code has expired', reply: REPLIES.expired };
                else {
                    await fb.setDoc(ref, { verified: true, verifiedAt: fb.Timestamp.fromMillis(Date.now()) }, { merge: true });
                    result = { ok: true, title: 'Verified', reply: done };
                }
                this.showVerifyResult({ ...result, purpose }, phone);
            } catch (error) {
                console.error('Number check failed:', error);
                err.textContent = error && error.code === 'permission-denied'
                    ? 'The Firestore rules do not let the dashboard check these codes yet.'
                    : 'Could not check. Check your connection and try again.';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Check and verify';
            }
        },

        showVerifyResult(result, phone) {
            this._reply = result.reply;
            $('vcard-body').classList.add('has-result');
            $('v-steps').hidden = true;
            $('v-result').hidden = false;
            $('v-result').className = `v-result ${result.ok ? 'ok' : 'bad'}`;
            $('v-badge').innerHTML = icon(result.ok ? 'check' : 'alert', 20);
            $('v-title').textContent = result.title;
            const purpose = $('v-purpose');
            purpose.className = `v-purpose ${result.purpose || ''}`;
            purpose.textContent = result.purpose === 'reset' ? 'PIN reset' : result.purpose === 'signup' ? 'New sign-up' : '';
            $('v-number').textContent = phone;
            $('v-reply').textContent = result.reply;
            $('v-wa').href = `https://wa.me/234${phone.slice(1)}?text=${encodeURIComponent(result.reply)}`;
        },

        resetVerify() {
            $('vcard-body').classList.remove('has-result');
            $('v-result').hidden = true;
            $('v-steps').hidden = false;
            $('v-phone').value = '';
            $('v-code').value = '';
            $('v-error').textContent = '';
            $('v-phone').focus();
        },

        async copyReply() {
            try {
                await navigator.clipboard.writeText(this._reply || '');
                this.toast('Reply copied');
            } catch (e) {
                const range = document.createRange();
                range.selectNodeContents($('v-reply'));
                const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
                this.toast('Reply selected. Copy it from the menu.');
            }
        },

        async pasteInto(id) {
            const input = $(id);
            try {
                const text = (await navigator.clipboard.readText()).trim();
                input.value = id === 'v-code' ? ((text.match(/\d{4}/) || [text])[0]) : text;
                $('v-error').textContent = '';
            } catch (e) {
                input.focus();
                this.toast('Long-press the box and choose Paste');
            }
        },

        // ================= loading =================
        async refresh() {
            const spinners = document.querySelectorAll('[data-act="refresh"]');
            spinners.forEach((b) => b.classList.add('loading'));
            if (!this.state.loaded) $(`tab-${this.state.tab}`).innerHTML = '<p class="empty">Loading…</p>';
            try {
                await this.loadAll();
                this.state.loaded = true;
                this.recompute();
                this.renderAll();
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                this.toast('Could not load the data. Check your connection and try again.');
            } finally {
                spinners.forEach((b) => b.classList.remove('loading'));
            }
        },

        async loadSettings() {
            const fb = window.fb;
            const saved = readLocal('pika_admin_start');
            const local = saved && typeof saved === 'object' ? saved : null;
            let online = null;
            try {
                const snap = await fb.getDoc(fb.doc(fb.db, 'admin_settings', 'dashboard'));
                if (snap.exists()) online = { startAt: snap.data().startAt, savedAt: snap.data().savedAt || 0 };
            } catch (error) { /* not allowed by the rules, or offline: this device's copy is used */ }
            // Whichever was saved last wins; a copy that never reached Firestore is flagged
            const useLocal = !!local && (!online || local.savedAt > online.savedAt);
            const chosen = useLocal ? local : online;
            this.state.floor = chosen && typeof chosen.startAt === 'number' ? chosen.startAt : null;
            this.state.floorSynced = !useLocal;
        },

        async loadAll() {
            const fb = window.fb;
            await this.loadSettings();
            const floor = this.state.floor;
            const since = (name, field) => floor
                ? fb.query(fb.collection(fb.db, name), fb.where(field || 'timestamp', '>=', fb.Timestamp.fromMillis(floor)))
                : fb.query(fb.collection(fb.db, name));
            const jobs = [
                ['users', 'users', fb.getDocs(fb.query(fb.collection(fb.db, 'users')))],
                ['sales_logs', 'sales', fb.getDocs(since('sales_logs'))],
                ['scan_logs', 'scans', fb.getDocs(since('scan_logs'))],
                ['call_logs', 'calls', fb.getDocs(since('call_logs'))],
                ['shared_logs', 'transfers', fb.getDocs(since('shared_logs'))]
            ];
            // A transfer sent before the date but accepted after it still counts as an acceptance
            if (floor) jobs.push(['shared_logs', 'accepted', fb.getDocs(since('shared_logs', 'claimedAt'))]);
            const results = await Promise.allSettled(jobs.map((j) => j[2]));
            const raw = {};
            const problems = [];
            results.forEach((r, i) => {
                const [collectionName, key] = jobs[i];
                if (r.status === 'fulfilled') raw[key] = r.value.docs;
                else {
                    raw[key] = [];
                    console.error(`Could not read ${collectionName}:`, r.reason);
                    if (!problems.some((p) => p.name === collectionName)) problems.push({ name: collectionName, code: r.reason && r.reason.code });
                }
            });
            this.state.problems = problems;
            this.prepare(raw);
        },

        // Turns raw documents into plain records. Nothing before the chosen date is kept.
        prepare(raw) {
            const floor = this.state.floor || 0;
            const keep = (t) => t != null && t >= floor;
            const D = { users: [], byId: new Map(), sales: [], scans: [], names: [], calls: [], transfers: [], barcodeNames: new Map(), minT: null };

            raw.users.forEach((doc) => {
                const u = doc.data();
                const geo = u.geo && Number.isFinite(u.geo.lat) && Number.isFinite(u.geo.lng) ? { lat: u.geo.lat, lng: u.geo.lng, accuracy: u.geo.accuracy || null } : null;
                const user = {
                    id: doc.id, phone: u.phone || doc.id, name: u.name || '', business: u.business || '',
                    type: u.type || 'Unknown', location: u.location || '', gender: u.gender || '',
                    createdAt: toMs(u.createdAt), geo,
                    joined: u.pin !== undefined && u.pin !== null && String(u.pin) !== '' // salespeople added by a wholesaler have no PIN until they sign up
                };
                D.users.push(user);
                D.byId.set(user.id, user);
            });

            // A sale edited within its window is logged again under the same id: it counts once, at its first time, with its latest values
            const sales = new Map();
            raw.sales.forEach((doc) => {
                const d = doc.data();
                const t = toMs(d.timestamp);
                if (!keep(t) || !d.userId) return;
                const total = Number(d.total) || 0;
                const s = {
                    uid: d.userId, total, value: d.value != null ? (Number(d.value) || 0) : total,
                    qty: d.quantity != null ? (Number(d.quantity) || 0) : null,
                    price: d.price != null ? (Number(d.price) || 0) : null,
                    name: d.productName || null, barcode: d.barcode || null, unit: d.unit || null, kind: d.saleType || null
                };
                const key = d.saleId != null ? `${d.userId}|${d.saleId}` : doc.id;
                const e = sales.get(key);
                if (!e) sales.set(key, { t0: t, tv: t, s });
                else {
                    e.t0 = Math.min(e.t0, t);
                    if (t >= e.tv) { e.tv = t; e.s = s; }
                }
            });
            sales.forEach((e) => D.sales.push({ ...e.s, t: e.t0 }));

            raw.scans.forEach((doc) => {
                const d = doc.data();
                const t = toMs(d.timestamp);
                if (!keep(t) || !d.userId) return;
                if (d.type === 'name_product') D.names.push({ t, uid: d.userId, barcode: d.barcode || null, name: d.productName || '' });
                else D.scans.push({ t, uid: d.userId, type: d.type || 'scan', status: d.status || '', barcode: d.barcode || null });
            });

            raw.calls.forEach((doc) => {
                const d = doc.data();
                const t = toMs(d.timestamp);
                const uid = d.callerId || d.wholesalerId;
                if (!keep(t) || !uid) return;
                D.calls.push({ t, uid, fromName: d.callerName || d.wholesalerName || '', to: d.calleeId || d.retailerId || '', toName: d.calleeName || d.retailerName || '' });
            });

            const logs = new Map();
            raw.transfers.concat(raw.accepted || []).forEach((doc) => { if (!logs.has(doc.id)) logs.set(doc.id, doc); });
            logs.forEach((doc, id) => {
                const d = doc.data();
                if (id.startsWith('claim_') || !Array.isArray(d.items) || d.voided) return; // claim markers and duplicates are not transfers
                const items = d.items.map((it) => ({ name: it.name || '', qty: Number(it.quantity) || 0, price: Number(it.price) || 0, unit: it.unit || '', barcode: it.barcode || null }));
                D.transfers.push({
                    id, t: toMs(d.timestamp), from: d.senderId || '', fromName: d.senderStore || '', to: d.targetPhone || '',
                    claimed: !!d.claimed, claimedAt: toMs(d.claimedAt), by: d.claimedBy || null, byName: d.claimedByBusiness || d.claimedByName || '',
                    items, units: items.reduce((a, i) => a + i.qty, 0), value: items.reduce((a, i) => a + i.qty * i.price, 0)
                });
            });

            // First/last time each user did anything, and on which days
            const act = new Map();
            const touch = (uid, t) => {
                if (!uid || !keep(t)) return;
                let a = act.get(uid);
                if (!a) { a = { days: new Set(), first: t, last: t }; act.set(uid, a); }
                a.days.add(dayNum(t));
                if (t < a.first) a.first = t;
                if (t > a.last) a.last = t;
                if (D.minT == null || t < D.minT) D.minT = t;
            };
            D.sales.forEach((x) => touch(x.uid, x.t));
            D.scans.forEach((x) => touch(x.uid, x.t));
            D.names.forEach((x) => touch(x.uid, x.t));
            D.calls.forEach((x) => touch(x.uid, x.t));
            D.transfers.forEach((x) => { touch(x.from, x.t); if (x.claimed) touch(x.by, x.claimedAt); });
            this.act = act;

            // What different users call the item behind each barcode
            const addName = (barcode, name, uid) => {
                if (!barcode || !name) return;
                if (!D.barcodeNames.has(barcode)) D.barcodeNames.set(barcode, new Map());
                const names = D.barcodeNames.get(barcode);
                const key = norm(name);
                if (!names.has(key)) names.set(key, { label: name.trim(), users: new Set() });
                names.get(key).users.add(uid);
            };
            D.names.forEach((x) => addName(x.barcode, x.name, x.uid));
            D.sales.forEach((x) => addName(x.barcode, x.name, x.uid));
            D.transfers.forEach((x) => x.items.forEach((it) => addName(it.barcode, it.name, x.from)));

            this.D = D;
        },

        // ================= numbers =================
        range() {
            const now = Date.now();
            const floor = this.state.floor || 0;
            const p = this.state.period;
            const today0 = startOfDay(now);
            const sinceLabel = floor ? `Since ${fmtDay(floor)}` : 'All time';
            if (p === 'all') {
                const from = floor || this.D.minT || today0;
                return { key: 'all', from, to: now + 1, prev: null, days: Math.max(1, dayNum(now) - dayNum(from) + 1), lead: sinceLabel, span: '', label: sinceLabel, short: sinceLabel };
            }
            const days = PERIODS[p];
            const dayStart = (back) => { const d = new Date(today0); d.setDate(d.getDate() - back); return d.getTime(); }; // local midnight, safe across clock changes
            const wanted = dayStart(days - 1);
            const clipped = floor > wanted;
            const from = clipped ? floor : wanted;
            const span = `${fmtDay(from)} – ${fmtDay(now)}`;
            const prevFrom = dayStart(days * 2 - 1);
            // Only compare with the period before when there is data going back that far; otherwise every number looks like a jump
            const covered = this.D.minT != null && this.D.minT <= prevFrom + DAY;
            const prev = !clipped && prevFrom >= floor && covered ? { from: prevFrom, to: wanted } : null;
            const shown = Math.max(1, dayNum(now) - dayNum(from) + 1);
            const lead = clipped ? `${sinceLabel} · ${plural(shown, 'day')}` : `Last ${days} days`;
            const tail = clipped ? '' : span;
            return {
                key: p, from, to: now + 1, prev, days: shown, lead, span: tail,
                label: tail ? `${lead} · ${tail}` : lead,
                short: clipped ? sinceLabel : `${p}D · ${span}`
            };
        },

        statsBetween(from, to) {
            const D = this.D;
            const M = new Map();
            const get = (uid) => { if (!uid) return null; let s = M.get(uid); if (!s) { s = emptyStats(); M.set(uid, s); } return s; };
            const inR = (t) => t != null && t >= from && t < to;
            const touch = (s, t) => { s.days.add(dayNum(t)); if (t > s.last) s.last = t; };
            D.sales.forEach((x) => {
                if (!inR(x.t)) return;
                const s = get(x.uid); if (!s) return;
                s.sales++; s.volume += x.value; s.units += x.qty || 0; s.sellDays.add(dayNum(x.t)); touch(s, x.t);
            });
            D.scans.forEach((x) => { if (!inR(x.t)) return; const s = get(x.uid); if (s) { s.scans++; touch(s, x.t); } });
            D.names.forEach((x) => { if (!inR(x.t)) return; const s = get(x.uid); if (s) touch(s, x.t); });
            D.calls.forEach((x) => { if (!inR(x.t)) return; const s = get(x.uid); if (s) { s.calls++; touch(s, x.t); } });
            D.transfers.forEach((x) => {
                if (inR(x.t)) { const s = get(x.from); if (s) { s.sent++; s.sentValue += x.value; s.sentUnits += x.units; touch(s, x.t); } }
                if (x.claimed && inR(x.claimedAt)) { const s = get(x.by); if (s) { s.accepted++; s.acceptedValue += x.value; s.acceptedUnits += x.units; touch(s, x.claimedAt); } }
            });
            return M;
        },

        productKey(x) { return x.barcode ? `b:${x.barcode}` : (x.name ? `n:${norm(x.name)}` : null); },

        productStats(from, to) {
            const out = new Map();
            this.D.sales.forEach((x) => {
                if (x.t < from || x.t >= to) return;
                const key = this.productKey(x);
                if (!key) return;
                let p = out.get(key);
                if (!p) p = { key, barcode: x.barcode, names: new Map(), units: 0, revenue: 0, sales: 0, sellers: new Map(), types: new Map(), places: new Map(), unitNames: new Map(), pMin: Infinity, pMax: 0, pSum: 0, pQty: 0 };
                out.set(key, p);
                const q = x.qty || 0;
                const user = this.D.byId.get(x.uid);
                const add = (map, k, v) => map.set(k, (map.get(k) || 0) + v);
                p.units += q; p.revenue += x.value; p.sales++;
                if (x.name) add(p.names, x.name.trim(), 1);
                if (x.unit) add(p.unitNames, x.unit, 1);
                const seller = p.sellers.get(x.uid) || { units: 0, revenue: 0 };
                seller.units += q; seller.revenue += x.value; p.sellers.set(x.uid, seller);
                add(p.types, user ? user.type : 'Unknown', x.value);
                add(p.places, (user && user.location) || 'Unknown', x.value);
                if (x.price != null) { p.pMin = Math.min(p.pMin, x.price); p.pMax = Math.max(p.pMax, x.price); p.pSum += x.price * (q || 1); p.pQty += q || 1; }
            });
            return out;
        },

        recompute() {
            const D = this.D;
            const r = this.range();
            const now = Date.now();
            const cur = this.statsBetween(r.from, r.to);
            const prev = r.prev ? this.statsBetween(r.prev.from, r.prev.to) : null;
            const act = this.act;
            const isReturning = (uid, s, from) => s.days.size > 0 && (s.days.size >= 2 || (act.get(uid) && act.get(uid).first < from));
            const idsWhere = (map, test) => [...map].filter(([, s]) => test(s)).map(([uid]) => uid);

            const products = this.productStats(r.from, r.to);
            const prevProducts = r.prev ? this.productStats(r.prev.from, r.prev.to) : null;
            const sum = (map, key) => [...map.values()].reduce((a, s) => a + s[key], 0);
            const sentList = D.transfers.filter((x) => x.t != null && x.t >= r.from && x.t < r.to);
            const acceptedList = D.transfers.filter((x) => x.claimed && x.claimedAt != null && x.claimedAt >= r.from && x.claimedAt < r.to);
            const dropped = D.users.filter((u) => u.joined && act.has(u.id) && now - act.get(u.id).last > DROP_DAYS * DAY).map((u) => u.id);
            const today0 = startOfDay(now);

            this.m = {
                r, cur, prev, products, prevProducts, sentList, acceptedList, dropped,
                returning: [...cur].filter(([uid, s]) => isReturning(uid, s, r.from)).map(([uid]) => uid),
                prevReturning: prev ? [...prev].filter(([uid, s]) => isReturning(uid, s, r.prev.from)).map(([uid]) => uid) : null,
                everActive: D.users.filter((u) => u.joined && act.has(u.id)).length,
                dauAvg: [...cur.values()].reduce((a, s) => a + s.days.size, 0) / r.days,
                volume: sum(cur, 'volume'), prevVolume: prev ? sum(prev, 'volume') : null,
                salesCount: sum(cur, 'sales'), units: sum(cur, 'units'),
                unnamedSales: D.sales.filter((x) => !x.name && !x.barcode && x.t >= r.from && x.t < r.to).length, // logged before product details were recorded
                senders: idsWhere(cur, (s) => s.sent > 0), prevSenders: prev ? idsWhere(prev, (s) => s.sent > 0) : null,
                accepters: idsWhere(cur, (s) => s.accepted > 0), prevAccepters: prev ? idsWhere(prev, (s) => s.accepted > 0) : null,
                acceptRate: pct(sentList.filter((x) => x.claimed).length, sentList.length),
                activeToday: D.users.filter((u) => act.has(u.id) && act.get(u.id).last >= today0).length
            };
        },

        statusOf(u) {
            if (!u.joined) return 'invited';
            const a = this.act.get(u.id);
            if (!a) return 'none';
            const age = Date.now() - a.last;
            return age <= ACTIVE_DAYS * DAY ? 'active' : age <= DROP_DAYS * DAY ? 'cooling' : 'dropped';
        },
        statusLabel: { active: 'Active', cooling: 'Cooling', dropped: 'Dropped', none: 'No activity', invited: 'Invited' },

        // Points used for rewards: 10 for each day with a sale, 5 for each transfer sent or accepted
        points(s) { return s.sellDays.size * 10 + (s.sent + s.accepted) * 5; },

        rewardRules() {
            const saved = readLocal('pika_admin_rewards') || {};
            const p = this.state.period;
            const d = saved[p] || REWARD_DEFAULTS[p];
            return { days: d[0], transfers: d[1] };
        },

        // ================= rendering: shared =================
        renderChrome() {
            const st = this.state;
            const titles = { overview: 'Overview', users: 'Users', rewards: 'Rewards', insights: 'Insights', activity: 'Activity' };
            document.querySelectorAll('[data-tab]').forEach((b) => {
                const on = b.dataset.tab === st.tab;
                b.classList.toggle('active', on);
                if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
            });
            document.querySelectorAll('[data-period]').forEach((b) => b.classList.toggle('active', b.dataset.period === st.period));
            document.querySelectorAll('.tab-panel').forEach((p) => { p.hidden = p.id !== `tab-${st.tab}`; });
            $('verify').hidden = !(PHONE_ONLY.matches || st.tab === 'users');
            if (PHONE_ONLY.matches) $('verify-fold').open = true;
            $('page-title').textContent = PHONE_ONLY.matches ? 'Verify sign-ups' : titles[st.tab];
            const r = st.loaded && this.m ? this.m.r : null;
            // On phones the period picker already says "7 days", so only the dates are shown
            $('page-sub').innerHTML = r ? (r.span ? `<span class="lead-part">${esc(r.lead)} · </span>${esc(r.span)}` : esc(r.lead)) : '';
            const since = st.floor ? `Counting from ${fmtDay(st.floor)}` : 'Counting all time';
            document.querySelectorAll('[data-since-text]').forEach((el) => { el.textContent = since; });
            document.querySelectorAll('[data-act="since"]').forEach((el) => el.classList.toggle('on', !!st.floor));

            const notes = [];
            if (st.problems.length) {
                const unreadable = st.problems.map((p) => p.name).join(', ');
                notes.push(`Some data could not be read (${esc(unreadable)}). The Firestore rules need to let the admin read ${st.problems.length === 1 ? 'it' : 'them'}.`);
            }
            if (st.floor && !st.floorSynced) notes.push('The start date is only remembered on this device (Firestore rules do not allow saving it online).');
            const box = $('notice');
            box.hidden = !notes.length;
            box.innerHTML = notes.join('<br>');
        },

        renderAll() {
            this.renderChrome();
            const render = { overview: 'renderOverview', users: 'renderUsers', rewards: 'renderRewards', insights: 'renderInsights', activity: 'renderActivity' }[this.state.tab];
            this[render]();
        },

        setTab(tab) {
            this.state.tab = tab;
            history.replaceState(null, '', `#${tab}`);
            if (this.state.loaded) this.renderAll(); else this.renderChrome();
            window.scrollTo({ top: 0 });
        },

        setPeriod(p) {
            this.state.period = p;
            if (!this.state.loaded) { this.renderChrome(); return; }
            this.recompute();
            this.renderAll();
        },

        toast(message) {
            const t = $('toast');
            t.textContent = message;
            t.classList.add('show');
            clearTimeout(this._toast);
            this._toast = setTimeout(() => t.classList.remove('show'), 3200);
        },

        who(uid, sub, rank) {
            const u = this.D.byId.get(uid);
            const name = u ? (u.name || u.business || u.phone) : uid;
            const line = sub != null ? sub : (u ? (u.business && u.business !== name ? u.business : [u.type, u.location].filter(Boolean).join(' · ')) : '');
            const badge = rank ? `<span class="rank ${rank <= 3 ? 'podium' : ''}">${rank}</span>` : '';
            const tone = [...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0) % 6; // the same person always gets the same colour
            return `<div class="who">${badge}<span class="avatar av-${tone}">${esc(initials(name))}</span><div><div class="n">${esc(name)}</div><div class="s">${esc(line)}</div></div></div>`;
        },

        userName(uid) { const u = this.D.byId.get(uid); return u ? (u.name || u.business || u.phone) : uid; },

        delta(cur, prev, goodWhenUp = true) {
            if (prev == null) return { pill: '', cls: '' };
            if (prev === 0) return cur > 0 ? { pill: 'New', cls: goodWhenUp ? 'up' : 'down' } : { pill: '0%', cls: '' };
            const change = Math.round(((cur - prev) / prev) * 100);
            if (change === 0) return { pill: '0%', cls: '' };
            const up = change > 0;
            return { pill: `${up ? '↑' : '↓'} ${Math.abs(change)}%`, cls: up === goodWhenUp ? 'up' : 'down' };
        },

        exportCsv(name, headers, rows) {
            const cell = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
            const text = '﻿' + [headers, ...rows].map((r) => r.map(cell).join(',')).join('\n');
            const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }));
            const a = document.createElement('a');
            a.href = url; a.download = name;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        },

        table(cols, head, rowsHtml, extraClass) {
            return `<div class="tbl ${extraClass || ''}" style="--cols:${cols}">${head ? `<div class="tr th">${head}</div>` : ''}${rowsHtml}</div>`;
        },

        // ================= Overview =================
        buckets() {
            const r = this.m.r;
            const first = dayNum(r.from), last = dayNum(r.to - 1);
            const span = last - first + 1;
            const size = span > 45 ? 7 : 1; // weeks on long periods, days otherwise
            return { first, size, n: Math.ceil(span / size), idx: (t) => Math.floor((dayNum(t) - first) / size) };
        },

        // One number per day (or per week) for the big chart and for the trend line on each card
        series(kind) {
            const m = this.m, r = m.r, D = this.D, b = this.buckets();
            const sets = () => Array.from({ length: b.n }, () => new Set());
            const sizes = (list) => list.map((s) => s.size);
            const inR = (t) => t >= r.from && t < r.to;
            if (kind === 'users' || kind === 'returning') {
                const found = sets();
                m.cur.forEach((s, uid) => {
                    const a = this.act.get(uid);
                    const firstDay = a ? dayNum(a.first) : Infinity;
                    s.days.forEach((d) => {
                        if (kind === 'returning' && !(firstDay < d)) return; // a first-ever day is not a return
                        const i = Math.floor((d - b.first) / b.size);
                        if (i >= 0 && i < b.n) found[i].add(uid);
                    });
                });
                return sizes(found);
            }
            if (kind === 'sales') {
                const v = new Array(b.n).fill(0);
                D.sales.forEach((x) => { if (inR(x.t)) v[b.idx(x.t)] += x.value; });
                return v;
            }
            if (kind === 'products') {
                const found = sets();
                D.sales.forEach((x) => { const k = this.productKey(x); if (k && inR(x.t)) found[b.idx(x.t)].add(k); });
                return sizes(found);
            }
            if (kind === 'senders') { const found = sets(); m.sentList.forEach((x) => found[b.idx(x.t)].add(x.from)); return sizes(found); }
            if (kind === 'accepters') { const found = sets(); m.acceptedList.forEach((x) => found[b.idx(x.claimedAt)].add(x.by)); return sizes(found); }
            const v = new Array(b.n).fill(0); // transfers sent
            m.sentList.forEach((x) => { v[b.idx(x.t)]++; });
            return v;
        },

        spark(values, id) {
            const pts = values.length > 1 ? values : [values[0] || 0, values[0] || 0];
            const W = 100, H = 40, pad = 4;
            const max = Math.max(...pts, 1);
            const xy = pts.map((v, i) => [(i / (pts.length - 1)) * W, H - pad - (v / max) * (H - pad * 2)]);
            const line = xy.map(([x, y], i) => {
                if (!i) return `M${x.toFixed(2)} ${y.toFixed(2)}`;
                const cx = ((xy[i - 1][0] + x) / 2).toFixed(2);
                return `C${cx} ${xy[i - 1][1].toFixed(2)} ${cx} ${y.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`;
            }).join(' ');
            return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="sg-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity="0.18"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path d="${line} L${W} ${H} L0 ${H} Z" fill="url(#sg-${id})"/><path d="${line}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
        },

        metricList() {
            const m = this.m, r = m.r;
            const d = (cur, prev, good) => this.delta(cur, prev, good);
            const money = (n) => (n >= 1e7 ? `₦${+(n / 1e6).toFixed(1)}M` : naira(n));
            const vs = r.prev ? `vs previous ${PERIODS[r.key]} days` : '';
            return [
                { id: 'returning', label: 'Returning users', icon: 'repeat', tone: 'teal', value: num(m.returning.length), delta: d(m.returning.length, m.prevReturning && m.prevReturning.length, true), sub: `${m.dauAvg.toFixed(1)} active per day`, series: 'returning', period: r.short, vs },
                { id: 'dropped', label: 'Dropped off', icon: 'userMinus', tone: 'rose', value: num(m.dropped.length), delta: { pill: m.everActive ? `${pct(m.dropped.length, m.everActive)}%` : '', cls: m.dropped.length ? 'down' : '' }, sub: `of ${num(m.everActive)} who used the app`, meter: pct(m.dropped.length, m.everActive), period: `Silent ${DROP_DAYS}+ days`, fixed: true },
                { id: 'volume', label: 'Sales volume', icon: 'bag', tone: 'green', value: money(m.volume), title: naira(m.volume), delta: d(m.volume, m.prevVolume, true), sub: plural(m.salesCount, 'sale'), series: 'sales', period: r.short, vs },
                { id: 'products', label: 'Products sold', icon: 'box', tone: 'amber', value: num(m.products.size), delta: d(m.products.size, m.prevProducts && m.prevProducts.size, true), sub: `${qty(m.units)} ${m.units === 1 ? 'unit' : 'units'} sold`, series: 'products', period: r.short, vs },
                { id: 'senders', label: 'Users transferring', icon: 'send', tone: 'blue', value: num(m.senders.length), delta: d(m.senders.length, m.prevSenders && m.prevSenders.length, true), sub: `${plural(m.sentList.length, 'transfer')} sent`, series: 'senders', period: r.short, vs },
                { id: 'accepters', label: 'Users accepting', icon: 'check', tone: 'violet', value: num(m.accepters.length), delta: d(m.accepters.length, m.prevAccepters && m.prevAccepters.length, true), sub: m.sentList.length ? `${m.acceptRate}% of sent transfers accepted` : 'No transfers sent', series: 'accepters', period: r.short, vs }
            ];
        },

        renderOverview() {
            const m = this.m, r = m.r;
            const cards = this.metricList().map((c) => {
                const size = c.value.length >= 10 ? 'v-l' : c.value.length >= 8 ? 'v-m' : '';
                const trend = c.series ? this.spark(this.series(c.series), c.id) : `<span class="meter"><i style="width:${c.meter}%"></i></span>`;
                return `
                <button type="button" class="kpi tone-${c.tone}" data-metric="${c.id}" title="See the users behind this">
                    <span class="kpi-head"><span class="kpi-icon">${icon(c.icon, 16)}</span><span class="kpi-label">${esc(c.label)}</span><span class="kpi-go">${icon('chevronRight', 16)}</span></span>
                    <span class="kpi-figure"><span class="kpi-value ${size}" title="${esc(c.title || c.value)}">${esc(c.value)}</span>${c.delta.pill ? `<span class="delta ${c.delta.cls}">${esc(c.delta.pill)}</span>` : ''}</span>
                    <span class="kpi-sub">${esc(c.sub)}</span>
                    <span class="kpi-trend">${trend}</span>
                    <span class="kpi-foot"><span>${esc(c.period)}</span>${c.vs ? `<span>${esc(c.vs)}</span>` : ''}</span>
                </button>`;
            }).join('');

            const ranked = [...m.cur].map(([uid, s]) => ({ uid, s, pts: this.points(s) })).filter((x) => x.pts > 0).sort((a, b) => b.pts - a.pts).slice(0, 5);
            const topHtml = ranked.length ? this.table('1fr', '', ranked.map((x, i) => `
                <div class="tr compact" data-user="${esc(x.uid)}" style="--cols:1fr auto">
                    <div class="td">${this.who(x.uid, `${plural(x.s.sellDays.size, 'day')} with sales · ${plural(x.s.sent + x.s.accepted, 'transfer')}`, i + 1)}</div>
                    <div class="td num"><b>${num(x.pts)}</b> <span class="muted">pts</span></div>
                </div>`).join('')) : '<p class="empty">No sales or transfers in this period yet.</p>';

            const slipping = this.D.users.filter((u) => ['cooling', 'dropped'].includes(this.statusOf(u)))
                .map((u) => ({ u, a: this.act.get(u.id) })).sort((a, b) => b.a.days.size - a.a.days.size || b.a.last - a.a.last).slice(0, 5);
            const slipHtml = slipping.length ? this.table('1fr', '', slipping.map((x) => `
                <div class="tr compact" data-user="${esc(x.u.id)}" style="--cols:1fr auto">
                    <div class="td">${this.who(x.u.id, `Used it on ${plural(x.a.days.size, 'day')}`)}</div>
                    <div class="td num"><span class="pill ${this.statusOf(x.u)}">${esc(ago(x.a.last))}</span></div>
                </div>`).join('')) : '<p class="empty">Nobody is slipping away. Nice.</p>';

            const newUsers = this.D.users.filter((u) => u.joined && u.createdAt != null && u.createdAt >= r.from && u.createdAt < r.to).length;
            const calls = this.D.calls.filter((x) => x.t >= r.from && x.t < r.to).length;
            const scans = this.D.scans.filter((x) => x.t >= r.from && x.t < r.to && x.status === 'success').length;
            const transferValue = m.sentList.reduce((a, x) => a + x.value, 0);
            const mini = [
                ['Active today', m.activeToday], ['New sign-ups', newUsers], ['Users (joined)', this.D.users.filter((u) => u.joined).length],
                ['Invited salespeople', this.D.users.filter((u) => !u.joined).length], ['Scans', scans], ['Phone calls', calls],
                ['Transfer value', naira(transferValue)], ['Avg sale', naira(m.salesCount ? m.volume / m.salesCount : 0)]
            ].map(([l, v]) => `<div class="mini"><div class="v">${typeof v === 'number' ? num(v) : esc(v)}</div><div class="l">${esc(l)}</div></div>`).join('');

            $('tab-overview').innerHTML = `
                <div class="kpi-grid">${cards}</div>
                <div class="panel">
                    <div class="panel-head">
                        <h3>Activity by day</h3>
                        <div class="seg seg-sm" id="chart-by">
                            ${[['users', 'Active users'], ['sales', 'Sales'], ['transfers', 'Transfers']].map(([k, l]) => `<button type="button" data-chart="${k}" class="${this.state.chartBy === k ? 'active' : ''}">${l}</button>`).join('')}
                        </div>
                    </div>
                    ${this.chartHtml()}
                </div>
                <div class="grid-2">
                    <div class="panel">
                        <div class="panel-head"><h3>Top performers</h3><button class="link-btn" type="button" data-goto="rewards">Rewards ›</button></div>
                        ${topHtml}
                    </div>
                    <div class="panel">
                        <div class="panel-head"><h3>Slipping away</h3><button class="link-btn" type="button" data-goto="users" data-status="dropped">See all ›</button></div>
                        ${slipHtml}
                    </div>
                </div>
                <details class="fold">
                    <summary><span>More numbers <small>${esc(r.short)}</small></span></summary>
                    <div class="fold-body"><div class="mini-stats">${mini}</div></div>
                </details>`;
        },

        chartHtml() {
            const m = this.m, r = m.r, by = this.state.chartBy;
            const b = this.buckets();
            const vals = this.series(by);
            const n = b.n, size = b.size;
            const max = niceMax(Math.max(...vals, 0));
            const dayMs = (i) => { const d = new Date(r.from); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d.getTime(); };
            const host = $('tab-overview').clientWidth;
            const W = Math.max(260, (host || 640) - 42), H = 190, L = 40, B = 26, T = 10;
            const bw = (W - L - 2) / n;
            const y = (v) => T + (H - T - B) * (1 - v / max);
            const label = (v) => (by === 'sales' ? naira(v) : num(v));
            const bars = vals.map((v, i) => {
                const w = Math.max(2, Math.min(bw * 0.68, 40)), x = L + i * bw + (bw - w) / 2; // slim bars, centred in their slot
                const when = size === 1 ? fmtDay(dayMs(i)) : `${fmtDay(dayMs(i * size))} – ${fmtDay(Math.min(dayMs(i * size + size - 1), r.to - 1))}`;
                return `<rect class="bar" x="${x.toFixed(1)}" y="${y(v).toFixed(1)}" width="${w.toFixed(1)}" height="${Math.max(0, H - B - y(v)).toFixed(1)}" rx="${Math.min(4, w / 2).toFixed(1)}"><title>${esc(when)}: ${esc(label(v))}</title></rect>`;
            }).join('');
            const grid = [0, 0.5, 1].map((f) => `<line class="grid" x1="${L}" x2="${W}" y1="${y(max * f).toFixed(1)}" y2="${y(max * f).toFixed(1)}"/><text x="${L - 8}" y="${(y(max * f) + 3.5).toFixed(1)}" text-anchor="end">${esc(by === 'sales' ? compact(max * f) : num(max * f))}</text>`).join('');
            const xl = [[0, 'start'], [Math.floor((n - 1) / 2), 'middle'], [n - 1, 'end']].filter((p, i, a) => a.findIndex((q) => q[0] === p[0]) === i)
                .map(([i, anchor]) => `<text x="${(L + i * bw + bw / 2).toFixed(1)}" y="${H - 6}" text-anchor="${anchor}">${esc(fmtDay(dayMs(i * size)))}</text>`).join('');
            const total = by === 'users' ? `${m.dauAvg.toFixed(1)} on an average day` : by === 'sales' ? `${naira(m.volume)} in total` : `${plural(m.sentList.length, 'transfer')} sent`;
            return `<svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(by)} by day">${grid}${bars}${xl}</svg>
                <div class="chart-foot"><span>${esc(r.label)}${size > 1 ? ' · each bar is a week' : ''}</span><span>${esc(total)}</span></div>`;
        },

        // ================= drill-down sheets =================
        openMetric(id) {
            const m = this.m, r = m.r, c = this.metricList().find((x) => x.id === id);
            const cur = m.cur;
            const S = (uid) => cur.get(uid) || emptyStats();
            let summary = '', cols = '', head = '', rows = '', csv = null;
            const userRows = (ids, cells, sortFn) => ids.slice().sort(sortFn).map((uid) => `
                <div class="tr" data-user="${esc(uid)}" style="--cols:${cols}"><div class="td">${this.who(uid)}</div>${cells(uid, S(uid))}</div>`).join('');
            const td = (label, value, cls) => `<div class="td ${cls || 'num'}" data-label="${esc(label)}">${value}</div>`;
            const withHead = (labels) => labels.map((l, i) => `<div class="${i ? 'num' : ''}">${esc(l)}</div>`).join('');

            if (id === 'returning') {
                cols = '2.2fr 1fr 1fr 1fr';
                summary = `<strong>${plural(m.returning.length, 'user')}</strong> came back. A returning user was active in this period and has used the app on at least one other day. On an average day ${m.dauAvg.toFixed(1)} users were active.`;
                head = withHead(['User', 'Days active', 'Sales', 'Last active']);
                rows = userRows(m.returning, (uid, s) => td('Days active', num(s.days.size)) + td('Sales', naira(s.volume)) + td('Last active', esc(ago(s.last))), (a, b) => S(b).days.size - S(a).days.size || S(b).last - S(a).last);
                csv = ['returning_users.csv', ['Name', 'Business', 'Phone', 'Days active', 'Sales (NGN)', 'Last active'], m.returning.map((uid) => { const u = this.D.byId.get(uid) || {}; const s = S(uid); return [u.name, u.business, u.phone || uid, s.days.size, s.volume, new Date(s.last).toISOString()]; })];
            } else if (id === 'dropped') {
                cols = '2.2fr 1fr 1fr 1fr';
                summary = `<strong>${plural(m.dropped.length, 'user')}</strong> used the app before but have done nothing for more than ${DROP_DAYS} days. This does not depend on the period you picked.`;
                head = withHead(['User', 'Silent for', 'Days used before', 'Call']);
                rows = m.dropped.slice().sort((a, b) => this.act.get(b).days.size - this.act.get(a).days.size).map((uid) => {
                    const u = this.D.byId.get(uid), a = this.act.get(uid);
                    return `<div class="tr" data-user="${esc(uid)}" style="--cols:${cols}"><div class="td">${this.who(uid)}</div>
                        ${td('Silent for', esc(ago(a.last)))}${td('Days used before', num(a.days.size))}
                        ${td('Call', u && u.phone ? `<a class="link-btn" href="tel:${esc(u.phone)}">${esc(u.phone)}</a>` : '—')}</div>`;
                }).join('');
                csv = ['dropped_users.csv', ['Name', 'Business', 'Phone', 'Type', 'Location', 'Last active', 'Days used before'], m.dropped.map((uid) => { const u = this.D.byId.get(uid) || {}, a = this.act.get(uid); return [u.name, u.business, u.phone, u.type, u.location, new Date(a.last).toISOString(), a.days.size]; })];
            } else if (id === 'volume') {
                const ids = [...cur].filter(([, s]) => s.sales > 0).map(([uid]) => uid);
                cols = '2.2fr 1fr 1fr 1fr';
                summary = `<strong>${naira(m.volume)}</strong> from ${plural(m.salesCount, 'sale')} by ${plural(ids.length, 'user')}. Credit sales are counted at their full value.`;
                head = withHead(['User', 'Sales', 'Volume', 'Share']);
                rows = userRows(ids, (uid, s) => td('Sales', num(s.sales)) + td('Volume', naira(s.volume)) + td('Share', `${pct(s.volume, m.volume)}%`), (a, b) => S(b).volume - S(a).volume);
                csv = ['sales_volume.csv', ['Name', 'Business', 'Phone', 'Sales', 'Volume (NGN)'], ids.map((uid) => { const u = this.D.byId.get(uid) || {}; return [u.name, u.business, u.phone || uid, S(uid).sales, S(uid).volume]; })];
            } else if (id === 'products') {
                const list = [...m.products.values()].sort((a, b) => b.revenue - a.revenue);
                cols = '2.2fr 1fr 1fr 1fr';
                summary = `<strong>${plural(list.length, 'product')}</strong> sold, ${qty(m.units)} ${m.units === 1 ? 'unit' : 'units'} in total.${m.unnamedSales ? ` ${plural(m.unnamedSales, 'older sale')} in this period have no product name, so they are not listed here.` : ''}`;
                head = withHead(['Product', 'Units', 'Revenue', 'Sold by']);
                rows = list.map((p) => `<div class="tr" style="--cols:${cols}"><div class="td"><div class="who"><div><div class="n">${esc(this.productName(p))}</div><div class="s">${esc(p.barcode || 'No barcode')}</div></div></div></div>
                    ${td('Units', qty(p.units))}${td('Revenue', naira(p.revenue))}${td('Sold by', plural(p.sellers.size, 'user'))}</div>`).join('');
                csv = ['products_sold.csv', ['Product', 'Barcode', 'Units', 'Revenue (NGN)', 'Sellers'], list.map((p) => [this.productName(p), p.barcode || '', p.units, p.revenue, p.sellers.size])];
            } else if (id === 'senders') {
                const ids = m.senders;
                cols = '2.2fr 1fr 1fr 1fr';
                summary = `<strong>${plural(ids.length, 'user')}</strong> sent ${plural(m.sentList.length, 'transfer')}.`;
                head = withHead(['User', 'Sent', 'Units', 'Value']);
                rows = userRows(ids, (uid, s) => td('Sent', num(s.sent)) + td('Units', num(s.sentUnits)) + td('Value', naira(s.sentValue)), (a, b) => S(b).sent - S(a).sent);
                csv = ['users_transferring.csv', ['Name', 'Business', 'Phone', 'Transfers sent', 'Units', 'Value (NGN)'], ids.map((uid) => { const u = this.D.byId.get(uid) || {}; const s = S(uid); return [u.name, u.business, u.phone || uid, s.sent, s.sentUnits, s.sentValue]; })];
            } else if (id === 'accepters') {
                const ids = m.accepters;
                cols = '2.2fr 1fr 1fr 1fr';
                summary = `<strong>${plural(ids.length, 'user')}</strong> accepted ${plural(m.acceptedList.length, 'transfer')}. ${m.sentList.length ? `${m.acceptRate}% of the transfers sent in this period have been accepted.` : ''}`;
                head = withHead(['User', 'Accepted', 'Units', 'Value']);
                rows = userRows(ids, (uid, s) => td('Accepted', num(s.accepted)) + td('Units', num(s.acceptedUnits)) + td('Value', naira(s.acceptedValue)), (a, b) => S(b).accepted - S(a).accepted);
                csv = ['users_accepting.csv', ['Name', 'Business', 'Phone', 'Transfers accepted', 'Units', 'Value (NGN)'], ids.map((uid) => { const u = this.D.byId.get(uid) || {}; const s = S(uid); return [u.name, u.business, u.phone || uid, s.accepted, s.acceptedUnits, s.acceptedValue]; })];
            }

            this.pushSheet({
                title: c.label, sub: c.fixed ? c.period : r.label,
                html: `<p class="lead">${summary}</p>
                    <div class="filter-row"><input class="search" type="search" data-sheet-search placeholder="Search this list"><button class="btn sm" type="button" data-csv>Export CSV</button></div>
                    ${rows ? this.table(cols, head, `<div data-sheet-rows>${rows}</div>`) : '<p class="empty">Nobody yet for this period.</p>'}`,
                csv
            });
        },

        productName(p) { const best = top(p.names); return best ? best[0] : (p.barcode ? `Barcode ${p.barcode}` : 'Unnamed'); },

        openUser(uid) {
            const D = this.D, m = this.m;
            const u = D.byId.get(uid) || { id: uid, phone: uid, name: '', business: '', type: 'Unknown', location: '', joined: true };
            const s = m.cur.get(uid) || emptyStats();
            const a = this.act.get(uid);
            const status = this.statusOf(u);
            const isNew = u.createdAt && Date.now() - u.createdAt <= 7 * DAY;
            const kpi = (v, l) => `<div class="mini"><div class="v">${v}</div><div class="l">${esc(l)}</div></div>`;
            const geo = u.geo
                ? `${u.geo.lat.toFixed(4)}, ${u.geo.lng.toFixed(4)}${u.geo.accuracy ? ` (±${num(u.geo.accuracy)} m)` : ''} · <a class="link-btn" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${u.geo.lat},${u.geo.lng}">Open map</a>`
                : '<span class="muted">Not captured yet</span>';
            const events = [];
            D.sales.forEach((x) => { if (x.uid === uid) events.push([x.t, `Sold ${x.name ? esc(x.name) : 'an item'} · ${naira(x.value)}`]); });
            D.scans.forEach((x) => { if (x.uid === uid) events.push([x.t, `Scanned a barcode${x.status && x.status !== 'success' ? ' (not found)' : ''}`]); });
            D.calls.forEach((x) => { if (x.uid === uid) events.push([x.t, `Called ${esc(x.toName || x.to || 'a customer')}`]); });
            D.transfers.forEach((x) => {
                if (x.from === uid && x.t != null) events.push([x.t, `Sent a transfer · ${naira(x.value)}`]);
                if (x.claimed && x.by === uid && x.claimedAt != null) events.push([x.claimedAt, `Accepted a transfer · ${naira(x.value)}`]);
            });
            events.sort((p, q) => q[0] - p[0]);

            this.pushSheet({
                title: u.name || u.business || u.phone, sub: [u.business && u.business !== u.name ? u.business : '', u.type].filter(Boolean).join(' · '),
                html: `
                    <div class="actions"><span class="pill ${status}">${esc(this.statusLabel[status])}</span>${isNew ? '<span class="pill new">New</span>' : ''}${u.location ? `<span class="pill">${esc(u.location)}</span>` : ''}</div>
                    <div><p class="lead" style="margin-bottom:8px">${esc(m.r.label)}</p>
                    <div class="tiles">${kpi(num(s.days.size), 'Days active')}${kpi(num(s.sales), 'Sales')}${kpi(naira(s.volume), 'Volume')}${kpi(num(s.sent), 'Sent')}${kpi(num(s.accepted), 'Accepted')}${kpi(num(s.scans), 'Scans')}${kpi(num(s.calls), 'Calls')}</div></div>
                    <div class="profile-grid">
                        <div><div class="l">Phone</div><div class="v">${u.phone ? `<a class="link-btn" href="tel:${esc(u.phone)}">${esc(u.phone)}</a>` : '—'}</div></div>
                        <div><div class="l">Joined</div><div class="v">${u.createdAt ? esc(fmtDate(u.createdAt)) : (u.joined ? '—' : 'Not yet')}</div></div>
                        <div><div class="l">First activity</div><div class="v">${a ? esc(fmtDate(a.first)) : '—'}</div></div>
                        <div><div class="l">Last activity</div><div class="v">${a ? esc(ago(a.last)) : '—'}</div></div>
                        <div><div class="l">Gender</div><div class="v">${esc(u.gender || '—')}</div></div>
                        <div><div class="l">Sign-up location (GPS)</div><div class="v">${geo}</div></div>
                    </div>
                    <div><div class="panel-head"><h3>Recent activity</h3><span class="hint">Latest 10</span></div>
                    ${events.length ? `<div class="timeline">${events.slice(0, 10).map((e) => `<div class="ev"><span>${e[1]}</span><span>${esc(ago(e[0]))}</span></div>`).join('')}</div>` : '<p class="empty">Nothing counted since the start date.</p>'}</div>`
            });
        },

        pushSheet(def) {
            this.state.sheets.push(def);
            this.showSheet();
        },
        showSheet() {
            const def = this.state.sheets[this.state.sheets.length - 1];
            $('sheet-title').textContent = def.title;
            $('sheet-sub').textContent = def.sub || '';
            $('sheet-body').innerHTML = def.html;
            $('sheet-back').hidden = this.state.sheets.length < 2;
            $('sheet').hidden = false;
            $('sheet-body').scrollTop = 0;
            document.body.style.overflow = 'hidden';
        },
        backSheet() {
            this.state.sheets.pop();
            if (this.state.sheets.length) this.showSheet(); else this.closeSheet();
        },
        closeSheet() {
            this.state.sheets = [];
            $('sheet').hidden = true;
            document.body.style.overflow = '';
        },

        // ================= start date =================
        openSinceSheet() {
            const floor = this.state.floor;
            const toInput = (ms) => { const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
            this.pushSheet({
                title: 'Count from a date', sub: floor ? `Now counting from ${fmtDate(floor)}` : 'Now counting everything',
                html: `
                    <p class="lead">Pick a day. Every number on this dashboard will ignore anything that happened before it. <strong>Nothing is deleted</strong>, so you can move or clear the date any time.</p>
                    <div class="field"><label for="since-input">Start counting on</label><input type="date" id="since-input" value="${floor ? toInput(floor) : toInput(Date.now())}" max="${toInput(Date.now())}"></div>
                    <div class="actions">
                        <button class="btn primary" type="button" data-since="apply">Start counting from this day</button>
                        <button class="btn" type="button" data-since="today">From today</button>
                        ${floor ? '<button class="btn" type="button" data-since="clear">Count everything</button>' : ''}
                    </div>`
            });
        },

        async applyFloor(ms) {
            const fb = window.fb;
            const record = { startAt: ms, savedAt: Date.now() };
            let synced = true;
            try { await fb.setDoc(fb.doc(fb.db, 'admin_settings', 'dashboard'), record, { merge: true }); }
            catch (error) { console.error('Could not save the start date online:', error); synced = false; }
            writeLocal('pika_admin_start', record);
            this.closeSheet();
            this.toast(ms ? `Counting from ${fmtDate(ms)}${synced ? '' : ' (this device only)'}` : 'Counting everything again');
            await this.refresh();
        },

        // ================= events =================
        onClick(e) {
            const t = e.target;
            const hit = (sel) => t.closest(sel);
            let el;
            if ((el = hit('[data-since]'))) {
                const kind = el.dataset.since;
                if (kind === 'clear') return this.applyFloor(null);
                if (kind === 'today') return this.applyFloor(startOfDay(Date.now()));
                const v = $('since-input').value;
                if (!v) { this.toast('Pick a date first'); return; }
                const [y, mo, d] = v.split('-').map(Number);
                return this.applyFloor(new Date(y, mo - 1, d).getTime());
            }
            if ((el = hit('[data-csv]'))) {
                const def = this.state.sheets[this.state.sheets.length - 1];
                if (def && def.csv) this.exportCsv(...def.csv);
                return;
            }
            if ((el = hit('[data-metric]'))) return this.openMetric(el.dataset.metric);
            if ((el = hit('[data-user]'))) { if (hit('a')) return; return this.openUser(el.dataset.user); }
            if ((el = hit('[data-goto]'))) {
                if (el.dataset.status) this.state.f = { ...this.state.f, status: el.dataset.status, limit: PAGE };
                this.closeSheet();
                return this.setTab(el.dataset.goto);
            }
            if ((el = hit('[data-chart]'))) { this.state.chartBy = el.dataset.chart; return this.renderOverview(); }
            if ((el = hit('[data-ustatus]'))) { this.state.f.status = el.dataset.ustatus; this.state.f.limit = PAGE; return this.renderUserList(); }
            if ((el = hit('[data-usort]'))) { this.state.f.sort = el.dataset.usort; return this.renderUserList(); }
            if ((el = hit('[data-umore]'))) { this.state.f.limit += PAGE; return this.renderUserList(); }
            if ((el = hit('[data-uexport]'))) return this.exportUsers();
            if ((el = hit('[data-rw]'))) { this.state.rewards.filter = el.dataset.rw; this.state.rewards.limit = PAGE; return this.renderRewardList(); }
            if ((el = hit('[data-rmore]'))) { this.state.rewards.limit += PAGE; return this.renderRewardList(); }
            if ((el = hit('[data-rexport]'))) return this.exportRewards();
            if ((el = hit('[data-by]'))) { this.state.insights.by = el.dataset.by; return this.renderInsights(); }
            if ((el = hit('[data-product]'))) {
                const open = this.state.insights.open, k = el.dataset.product;
                if (open.has(k)) open.delete(k); else open.add(k);
                return this.renderProductList();
            }
            if ((el = hit('[data-imore]'))) { this.state.insights.limit += 12; return this.renderProductList(); }
            if ((el = hit('[data-amore]'))) { this.state.activity.limits[el.dataset.amore] += PAGE; return this.renderActivity(); }
            if ((el = hit('[data-diff]'))) { this.state.activity.diffOnly = !this.state.activity.diffOnly; return this.renderActivity(); }
        },

        onInput(e) {
            const el = e.target;
            const f = this.state.f;
            if (el.matches('[data-sheet-search]')) {
                const q = norm(el.value);
                document.querySelectorAll('#sheet-body [data-sheet-rows] .tr').forEach((row) => { row.style.display = !q || norm(row.textContent).includes(q) ? '' : 'none'; });
            } else if (el.id === 'u-q') { f.q = el.value; f.limit = PAGE; this.renderUserList(); }
            else if (el.id === 'u-type') { f.type = el.value; f.limit = PAGE; this.renderUserList(); }
            else if (el.id === 'u-loc') { f.location = el.value; f.limit = PAGE; this.renderUserList(); }
            else if (el.id === 'u-gps') { f.gps = el.value; f.limit = PAGE; this.renderUserList(); }
            else if (el.id === 'u-sort') { f.sort = el.value; this.renderUserList(); }
            else if (el.id === 'i-q') { this.state.insights.q = el.value; this.state.insights.limit = 12; this.renderProductList(); }
            else if (el.id === 'rw-days' || el.id === 'rw-transfers') {
                const saved = readLocal('pika_admin_rewards') || {};
                saved[this.state.period] = [Math.max(0, Number($('rw-days').value) || 0), Math.max(0, Number($('rw-transfers').value) || 0)];
                writeLocal('pika_admin_rewards', saved);
                this.renderRewardList();
            } else if (el.id === 'c-q') { this.state.activity.callQ = el.value; this.renderCalls(); }
            else if (el.id === 'b-q') { this.state.activity.barQ = el.value; this.renderBarcodes(); }
            else if (el.id === 't-q') { this.state.activity.trQ = el.value; this.renderTransfers(); }
        },

        onToggle(e) {
            const d = e.target;
            if (!d.matches || !d.matches('details[data-fold]')) return;
            if (d.open) this.state.activity.folds.add(d.dataset.fold); else this.state.activity.folds.delete(d.dataset.fold);
        },

        // ================= Users =================
        decorateUsers() {
            return this.D.users.map((u) => ({ u, s: this.m.cur.get(u.id) || emptyStats(), a: this.act.get(u.id) || null, status: this.statusOf(u) }));
        },

        renderUsers() {
            const f = this.state.f;
            const D = this.D;
            const types = [...new Set(D.users.map((u) => u.type))].sort();
            const places = [...countBy(D.users.map((u) => u.location).filter(Boolean))].sort((a, b) => b[1] - a[1]).map(([k]) => k);
            const opt = (v, label, cur) => `<option value="${esc(v)}" ${cur === v ? 'selected' : ''}>${esc(label)}</option>`;
            $('tab-users').innerHTML = `
                <div class="panel filters">
                    <div class="filter-row">
                        <input class="search" id="u-q" type="search" placeholder="Search name, business, phone, place…" value="${esc(f.q)}">
                        <select class="select" id="u-type" aria-label="Type">${opt('all', 'All types', f.type)}${types.map((t) => opt(t, t, f.type)).join('')}</select>
                        <select class="select" id="u-loc" aria-label="Location">${opt('all', 'All places', f.location)}${places.map((t) => opt(t, t, f.location)).join('')}</select>
                        <select class="select" id="u-gps" aria-label="GPS">${opt('all', 'Any GPS', f.gps)}${opt('yes', 'Has GPS', f.gps)}${opt('no', 'No GPS', f.gps)}</select>
                        <select class="select" id="u-sort" aria-label="Sort">${[['recent', 'Recently active'], ['sales', 'Most sales'], ['days', 'Most active days'], ['new', 'Newest'], ['name', 'Name A–Z']].map(([v, l]) => opt(v, l, f.sort)).join('')}</select>
                    </div>
                    <div class="chips" id="u-chips"></div>
                    <p class="lead" id="u-insight"></p>
                </div>
                <div class="panel"><div id="u-list"></div></div>`;
            this.renderUserList();
        },

        renderUserList() {
            const f = this.state.f;
            const all = this.decorateUsers();
            const terms = norm(f.q).split(' ').filter(Boolean);
            const hay = (x) => norm([x.u.name, x.u.business, x.u.phone, x.u.location, x.u.type, this.statusLabel[x.status], x.u.geo ? 'gps' : ''].join(' '));
            const base = all.filter((x) => (f.type === 'all' || x.u.type === f.type)
                && (f.location === 'all' || x.u.location === f.location)
                && (f.gps === 'all' || (f.gps === 'yes') === !!x.u.geo)
                && terms.every((t) => hay(x).includes(t)));
            const counts = countBy(base.map((x) => x.status));
            const chips = [['all', 'All', base.length], ...['active', 'cooling', 'dropped', 'none', 'invited'].map((k) => [k, this.statusLabel[k], counts.get(k) || 0])];
            $('u-chips').innerHTML = chips.map(([k, l, n]) => `<button type="button" class="chip ${f.status === k ? 'on' : ''}" data-ustatus="${k}">${esc(l)}<b>${num(n)}</b></button>`).join('');

            const rows = base.filter((x) => f.status === 'all' || x.status === f.status);
            const sorters = {
                recent: (a, b) => (b.a ? b.a.last : 0) - (a.a ? a.a.last : 0),
                sales: (a, b) => b.s.volume - a.s.volume,
                days: (a, b) => b.s.days.size - a.s.days.size,
                new: (a, b) => (b.u.createdAt || 0) - (a.u.createdAt || 0),
                name: (a, b) => (a.u.name || a.u.business || '').localeCompare(b.u.name || b.u.business || '')
            };
            rows.sort(sorters[f.sort] || sorters.recent);

            // One sentence that says what the current list is telling you
            const gone = rows.filter((x) => x.status === 'dropped');
            let insight = `${plural(rows.length, 'user')}`;
            if (rows.length) {
                const act = rows.filter((x) => x.status === 'active').length;
                insight += ` · ${act} active`;
                if (gone.length) {
                    const place = top(countBy(gone.map((x) => x.u.location).filter(Boolean)));
                    const type = top(countBy(gone.map((x) => x.u.type)));
                    insight += ` · ${gone.length} dropped off${place && gone.length > 2 ? ` (mostly ${type[0]}s${place[1] > 1 ? ` in ${place[0]}` : ''})` : ''}`;
                }
                const gps = rows.filter((x) => x.u.geo).length;
                insight += ` · ${gps} with GPS`;
            }
            $('u-insight').textContent = insight;

            const shown = rows.slice(0, f.limit);
            const cols = 'minmax(0, 2.4fr) minmax(0, 1.3fr) minmax(124px, 1.3fr) minmax(0, 1.2fr) minmax(0, 1fr)';
            const html = shown.map((x) => `
                <div class="tr" data-user="${esc(x.u.id)}" style="--cols:${cols}">
                    <div class="td">${this.who(x.u.id, x.u.business && x.u.business !== x.u.name ? x.u.business : '')}</div>
                    <div class="td" data-label="Type · place">${esc(x.u.type)}<div class="s">${esc(x.u.location || '—')}${x.u.geo ? ' · GPS' : ''}</div></div>
                    <div class="td" data-label="Status"><span class="pills"><span class="pill ${x.status}">${esc(this.statusLabel[x.status])}</span>${x.u.createdAt && Date.now() - x.u.createdAt <= 7 * DAY ? '<span class="pill new">New</span>' : ''}</span><div class="s">${x.a ? esc(ago(x.a.last)) : 'Never active'}</div></div>
                    <div class="td num" data-label="Activity">${x.s.volume ? naira(x.s.volume) : '—'}<div class="s">${x.s.days.size ? `${plural(x.s.days.size, 'day')} active` : 'Not active'}</div></div>
                    <div class="td num" data-label="Sent / accepted">${x.s.sent || x.s.accepted ? `${num(x.s.sent)} / ${num(x.s.accepted)}` : '—'}</div>
                </div>`).join('');
            const head = ['User', 'Type & place', 'Status', 'Sales & days', 'Sent / accepted'].map((l, i) => `<div class="${i > 2 ? 'num' : ''}">${esc(l)}</div>`).join('');
            $('u-list').innerHTML = `
                <div class="panel-head"><h3>${esc(this.m.r.short)}</h3><button class="link-btn" type="button" data-uexport>Export CSV</button></div>
                ${shown.length ? this.table(cols, head, html) : '<p class="empty">No users match these filters.</p>'}
                ${rows.length > shown.length ? `<div class="actions" style="justify-content:center;margin-top:12px"><button class="btn" type="button" data-umore>Show more (${num(rows.length - shown.length)} left)</button></div>` : ''}`;
        },

        exportUsers() {
            const rows = this.decorateUsers().map((x) => [x.u.name, x.u.business, x.u.phone, x.u.type, x.u.location, x.u.gender, this.statusLabel[x.status],
                x.u.createdAt ? new Date(x.u.createdAt).toISOString() : '', x.a ? new Date(x.a.last).toISOString() : '', x.s.days.size, x.s.volume, x.s.sent, x.s.accepted, x.u.geo ? x.u.geo.lat : '', x.u.geo ? x.u.geo.lng : '']);
            this.exportCsv('pikashot_users.csv', ['Name', 'Business', 'Phone', 'Type', 'Location', 'Gender', 'Status', 'Joined', 'Last active', `Days active (${this.m.r.short})`, 'Sales (NGN)', 'Transfers sent', 'Transfers accepted', 'Latitude', 'Longitude'], rows);
        },

        // ================= Rewards =================
        rewardRows() {
            const rules = this.rewardRules();
            return [...this.m.cur].map(([uid, s]) => {
                const regular = s.sellDays.size >= rules.days && rules.days > 0;
                const star = s.sent + s.accepted >= rules.transfers && rules.transfers > 0;
                return { uid, s, pts: this.points(s), regular, star };
            }).filter((x) => x.pts > 0).sort((a, b) => b.pts - a.pts);
        },

        renderRewards() {
            const rules = this.rewardRules();
            $('tab-rewards').innerHTML = `
                <div class="panel">
                    <div class="panel-head"><h3>Who deserves a reward</h3><span class="hint">${esc(this.m.r.label)}</span></div>
                    <div class="rule-box">
                        <label>Regular seller: sold on at least<input class="num-input" id="rw-days" type="number" min="0" inputmode="numeric" value="${rules.days}"> days</label>
                        <label>Transfer star: sent or accepted at least<input class="num-input" id="rw-transfers" type="number" min="0" inputmode="numeric" value="${rules.transfers}"> transfers</label>
                    </div>
                    <p class="points-note">Points: 10 for each day a user logged a sale, 5 for each transfer sent or accepted. The limits above are saved for each period.</p>
                </div>
                <div class="panel"><div class="chips" id="rw-chips" style="margin-bottom:10px"></div><div id="rw-list"></div></div>`;
            this.renderRewardList();
        },

        renderRewardList() {
            const st = this.state.rewards;
            const all = this.rewardRows();
            const counts = { all: all.filter((x) => x.regular || x.star).length, regular: all.filter((x) => x.regular).length, star: all.filter((x) => x.star).length, both: all.filter((x) => x.regular && x.star).length, any: all.length };
            const chips = [['all', 'Qualifying', counts.all], ['regular', 'Regular sellers', counts.regular], ['star', 'Transfer stars', counts.star], ['both', 'Both', counts.both], ['any', 'Everyone active', counts.any]];
            $('rw-chips').innerHTML = chips.map(([k, l, n]) => `<button type="button" class="chip ${st.filter === k ? 'on' : ''}" data-rw="${k}">${esc(l)}<b>${num(n)}</b></button>`).join('');
            const pick = { all: (x) => x.regular || x.star, regular: (x) => x.regular, star: (x) => x.star, both: (x) => x.regular && x.star, any: () => true }[st.filter];
            const rows = all.filter(pick);
            const shown = rows.slice(0, st.limit);
            const cols = 'minmax(0, 2.4fr) minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, .8fr) minmax(136px, 1.5fr)';
            const head = ['User', 'Sales', 'Sent / accepted', 'Points', 'Badges'].map((l, i) => `<div class="${i > 0 && i < 4 ? 'num' : ''}">${esc(l)}</div>`).join('');
            const html = shown.map((x, i) => `
                <div class="tr" data-user="${esc(x.uid)}" style="--cols:${cols}">
                    <div class="td">${this.who(x.uid, undefined, i + 1)}</div>
                    <div class="td num" data-label="Sales">${naira(x.s.volume)}<div class="s">${plural(x.s.sales, 'sale')} · ${plural(x.s.sellDays.size, 'day')}</div></div>
                    <div class="td num" data-label="Sent / accepted">${num(x.s.sent)} / ${num(x.s.accepted)}</div>
                    <div class="td num" data-label="Points"><b>${num(x.pts)}</b></div>
                    <div class="td" data-label="Badges"><span class="pills">${x.regular ? '<span class="pill active">Regular seller</span>' : ''}${x.star ? '<span class="pill gold">Transfer star</span>' : ''}${!x.regular && !x.star ? '<span class="muted">—</span>' : ''}</span></div>
                </div>`).join('');
            $('rw-list').innerHTML = `
                <div class="panel-head"><h3>${plural(rows.length, 'user')}</h3><button class="link-btn" type="button" data-rexport>Export CSV</button></div>
                ${shown.length ? this.table(cols, head, html) : '<p class="empty">Nobody meets these limits in this period. Lower the limits or pick a longer period.</p>'}
                ${rows.length > shown.length ? `<div class="actions" style="justify-content:center;margin-top:12px"><button class="btn" type="button" data-rmore>Show more (${num(rows.length - shown.length)} left)</button></div>` : ''}`;
        },

        exportRewards() {
            const st = this.state.rewards;
            const rows = this.rewardRows().filter((x) => ({ all: x.regular || x.star, regular: x.regular, star: x.star, both: x.regular && x.star, any: true }[st.filter]));
            this.exportCsv('pikashot_rewards.csv', ['Rank', 'Name', 'Business', 'Phone', 'Days with a sale', 'Sales', 'Volume (NGN)', 'Transfers sent', 'Transfers accepted', 'Points', 'Regular seller', 'Transfer star'],
                rows.map((x, i) => { const u = this.D.byId.get(x.uid) || {}; return [i + 1, u.name, u.business, u.phone || x.uid, x.s.sellDays.size, x.s.sales, x.s.volume, x.s.sent, x.s.accepted, x.pts, x.regular ? 'Yes' : '', x.star ? 'Yes' : '']; }));
        },

        // ================= Insights =================
        renderInsights() {
            const m = this.m, st = this.state.insights;
            const list = [...m.products.values()];
            const typeTotals = new Map(), placeTotals = new Map();
            list.forEach((p) => {
                p.types.forEach((v, k) => typeTotals.set(k, (typeTotals.get(k) || 0) + v));
                p.places.forEach((v, k) => placeTotals.set(k, (placeTotals.get(k) || 0) + v));
            });
            const revenue = list.reduce((a, p) => a + p.revenue, 0);
            const sellers = new Set(); list.forEach((p) => p.sellers.forEach((_, uid) => sellers.add(uid)));
            const topProduct = list.slice().sort((a, b) => b.revenue - a.revenue)[0];
            const mini = [
                ['Products sold', num(list.length)], ['Units sold', qty(list.reduce((a, p) => a + p.units, 0))], ['Revenue', naira(revenue)],
                ['Sellers', num(sellers.size)], ['Best seller', topProduct ? this.productName(topProduct) : '—']
            ].map(([l, v]) => `<div class="mini"><div class="v">${esc(v)}</div><div class="l">${esc(l)}</div></div>`).join('');

            const split = (map, title) => {
                const entries = [...map].sort((a, b) => b[1] - a[1]);
                const total = entries.reduce((a, e) => a + e[1], 0);
                if (!total) return `<div class="panel"><div class="panel-head"><h3>${esc(title)}</h3></div><p class="empty">No data yet.</p></div>`;
                const shownE = entries.slice(0, 6);
                return `<div class="panel"><div class="panel-head"><h3>${esc(title)}</h3><span class="hint">share of revenue</span></div>
                    <div class="split-bar">${shownE.map(([k, v], i) => `<i style="width:${(v / total) * 100}%;background:${SEGMENT_COLORS[i % SEGMENT_COLORS.length]}" title="${esc(k)}"></i>`).join('')}</div>
                    <div class="legend">${shownE.map(([k, v], i) => `<span style="--c:${SEGMENT_COLORS[i % SEGMENT_COLORS.length]}">${esc(k)} ${pct(v, total)}%</span>`).join('')}</div></div>`;
            };

            $('tab-insights').innerHTML = `
                <div class="panel">
                    <div class="panel-head"><h3>Products</h3><span class="hint">${esc(m.r.label)}</span></div>
                    <div class="mini-stats">${mini}</div>
                    ${m.unnamedSales ? `<p class="points-note">${plural(m.unnamedSales, 'older sale')} in this period have no product name, so they are not in these lists. New sales record full details.</p>` : ''}
                </div>
                <div class="grid-2">${split(typeTotals, 'Who sells (outlet type)')}${split(placeTotals, 'Where it sells')}</div>
                <div class="panel">
                    <div class="filter-row" style="margin-bottom:6px">
                        <input class="search" id="i-q" type="search" placeholder="Search products" value="${esc(st.q)}">
                        <div class="seg" style="margin:0">${[['revenue', 'Revenue'], ['units', 'Units'], ['sellers', 'Sellers']].map(([k, l]) => `<button type="button" data-by="${k}" class="${st.by === k ? 'active' : ''}">${l}</button>`).join('')}</div>
                    </div>
                    <div id="i-list"></div>
                </div>`;
            this.renderProductList();
        },

        renderProductList() {
            const m = this.m, st = this.state.insights;
            const valueOf = (p) => st.by === 'units' ? p.units : st.by === 'sellers' ? p.sellers.size : p.revenue;
            const all = [...m.products.values()].sort((a, b) => valueOf(b) - valueOf(a));
            const total = all.reduce((a, p) => a + valueOf(p), 0);
            const maxV = all.length ? valueOf(all[0]) : 0;
            const q = norm(st.q);
            const rankOf = new Map(all.map((p, i) => [p.key, i + 1]));
            const rows = all.filter((p) => !q || norm([...p.names.keys()].join(' ') + ' ' + (p.barcode || '')).includes(q));
            const fmt = (p) => st.by === 'units' ? `${qty(p.units)}` : st.by === 'sellers' ? `${num(p.sellers.size)}` : naira(p.revenue);
            const kvs = (map, n, total2) => [...map].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `<div class="kv"><span>${esc(k)}</span><span>${pct(v, total2)}%</span></div>`).join('') || '<span class="muted">—</span>';
            const html = rows.slice(0, st.limit).map((p) => {
                const open = st.open.has(p.key);
                const unit = (top(p.unitNames) || ['units'])[0];
                const avg = p.pQty ? p.pSum / p.pQty : 0;
                const variants = p.barcode && this.D.barcodeNames.get(p.barcode) ? [...this.D.barcodeNames.get(p.barcode).values()].sort((a, b) => b.users.size - a.users.size) : [];
                const topSellers = [...p.sellers].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 3);
                const more = open ? `
                    <div class="bar-more">
                        <div><h5>Sold for</h5>
                            <div class="kv"><span>Average price</span><span>${naira(avg)}</span></div>
                            <div class="kv"><span>Lowest – highest</span><span>${p.pMax ? `${naira(p.pMin)} – ${naira(p.pMax)}` : '—'}</span></div>
                            <div class="kv"><span>Units sold</span><span>${qty(p.units)} ${esc(unit)}</span></div>
                            <div class="kv"><span>Revenue</span><span>${naira(p.revenue)}</span></div></div>
                        <div><h5>By outlet type</h5>${kvs(p.types, 4, p.revenue)}</div>
                        <div><h5>Where</h5>${kvs(p.places, 4, p.revenue)}</div>
                        <div><h5>Top sellers</h5>${topSellers.map(([uid, v]) => `<div class="kv"><span>${esc(this.userName(uid))}</span><span>${naira(v.revenue)}</span></div>`).join('')}</div>
                        ${variants.length > 1 ? `<div><h5>Also called</h5><div class="name-chips">${variants.map((v) => `<span class="name-chip">${esc(v.label)}<b>${v.users.size}</b></span>`).join('')}</div></div>` : ''}
                    </div>` : '';
                return `<div class="bar-row">
                    <div class="bar-top" data-product="${esc(p.key)}">
                        <span class="rank ${rankOf.get(p.key) <= 3 ? 'podium' : ''}">${rankOf.get(p.key)}</span>
                        <div class="bar-name"><div class="n">${esc(this.productName(p))}</div><div class="s">${plural(p.sellers.size, 'seller')} · avg ${naira(avg)} · ${qty(p.units)} ${esc(unit)}</div></div>
                        <div class="bar-val">${fmt(p)}<small>${pct(valueOf(p), total)}% of all</small></div>
                    </div>
                    <div class="bar-track"><div class="bar-fill" style="width:${maxV ? (valueOf(p) / maxV) * 100 : 0}%"></div></div>
                    ${more}
                </div>`;
            }).join('');
            $('i-list').innerHTML = html
                ? html + (rows.length > st.limit ? `<div class="actions" style="justify-content:center;margin-top:12px"><button class="btn" type="button" data-imore>Show more (${num(rows.length - st.limit)} left)</button></div>` : '')
                : '<p class="empty">No product sales in this period yet. Sales made after this update record the product name, price and quantity.</p>';
        },

        // ================= Activity =================
        renderActivity() {
            const folds = this.state.activity.folds;
            const fold = (key, title, count, body) => `<details class="fold" data-fold="${key}" ${folds.has(key) ? 'open' : ''}><summary><span>${esc(title)} <small>${esc(count)}</small></span></summary><div class="fold-body">${body}</div></details>`;
            const r = this.m.r;
            const calls = this.D.calls.filter((x) => x.t >= r.from && x.t < r.to);
            const scans = this.D.scans.filter((x) => x.t >= r.from && x.t < r.to);
            const barcodeCount = new Set(scans.filter((x) => x.barcode && x.barcode !== 'PIKA_LOG').map((x) => x.barcode)).size;
            const transfers = this.m.sentList;
            $('tab-activity').innerHTML = `
                <p class="lead">${esc(r.label)}</p>
                ${fold('calls', 'Phone calls', plural(calls.length, 'call'), `<div id="calls-box"></div>`)}
                ${fold('barcodes', 'Barcodes and what users call them', plural(barcodeCount, 'barcode'), `<div id="barcodes-box"></div>`)}
                ${fold('transfers', 'Transfers', plural(transfers.length, 'transfer'), `<div id="transfers-box"></div>`)}
                ${fold('scans', 'Scanning', plural(scans.length, 'scan'), `<div id="scans-box"></div>`)}`;
            this.renderCalls();
            this.renderBarcodes();
            this.renderTransfers();
            this.renderScanSummary();
        },

        renderCalls() {
            const r = this.m.r, st = this.state.activity;
            const calls = this.D.calls.filter((x) => x.t >= r.from && x.t < r.to).sort((a, b) => b.t - a.t);
            const byCaller = new Map();
            calls.forEach((c) => {
                const e = byCaller.get(c.uid) || { n: 0, to: new Set(), last: 0 };
                e.n++; e.to.add(c.to || c.toName); e.last = Math.max(e.last, c.t);
                byCaller.set(c.uid, e);
            });
            const callers = [...byCaller].sort((a, b) => b[1].n - a[1].n);
            const q = norm(st.callQ);
            const filtered = calls.filter((c) => !q || norm(`${this.userName(c.uid)} ${c.fromName} ${c.toName} ${c.to}`).includes(q));
            const shown = filtered.slice(0, st.limits.calls);
            const ccols = '2.2fr 1fr 1fr 1fr', lcols = '1.6fr 1.6fr 1fr';
            $('calls-box').innerHTML = !calls.length
                ? '<p class="empty">No calls recorded in this period. A call is recorded when a user taps the call button on a customer. Calls made before this feature was switched on are not available.</p>'
                : `<p class="lead"><strong>${plural(calls.length, 'call')}</strong> by ${plural(callers.length, 'user')} to ${plural(new Set(calls.map((c) => c.to || c.toName)).size, 'customer')}.</p>
                   <div class="panel-head" style="margin-top:12px"><h3>Who is calling</h3></div>
                   ${this.table(ccols, ['User', 'Calls', 'Customers', 'Last call'].map((l, i) => `<div class="${i ? 'num' : ''}">${l}</div>`).join(''), callers.slice(0, 10).map(([uid, e]) => `
                        <div class="tr" data-user="${esc(uid)}" style="--cols:${ccols}"><div class="td">${this.who(uid)}</div>
                        <div class="td num" data-label="Calls">${num(e.n)}</div><div class="td num" data-label="Customers">${num(e.to.size)}</div><div class="td num" data-label="Last call">${esc(ago(e.last))}</div></div>`).join(''))}
                   <div class="panel-head" style="margin-top:16px"><h3>Call log</h3><input class="search" id="c-q" type="search" placeholder="Search calls" value="${esc(st.callQ)}" style="flex:0 1 220px"></div>
                   <div class="scroll-box">${this.table(lcols, ['Caller', 'Called', 'When'].map((l) => `<div>${l}</div>`).join(''), shown.map((c) => `
                        <div class="tr" ${this.D.byId.has(c.uid) ? `data-user="${esc(c.uid)}"` : ''} style="--cols:${lcols}">
                        <div class="td" data-label="Caller"><b>${esc(this.userName(c.uid))}</b></div>
                        <div class="td" data-label="Called">${esc(c.toName || c.to || '—')}<div class="s muted" style="font-size:.78rem">${esc(c.to && c.toName ? c.to : '')}</div></div>
                        <div class="td" data-label="When">${esc(fmtTime(c.t))}</div></div>`).join(''))}</div>
                   ${filtered.length > shown.length ? `<div class="actions" style="justify-content:center;margin-top:12px"><button class="btn" type="button" data-amore="calls">Show more</button></div>` : ''}`;
            const input = $('c-q');
            if (input && document.activeElement && document.activeElement.id === 'c-q') input.setSelectionRange(input.value.length, input.value.length);
        },

        renderBarcodes() {
            const r = this.m.r, st = this.state.activity;
            const scanned = new Map();
            this.D.scans.forEach((x) => {
                if (x.t < r.from || x.t >= r.to || !x.barcode || x.barcode === 'PIKA_LOG') return;
                const e = scanned.get(x.barcode) || { n: 0, users: new Set() };
                e.n++; e.users.add(x.uid);
                scanned.set(x.barcode, e);
            });
            const rows = [...scanned].map(([barcode, e]) => {
                const names = this.D.barcodeNames.get(barcode);
                const list = names ? [...names.values()].sort((a, b) => b.users.size - a.users.size) : [];
                return { barcode, n: e.n, users: e.users.size, names: list };
            }).sort((a, b) => b.n - a.n);
            const different = rows.filter((x) => x.names.length > 1).length;
            const q = norm(st.barQ);
            const filtered = rows.filter((x) => (!st.diffOnly || x.names.length > 1) && (!q || norm(`${x.barcode} ${x.names.map((n) => n.label).join(' ')}`).includes(q)));
            const shown = filtered.slice(0, st.limits.barcodes);
            const cols = '1.2fr .6fr .6fr 3fr';
            $('barcodes-box').innerHTML = !rows.length
                ? '<p class="empty">No barcodes were scanned in this period.</p>'
                : `<div class="filter-row" style="margin-bottom:8px"><input class="search" id="b-q" type="search" placeholder="Search a barcode or name" value="${esc(st.barQ)}">
                        <button type="button" class="chip ${st.diffOnly ? 'on' : ''}" data-diff>Named differently<b>${num(different)}</b></button></div>
                   <p class="lead" style="margin-bottom:6px">The number beside each name is how many different users call the item that.</p>
                   ${this.table(cols, ['Barcode', 'Scans', 'Users', 'What users call it'].map((l, i) => `<div class="${i === 1 || i === 2 ? 'num' : ''}">${l}</div>`).join(''), shown.map((x) => `
                        <div class="tr" style="--cols:${cols}"><div class="td mono">${esc(x.barcode)}</div>
                        <div class="td num" data-label="Scans">${num(x.n)}</div><div class="td num" data-label="Users">${num(x.users)}</div>
                        <div class="td" data-label="What users call it">${x.names.length ? `<div class="name-chips">${x.names.map((n) => `<span class="name-chip">${esc(n.label)}<b>${n.users.size}</b></span>`).join('')}</div>` : '<span class="muted">No name recorded yet</span>'}</div></div>`).join(''))}
                   ${filtered.length > shown.length ? `<div class="actions" style="justify-content:center;margin-top:12px"><button class="btn" type="button" data-amore="barcodes">Show more</button></div>` : ''}
                   ${filtered.length ? '' : '<p class="empty">Nothing matches.</p>'}`;
            const input = $('b-q');
            if (input && document.activeElement && document.activeElement.id === 'b-q') input.setSelectionRange(input.value.length, input.value.length);
        },

        renderTransfers() {
            const st = this.state.activity;
            const q = norm(st.trQ);
            const list = this.m.sentList.slice().sort((a, b) => b.t - a.t)
                .filter((x) => !q || norm(`${this.userName(x.from)} ${x.fromName} ${x.to} ${x.items.map((i) => i.name).join(' ')}`).includes(q));
            const shown = list.slice(0, st.limits.transfers);
            const accepted = this.m.sentList.filter((x) => x.claimed).length;
            const cols = '1.6fr 1.6fr .8fr 1.2fr';
            $('transfers-box').innerHTML = !this.m.sentList.length
                ? '<p class="empty">No transfers were sent in this period.</p>'
                : `<div class="filter-row" style="margin-bottom:8px"><input class="search" id="t-q" type="search" placeholder="Search sender, receiver or item" value="${esc(st.trQ)}"></div>
                   <p class="lead" style="margin-bottom:6px"><strong>${num(accepted)}</strong> of ${num(this.m.sentList.length)} accepted (${this.m.acceptRate}%).</p>
                   ${this.table(cols, ['From', 'Items', 'Value', 'Status'].map((l, i) => `<div class="${i === 2 ? 'num' : ''}">${l}</div>`).join(''), shown.map((x) => {
                        const items = x.items.slice(0, 2).map((i) => `${qty(i.qty)} × ${esc(i.name)}`).join(', ') + (x.items.length > 2 ? ` +${x.items.length - 2} more` : '');
                        const waited = Date.now() - x.t;
                        const status = x.claimed
                            ? `<span class="pill active">Accepted</span> <span class="muted" style="font-size:.78rem">${esc(this.userName(x.by) || x.byName)}${x.claimedAt ? ` · ${esc(ago(x.claimedAt))}` : ''}</span>`
                            : `<span class="pill ${waited > DAY ? 'cooling' : ''}">Waiting</span> <span class="muted" style="font-size:.78rem">${esc(ago(x.t))}</span>`;
                        return `<div class="tr" ${this.D.byId.has(x.from) ? `data-user="${esc(x.from)}"` : ''} style="--cols:${cols}">
                            <div class="td" data-label="From"><b>${esc(this.userName(x.from))}</b><div class="muted" style="font-size:.78rem">to ${esc(x.to)}</div></div>
                            <div class="td" data-label="Items">${items}</div><div class="td num" data-label="Value">${naira(x.value)}</div>
                            <div class="td" data-label="Status">${status}</div></div>`;
                   }).join(''))}
                   ${list.length > shown.length ? `<div class="actions" style="justify-content:center;margin-top:12px"><button class="btn" type="button" data-amore="transfers">Show more</button></div>` : ''}`;
            const input = $('t-q');
            if (input && document.activeElement && document.activeElement.id === 't-q') input.setSelectionRange(input.value.length, input.value.length);
        },

        renderScanSummary() {
            const r = this.m.r;
            const scans = this.D.scans.filter((x) => x.t >= r.from && x.t < r.to);
            const labels = { sell_item: 'Selling', add_product: 'Adding products', assign_barcode: 'Assigning barcodes', log_scan: 'Receipt / log scans' };
            const by = countBy(scans.map((x) => x.type));
            const ok = scans.filter((x) => x.status === 'success').length;
            const missing = scans.filter((x) => x.status === 'failed_not_found').length;
            const timeouts = scans.filter((x) => x.status === 'failed_timeout').length;
            const mini = [...[...by].sort((a, b) => b[1] - a[1]).map(([k, v]) => [labels[k] || k, v]),
                ['Succeeded', `${pct(ok, scans.length)}%`], ['Product not found', missing], ['Timed out', timeouts]]
                .map(([l, v]) => `<div class="mini"><div class="v">${typeof v === 'number' ? num(v) : esc(v)}</div><div class="l">${esc(l)}</div></div>`).join('');
            $('scans-box').innerHTML = scans.length ? `<div class="mini-stats">${mini}</div>` : '<p class="empty">No scans in this period.</p>';
        }
    };

    App.init();
});
