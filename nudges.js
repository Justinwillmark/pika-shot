// The one message shown in the Profile card.
// Three kinds, taking turns and never the same kind twice in a row: free airtime, business insights, motivation.
// The message changes only after every 5 actions (sales, scans, transfers, receipts shared or printed, in any mix).
// Each person gets their own shuffled order, so two people do not see the same run of messages.
// Exceptions that change it straight away: a nudge when the app opens after days away, and the welcome after a first sale.
// Every message is at most 8 words with one emoji. Pidgin is only used in the motivation messages and the "where you dey" greeting.
(function (root) {
    'use strict';

    const DAY = 86400000;
    const EVERY = 5; // actions between one message and the next
    const CATS = ['airtime', 'insight', 'motivation'];

    // ---------------------------------------------------------------- small helpers
    function toDate(v) {
        if (!v) return null;
        if (v instanceof Date) return v;
        if (typeof v === 'number') return new Date(v);
        if (typeof v === 'string') return new Date(v);
        if (typeof v.toDate === 'function') return v.toDate();
        if (v.seconds !== undefined) return new Date(v.seconds * 1000);
        return null;
    }
    const dayIdx = (d) => Math.round(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / DAY);
    const naira = (n) => '₦' + Math.round(n).toLocaleString('en-US');
    const short = (name, words) => String(name || '').trim().split(/\s+/).slice(0, words || 2).join(' ');
    const shortDate = (d, now) => d.toLocaleDateString('en-GB', d.getFullYear() === now.getFullYear() ? { day: 'numeric', month: 'short' } : { day: 'numeric', month: 'short', year: 'numeric' });

    // A small seeded random number generator (mulberry32): the same seed always gives the same run
    function makeRng(seed) {
        let t = seed >>> 0;
        return function () {
            t = (t + 0x6D2B79F5) >>> 0;
            let r = Math.imul(t ^ (t >>> 15), 1 | t);
            r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
            return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
        };
    }
    const rngFor = (state) => makeRng((state.seed ^ Math.imul(state.n + 1, 0x9E3779B1)) >>> 0);

    // Writes down when each product was first seen low or out of stock (and forgets it once it is stocked up again).
    // An out-of-stock product that has not changed since falls back on when it last changed.
    function trackStock(state, products, lowLevel, now) {
        const since = state.lowSince = state.lowSince || {};
        const seen = {};
        (products || []).forEach(p => {
            if (!(Number(p.stock) < lowLevel)) return;
            seen[p.id] = true;
            if (since[p.id]) return;
            const changed = toDate(p.lastUpdate);
            since[p.id] = Number(p.stock) <= 0 && changed && !isNaN(changed.getTime()) && changed.getTime() <= now.getTime() ? changed.getTime() : now.getTime();
        });
        Object.keys(since).forEach(id => { if (!seen[id]) delete since[id]; });
    }

    // ---------------------------------------------------------------- what the business looks like right now
    // sales: the sales saved on this phone. products: the product list. acts: { receipt: [times], transfer: [times] } kept by the app.
    function buildContext(input) {
        const sales = input.sales || [];
        const products = input.products || [];
        const user = input.user || {};
        const now = input.now || new Date();
        const acts = input.acts || {};
        const lowLevel = input.lowLevel || 7;
        const today = dayIdx(now);
        const hour = now.getHours();
        const tod = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : hour >= 17 && hour < 21 ? 'evening' : 'night';

        const byDay = new Map();
        const items7 = new Map();
        const debtors = new Map();
        const settled = [];
        let month = 0, lastDay = null, lastDate = null, count7 = 0;
        for (const s of sales) {
            const d = toDate(s.timestamp);
            if (!d || isNaN(d.getTime())) continue;
            const di = dayIdx(d);
            const total = Number(s.total) || 0;
            const rec = byDay.get(di) || { total: 0, count: 0 };
            rec.total += total; rec.count++; byDay.set(di, rec);
            if (lastDay === null || di > lastDay) { lastDay = di; lastDate = d; }
            if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) month += total;
            if (today - di >= 0 && today - di <= 6) {
                count7++;
                if (s.productName) items7.set(s.productName, (items7.get(s.productName) || 0) + 1);
            }
            if (s.saleType === 'credit') {
                const owed = Math.max(0, (Number(s.quantity) || 0) * (Number(s.price) || 0) - total);
                if (s.creditSettled) {
                    const at = Number(s.creditSettledAt);
                    if (owed > 0 && at && now.getTime() - at >= 0 && now.getTime() - at <= 2 * DAY) settled.push({ name: s.customerName, amt: owed, at });
                } else if (owed > 0) {
                    const key = String(s.customerPhone || s.customerName || '').toLowerCase();
                    const rec2 = debtors.get(key) || { name: s.customerName || 'A customer', owed: 0, oldest: di, oldestDate: d };
                    rec2.owed += owed;
                    if (di < rec2.oldest) { rec2.oldest = di; rec2.oldestDate = d; }
                    debtors.set(key, rec2);
                }
            }
        }
        const dayTotal = (i) => (byDay.get(i) || { total: 0 }).total;
        const dayCount = (i) => (byDay.get(i) || { count: 0 }).count;

        const todayTotal = dayTotal(today);
        const todaySales = dayCount(today);
        let week = [0, 0, 0, 0];
        for (let k = 0; k < 28; k++) week[Math.floor(k / 7)] += dayTotal(today - k);
        let best6 = 0, sum6 = 0, active6 = 0, best30 = 0, active30 = 0;
        for (let k = 1; k <= 30; k++) {
            const t = dayTotal(today - k), c = dayCount(today - k);
            if (t > best30) best30 = t;
            if (c > 0) active30++;
            if (k <= 6) { if (t > best6) best6 = t; sum6 += t; if (c > 0) active6++; }
        }
        let streak = 0;
        while (streak < 400 && dayCount(today - streak) > 0) streak++;

        const newDailyHigh = todayTotal > 0 && todayTotal > best30 && active30 >= 3;
        const olderWeeks = week.slice(1);
        const newWeeklyHigh = week[0] > 0 && week[0] > Math.max.apply(null, olderWeeks) && olderWeeks.filter(w => w > 0).length >= 2;

        let top = null;
        items7.forEach((c, name) => { if (!top || c > top.count) top = { name, count: c }; });

        const lowest = products.filter(p => Number(p.stock) > 0 && Number(p.stock) < lowLevel).sort((a, b) => a.stock - b.stock)[0] || null;

        // Money for stock, in two cases:
        //  1. a top seller whose sales have fallen while stock ran short: usually 100+ sales a day (3 of the 7 days before), then yesterday
        //     and the day before both under 50, with more than 2 products low or out of stock for more than 2 days (today is left out: it is not over)
        //  2. anyone with more than 4 products low or out of stock right now
        const lowSince = input.lowSince || {};
        let lowLong = 0;
        products.forEach(p => { const t = lowSince[p.id]; if (t && Number(p.stock) < lowLevel && now.getTime() - t > 2 * DAY) lowLong++; });
        let hundreds = 0;
        for (let k = 3; k <= 9; k++) if (dayCount(today - k) >= 100) hundreds++;
        const dropped = dayCount(today - 1) < 50 && dayCount(today - 2) < 50;
        const lowCount = products.filter(p => Number(p.stock) < lowLevel).length;
        const needFunding = !!input.canFund && ((hundreds >= 3 && dropped && lowLong > 2) || lowCount > 4);

        const list = Array.from(debtors.values());
        list.forEach(x => { x.age = today - x.oldest; });
        const biggest = (arr) => arr.sort((a, b) => b.owed - a.owed)[0] || null;

        const next = [100, 500, 1000].find(m => m > sales.length);

        let inactiveDays = 0;
        if (lastDay !== null) inactiveDays = Math.max(0, today - lastDay - 1);
        else {
            const made = toDate(user.createdAt);
            if (made && !isNaN(made.getTime())) inactiveDays = Math.max(0, today - dayIdx(made) - 1);
        }

        const within = (arr) => (arr || []).filter(t => Number(t) > 0 && now.getTime() - Number(t) <= 7 * DAY && now.getTime() >= Number(t)).length;
        const receipts7 = within(acts.receipt);
        const transfers7 = within(acts.transfer);
        const canTransfer = !!input.canTransfer;

        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dom = now.getDate();

        return {
            now, today, hour, tod, gender: user.gender,
            totalSales: sales.length, todayTotal, todaySales, month,
            last7: week[0], prev7: week[1],
            newHigh: newDailyHigh || newWeeklyHigh,
            bestDay: todayTotal > 0 && todayTotal > best6 && active6 >= 2,
            first100k: todayTotal >= 100000 && best6 < 100000,
            slowDay: hour >= 12 && hour < 21 && active6 >= 3 && todayTotal < sum6 / active6,
            streak, topItem: top && top.count >= 3 ? short(top.name, 2) : null,
            lowItem: lowest ? short(lowest.name, 2) : null,
            lowLong, lowCount, needFunding,
            toMilestone: next ? { n: next - sales.length, to: next } : null,
            owe7: biggest(list.filter(x => x.age >= 7)),
            owe1to6: biggest(list.filter(x => x.age >= 1 && x.age <= 6)),
            debtorCount: list.length,
            debtTotal: list.reduce((a, x) => a + x.owed, 0),
            paid: settled.sort((a, b) => b.at - a.at)[0] || null,
            receipts7, transfers7, canTransfer,
            lowReceipts: count7 >= 5 && receipts7 * 4 < count7,
            lowTransfers: canTransfer && count7 >= 5 && transfers7 * 4 < count7,
            monthTime: dom >= 14 && dom <= 16 || dom >= lastDayOfMonth - 2,
            inactiveDays,
            lastSaleDate: lastDate ? shortDate(lastDate, now) : null
        };
    }

    // ---------------------------------------------------------------- the messages
    // when(ctx): is it true for this person right now?   any: true = fits any moment (the others are picked more often when they apply)
    // open: true = only used when the app opens after days away.   who: only for that gender.
    const owedName = (o) => short(o.name, 2);
    const weekdayOf = (o) => o.oldestDate.toLocaleDateString('en-GB', { weekday: 'long' });
    const CATALOG = [
        // ---- Free airtime: no promises, no sales-to-reward counts
        { id: 'ap-any', cat: 'airtime', any: true, when: () => true, text: () => 'Every sale counts toward your airtime benefits. 🎁' },
        { id: 'ap-receipts', cat: 'airtime', when: c => c.lowReceipts, text: () => 'Share receipts. They count too. 🧾' },
        { id: 'ap-transfer', cat: 'airtime', when: c => c.lowTransfers, text: () => 'Transfer items after each sale. It counts. 📦' },
        { id: 'ap-morning', cat: 'airtime', when: c => c.tod === 'morning', text: () => 'Good morning. Keep recording, benefits add up. ☀️' },
        { id: 'ap-evening', cat: 'airtime', when: c => c.tod === 'evening', text: () => 'Record today\'s sales before you close. 🌇' },
        { id: 'ap-night', cat: 'airtime', when: c => c.tod === 'night', text: () => 'Still selling late? Every sale counts. 🌙' },
        { id: 'ap-inact1', cat: 'airtime', open: true, when: c => c.inactiveDays >= 1 && c.inactiveDays <= 2, text: () => 'Record one sale today. It all counts. ✨' },
        { id: 'ap-inact3', cat: 'airtime', open: true, when: c => c.inactiveDays >= 3, text: () => 'Welcome back. Your benefits are still here. 👋' },

        // ---- Business insights: facts from the person's own records
        // (urgent = picked first when it fits; cooldown = not again for that long; go = what a tap does)
        { id: 'in-funding', cat: 'insight', priority: true, cooldown: 3 * DAY, go: 'funding', when: c => c.needFunding, text: () => 'Need money for stock? Get help 💰' },
        { id: 'in-milestone', cat: 'insight', when: c => c.toMilestone && c.toMilestone.n >= 1 && c.toMilestone.n <= 20,
            text: c => `${c.toMilestone.n} ${c.toMilestone.n === 1 ? 'sale' : 'sales'} away from ${c.toMilestone.to}. 🎯` },
        { id: 'in-100k', cat: 'insight', when: c => c.first100k, text: () => 'First ₦100k day this week. Nice. 👏' },
        { id: 'in-owe7', cat: 'insight', go: 'customers', when: c => !!c.owe7, text: c => `${owedName(c.owe7)} owes over a week. Remind politely. 🤝` },
        { id: 'in-owe', cat: 'insight', go: 'customers', when: c => !!c.owe1to6, text: c => `${owedName(c.owe1to6)} owes ${naira(c.owe1to6.owed)} since ${weekdayOf(c.owe1to6)}. 📒` },
        { id: 'in-customers-owe', cat: 'insight', go: 'customers', when: c => c.debtorCount >= 2, text: c => `Customers owe you ${naira(c.debtTotal)}. Tap to see. 👀` },
        { id: 'in-paid', cat: 'insight', when: c => !!c.paid, text: c => `${short(c.paid.name || 'A customer', 2)} paid back ${naira(c.paid.amt)}. 🎉` },
        { id: 'in-best-item', cat: 'insight', when: c => !!c.topItem, text: c => `${c.topItem} is your best seller this week. ⭐` },
        { id: 'in-up', cat: 'insight', when: c => c.prev7 > 0 && c.last7 > c.prev7, text: c => `You sold ${naira(c.last7 - c.prev7)} more than last week. 📈` },
        { id: 'in-best-day', cat: 'insight', when: c => c.bestDay, text: () => 'Best day this week so far. 🌟' },
        { id: 'in-slow', cat: 'insight', when: c => c.slowDay && !!c.topItem, text: c => `Slow day. ${c.topItem} is your best seller. 💡` },
        { id: 'in-lowstock', cat: 'insight', when: c => !!c.lowItem, text: c => `${c.lowItem} is running low. 📦` },
        { id: 'in-receipts5', cat: 'insight', when: c => c.receipts7 >= 5, text: c => `${c.receipts7} receipts shared this week. Customers trust that. 🙌` },
        { id: 'in-transfer', cat: 'insight', when: c => c.lowTransfers, text: () => 'Transfer items to customers after each sale. 🚚' },
        { id: 'in-streak', cat: 'insight', when: c => c.streak >= 3, text: c => `${c.streak} days in a row. Keep the streak. 🔥` },
        { id: 'in-month', cat: 'insight', when: c => c.monthTime && c.month > 0, text: c => `${naira(c.month)} recorded this month. 📅` },

        // ---- Motivation: encouragement, light Pidgin
        { id: 'mo-try', cat: 'motivation', any: true, when: () => true, text: () => 'You try today. Weldone abeg! 👏' },
        { id: 'mo-observe', cat: 'motivation', any: true, when: () => true, text: () => 'I just dey observe. 👀' },
        { id: 'mo-small', cat: 'motivation', any: true, when: () => true, text: () => 'Small small, na so business dey build. 🧱' },
        { id: 'mo-steady', cat: 'motivation', any: true, when: () => true, text: () => 'Steady steady. Your shop dey grow. 🌱' },
        { id: 'mo-customers', cat: 'motivation', when: c => c.tod === 'afternoon' || c.tod === 'evening', text: () => 'Customers dey come. Keep it up. 🙌' },
        { id: 'mo-sharp', cat: 'motivation', when: c => c.todaySales >= 10, text: () => 'Your records dey sharp. ✅' },
        { id: 'mo-oga-any', cat: 'motivation', who: 'Male', any: true, when: () => true, text: () => 'Na you be oga o! 😎' },
        { id: 'mo-oga-try', cat: 'motivation', who: 'Male', when: c => c.todaySales >= 10, text: () => 'Oga, you dey try! 💪' },
        { id: 'mo-oga-show', cat: 'motivation', who: 'Male', when: c => c.newHigh, text: () => 'Oga don show. Weldone! 🏆' },
        { id: 'mo-madam-any', cat: 'motivation', who: 'Female', any: true, when: () => true, text: () => 'Madam di madam! 👑' },
        { id: 'mo-madam-try', cat: 'motivation', who: 'Female', when: c => c.todaySales >= 10, text: () => 'Madam, you dey try o! 💪' },
        { id: 'mo-madam-show', cat: 'motivation', who: 'Female', when: c => c.newHigh, text: () => 'Madam don show. Weldone! 🏆' },
        { id: 'mo-morning', cat: 'motivation', when: c => c.tod === 'morning', text: () => 'Good morning. Make today a good one. ☀️' },
        { id: 'mo-evening', cat: 'motivation', when: c => c.tod === 'evening', text: () => 'Day almost done. You did well. 🌇' },
        { id: 'mo-night', cat: 'motivation', when: c => c.tod === 'night', text: () => 'Working late? Rest well after this. 🌙' },

        // ---- Inactivity (when the app opens after days away): kind, never shaming
        { id: 'ia-1', cat: 'inactivity', open: true, when: c => c.inactiveDays >= 1 && c.inactiveDays <= 2, text: () => 'We missed you. Record today\'s sales. 💛' },
        { id: 'ia-3', cat: 'inactivity', open: true, when: c => c.inactiveDays >= 3 && c.inactiveDays <= 6, text: () => 'Your shop book is waiting. 📒' },
        { id: 'ia-7', cat: 'inactivity', open: true, when: c => c.inactiveDays >= 7, text: () => 'Start again with one sale today. 🚀' },
        { id: 'ia-oga', cat: 'inactivity', open: true, who: 'Male', when: c => c.inactiveDays >= 3 && !!c.lastSaleDate, text: (c, r) => `Oga, where you dey since ${c.lastSaleDate}? ${['😊', '🤗', '💛'][Math.floor(r() * 3)]}` },
        { id: 'ia-madam', cat: 'inactivity', open: true, who: 'Female', when: c => c.inactiveDays >= 3 && !!c.lastSaleDate, text: (c, r) => `Madam, where you dey since ${c.lastSaleDate}? ${['😊', '🤗', '💛'][Math.floor(r() * 3)]}` },
        { id: 'ia-morning', cat: 'inactivity', open: true, when: c => c.inactiveDays >= 1 && c.tod === 'morning', text: () => 'Good morning. Record your first sale. ☀️' },

        // ---- The welcome after a first sale
        { id: 'welcome', cat: 'welcome', special: true, when: () => false, text: () => 'First sale recorded. Welcome aboard! 🎉' }
    ];
    const BY_ID = {};
    CATALOG.forEach(m => { BY_ID[m.id] = m; });

    const fitsWho = (m, c) => !m.who || m.who === c.gender;

    // ---------------------------------------------------------------- remembering where a person is in their run
    function newState(seed) {
        return { v: 1, seed: seed >>> 0, n: 0, cat: null, id: null, text: null, actions: 0, recent: [], shown: {}, lowSince: {}, freshAt: 0, openDay: null, welcomed: false, acts: { receipt: [], transfer: [] } };
    }

    function settle(state, m, text, ctx) {
        state.id = m.id; state.cat = m.cat; state.n++;
        state.text = (m.open || m.special) ? text : null; // these keep the words they were shown with
        state.actions = 0;
        state.recent.push(m.id);
        if (state.recent.length > 8) state.recent.shift();
        (state.shown = state.shown || {})[m.id] = ctx && ctx.now ? ctx.now.getTime() : Date.now();
    }

    // Picks the next message: a kind different from the last, then one of that kind that fits now and was not shown lately
    function pick(state, ctx) {
        const rng = rngFor(state);
        const nowMs = ctx.now.getTime();
        const cooled = (m) => !(m.cooldown && state.shown && state.shown[m.id] && nowMs - state.shown[m.id] < m.cooldown);
        const fits = CATALOG.filter(m => !m.open && !m.special && CATS.indexOf(m.cat) >= 0 && fitsWho(m, ctx) && m.when(ctx) && cooled(m));
        // something urgent that fits goes first, as long as it is not the same kind as the last message
        const urgent = fits.filter(m => m.priority && m.cat !== state.cat);
        if (urgent.length) {
            const u = urgent[Math.floor(rng() * urgent.length)];
            settle(state, u, null, ctx);
            return u;
        }
        const cats = CATS.filter(c => fits.some(m => m.cat === c));
        let pool = cats.filter(c => c !== state.cat);
        if (!pool.length) pool = cats;
        const cat = pool[Math.floor(rng() * pool.length)];
        let list = fits.filter(m => m.cat === cat);
        const fresh = list.filter(m => state.recent.indexOf(m.id) < 0);
        if (fresh.length) list = fresh;
        const specific = list.filter(m => !m.any);
        const chosen = specific.length && (specific.length === list.length || rng() < 0.75) ? specific : list;
        const m = chosen[Math.floor(rng() * chosen.length)];
        settle(state, m, null, ctx);
        return m;
    }

    // What to show in the Profile now. Picks a new message when it is due (5 actions), when there is none yet,
    // or when the one shown is no longer true (it was morning and now it is evening, or a debt was paid).
    function show(state, ctx) {
        let m = BY_ID[state.id];
        const keeps = m && (m.open || m.special);
        const valid = !!m && (keeps || (fitsWho(m, ctx) && m.when(ctx)));
        if (!m || !valid || state.actions >= EVERY) m = pick(state, ctx);
        const text = (m.open || m.special) ? state.text : m.text(ctx, rngFor(state));
        return { text, go: m.go || null, id: m.id, cat: m.cat };
    }

    // The app has just opened: after a day or more without a sale, a kind nudge replaces the current message (once a day)
    function onOpen(state, ctx) {
        if (state.openDay === ctx.today) return false;
        state.openDay = ctx.today;
        if (ctx.inactiveDays < 1) return false;
        const rng = rngFor(state);
        let list = CATALOG.filter(m => m.open && fitsWho(m, ctx) && m.when(ctx));
        if (!list.length) return false;
        const fresh = list.filter(m => state.recent.indexOf(m.id) < 0);
        if (fresh.length) list = fresh;
        const m = list[Math.floor(rng() * list.length)];
        settle(state, m, m.text(ctx, rng), ctx);
        return true;
    }

    // The first sale ever: a welcome, straight away
    function welcome(state, ctx) {
        const m = BY_ID.welcome;
        state.welcomed = true;
        settle(state, m, m.text(ctx), ctx);
    }

    // One more action done (sale, scan, transfer, receipt shared or printed)
    function act(state, kind, now) {
        state.actions = (state.actions || 0) + 1;
        if (kind === 'receipt' || kind === 'transfer') {
            const list = state.acts[kind] = state.acts[kind] || [];
            const t = (now || new Date()).getTime();
            list.push(t);
            while (list.length > 200 || (list.length && t - list[0] > 14 * DAY)) list.shift();
        }
    }

    root.PikaNudges = { EVERY, CATS, CATALOG, buildContext, trackStock, newState, show, onOpen, welcome, act, makeRng, todayIndex: (d) => dayIdx(d || new Date()) };
    if (typeof module !== 'undefined' && module.exports) module.exports = root.PikaNudges;
})(typeof window !== 'undefined' ? window : globalThis);
