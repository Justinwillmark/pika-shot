// The one message shown in the Profile card.
// Three kinds, taking turns and never the same kind twice in a row: free airtime, business insights, motivation.
// The message changes only after every 5 actions (sales, scans, transfers, receipts shared or printed, in any mix).
// Each person gets their own shuffled order, so two people do not see the same run of messages.
// Exceptions that change it straight away: a nudge when the app opens after days away, a reminder when a credit has gone
// unpaid for 3 days (again every 3 days), and the welcome after a first sale.
// Every message is at most 8 words with one emoji, in plain words. Pidgin is only used in the motivation messages and the "where you dey" greeting.
//
// What decides which message comes next (nothing here is random except the final draw from the person's own seed):
//  - it must fit this person (gender, role) and this moment (time of day, what the records show), and not be on cooldown
//  - things a person can act on today (money owed, stock running out) go first, but never twice in a row
//    and never in a rush (several sales in the last half hour), when a task would only get in the way
//  - the rest are drawn by weight: closer to a goal counts for more, a fresh win is celebrated straight away,
//    new people hear more about how to earn, a slow day or a long break gets more encouragement,
//    and the more often a message has already been shown, the less likely it is
(function (root) {
    'use strict';

    const DAY = 86400000;
    const HOUR = 3600000;
    const EVERY = 5; // actions between one message and the next
    const CATS = ['airtime', 'insight', 'motivation'];
    const REMIND_AFTER = 3; // days a credit can go unpaid before the first reminder (then again every 3 days)

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

    // One of `list`, drawn in proportion to `weights`
    function draw(list, weights, rng) {
        let total = 0;
        weights.forEach(w => { total += w; });
        if (!(total > 0)) return list[Math.floor(rng() * list.length)];
        let r = rng() * total;
        for (let i = 0; i < list.length; i++) { r -= weights[i]; if (r < 0) return list[i]; }
        return list[list.length - 1];
    }

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
    // customers: [{ id, name, items: [{ name, stock }] }]: customers of a wholesaler with items low or out (kept by the app).
    function buildContext(input) {
        const sales = input.sales || [];
        const products = input.products || [];
        const user = input.user || {};
        const now = input.now || new Date();
        const nowMs = now.getTime();
        const acts = input.acts || {};
        const lowLevel = input.lowLevel || 7;
        const role = input.role || user.type || '';
        const today = dayIdx(now);
        const hour = now.getHours();
        const tod = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 17 ? 'afternoon' : hour >= 17 && hour < 21 ? 'evening' : 'night';

        const byDay = new Map();
        const items7 = new Map();
        const soldBy14 = new Map();
        const soldBy30 = new Map();
        const debtors = new Map();
        const settled = [];
        let month = 0, lastDay = null, lastDate = null, count7 = 0, lastHalfHour = 0;
        for (const s of sales) {
            const d = toDate(s.timestamp);
            if (!d || isNaN(d.getTime())) continue;
            const di = dayIdx(d);
            const total = Number(s.total) || 0;
            const rec = byDay.get(di) || { total: 0, count: 0 };
            rec.total += total; rec.count++; byDay.set(di, rec);
            if (lastDay === null || di > lastDay) { lastDay = di; lastDate = d; }
            if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()) month += total;
            const ago = today - di;
            if (ago >= 0 && ago <= 6) {
                count7++;
                if (s.productName) items7.set(s.productName, (items7.get(s.productName) || 0) + 1);
            }
            if (s.productId !== undefined && s.productId !== null) {
                const pid = String(s.productId);
                if (ago >= 0 && ago <= 13) soldBy14.set(pid, (soldBy14.get(pid) || 0) + 1);
                if (ago >= 0 && ago <= 29) soldBy30.set(pid, (soldBy30.get(pid) || 0) + 1);
            }
            const sinceSale = nowMs - d.getTime();
            if (sinceSale >= 0 && sinceSale <= HOUR / 2) lastHalfHour++;
            if (s.saleType === 'credit') {
                const owed = Math.max(0, (Number(s.quantity) || 0) * (Number(s.price) || 0) - total);
                if (s.creditSettled) {
                    const at = Number(s.creditSettledAt);
                    if (owed > 0 && at && nowMs - at >= 0 && nowMs - at <= 2 * DAY) settled.push({ name: s.customerName, amt: owed, at });
                } else if (owed > 0) {
                    const key = String(s.customerPhone || s.customerName || '').toLowerCase();
                    const rec2 = debtors.get(key) || { key, name: s.customerName || 'A customer', owed: 0, oldest: di, oldestDate: d, oldestId: s.id };
                    rec2.owed += owed;
                    if (di < rec2.oldest) { rec2.oldest = di; rec2.oldestDate = d; rec2.oldestId = s.id; }
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
        let streakBefore = 0; // the run up to yesterday: still alive today, until the day ends with no sale
        while (streakBefore < 400 && dayCount(today - 1 - streakBefore) > 0) streakBefore++;

        const newDailyHigh = todayTotal > 0 && todayTotal > best30 && active30 >= 3;
        const olderWeeks = week.slice(1);
        const newWeeklyHigh = week[0] > 0 && week[0] > Math.max.apply(null, olderWeeks) && olderWeeks.filter(w => w > 0).length >= 2;

        let top = null;
        items7.forEach((c, name) => { if (!top || c > top.count) top = { name, count: c }; });

        // Products running short, best sellers first (a product that sells is the one that hurts most to run out of)
        const sold14 = (p) => soldBy14.get(String(p.id)) || 0;
        const lowProducts = products
            .filter(p => Number(p.stock) > 0 && Number(p.stock) < lowLevel)
            .map(p => ({ id: p.id, name: p.name, stock: Number(p.stock), sold: sold14(p) }))
            .sort((a, b) => (b.sold - a.sold) || (a.stock - b.stock));
        const outProducts = products // (one that never sold is not news)
            .filter(p => Number(p.stock) <= 0 && soldBy30.get(String(p.id)))
            .map(p => ({ id: p.id, name: p.name, sold: soldBy30.get(String(p.id)) }))
            .sort((a, b) => b.sold - a.sold);

        // Customers (of a wholesaler) running short: the ones with nothing left first
        const custLow = (input.customers || [])
            .filter(c => c && c.name && c.items && c.items.length)
            .map(c => {
                const worst = c.items.slice().sort((a, b) => a.stock - b.stock)[0];
                return { id: c.id, name: c.name, product: worst.name, stock: Number(worst.stock), out: Number(worst.stock) <= 0, n: c.items.length };
            })
            .sort((a, b) => (b.out - a.out) || (a.stock - b.stock));

        // Money for stock, in two cases:
        //  1. a top seller whose sales have fallen while stock ran short: usually 100+ sales a day (3 of the 7 days before), then yesterday
        //     and the day before both under 50, with more than 2 products low or out of stock for more than 2 days (today is left out: it is not over)
        //  2. anyone with more than 4 products low or out of stock right now
        const lowSince = input.lowSince || {};
        let lowLong = 0;
        products.forEach(p => { const t = lowSince[p.id]; if (t && Number(p.stock) < lowLevel && nowMs - t > 2 * DAY) lowLong++; });
        let hundreds = 0;
        for (let k = 3; k <= 9; k++) if (dayCount(today - k) >= 100) hundreds++;
        const dropped = dayCount(today - 1) < 50 && dayCount(today - 2) < 50;
        const lowCount = products.filter(p => Number(p.stock) < lowLevel).length;
        const needFunding = !!input.canFund && ((hundreds >= 3 && dropped && lowLong > 2) || lowCount > 4);

        const list = Array.from(debtors.values());
        list.forEach(x => { x.age = today - x.oldest; });
        list.sort((a, b) => b.owed - a.owed);

        const next = [100, 500, 1000].find(m => m > sales.length);

        let inactiveDays = 0;
        let tenureDays = 999;
        const made = toDate(user.createdAt);
        if (made && !isNaN(made.getTime())) tenureDays = Math.max(0, today - dayIdx(made));
        if (lastDay !== null) inactiveDays = Math.max(0, today - lastDay - 1);
        else if (tenureDays !== 999) inactiveDays = Math.max(0, tenureDays - 1);

        const within = (arr) => (arr || []).filter(t => Number(t) > 0 && nowMs - Number(t) <= 7 * DAY && nowMs >= Number(t)).length;
        const receipts7 = within(acts.receipt);
        const transfers7 = within(acts.transfer);
        const canTransfer = !!input.canTransfer;

        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dom = now.getDate();

        const paid = settled.sort((a, b) => b.at - a.at)[0] || null;
        const newHigh = newDailyHigh || newWeeklyHigh;
        const bestDay = todayTotal > 0 && todayTotal > best6 && active6 >= 2;
        const first100k = todayTotal >= 100000 && best6 < 100000;

        return {
            now, today, hour, tod, gender: user.gender, role,
            totalSales: sales.length, todayTotal, todaySales, month,
            last7: week[0], prev7: week[1],
            newHigh, bestDay, first100k,
            recentWin: newHigh || bestDay || first100k || !!paid || todaySales >= 15,
            slowDay: hour >= 12 && hour < 21 && active6 >= 3 && todayTotal < sum6 / active6,
            busy: lastHalfHour >= 4, // serving customers right now: no tasks
            streak, streakBefore, streakRisk: todaySales === 0 && streakBefore >= 3,
            topItem: top && top.count >= 3 ? short(top.name, 2) : null,
            lowProducts, outProducts, custLow,
            lowLong, lowCount, needFunding,
            toMilestone: next ? { n: next - sales.length, to: next } : null,
            debtsDue: list.filter(x => x.age >= REMIND_AFTER),
            debtorCount: list.length,
            debtTotal: list.reduce((a, x) => a + x.owed, 0),
            paid,
            receipts7, transfers7, canTransfer,
            canRequestTransfer: role === 'Wholesaler' || role === 'Retailer',
            lowReceipts: count7 >= 5 && receipts7 * 4 < count7,
            lowTransfers: canTransfer && count7 >= 5 && transfers7 * 4 < count7,
            monthTime: dom >= 14 && dom <= 16 || dom >= lastDayOfMonth - 2,
            monthStart: dom <= 2,
            isMonday: now.getDay() === 1,
            tenureDays, inactiveDays,
            lastSaleDate: lastDate ? shortDate(lastDate, now) : null
        };
    }

    // ---------------------------------------------------------------- the messages
    // when(ctx): is it true for this person right now?   any: true = fits any moment (the others are picked more often when they apply)
    // open: true = only used when the app opens after days away.   who: only for that gender.   roles: only for those kinds of account.
    // tier: 2 or 1 = something to act on today, goes first (all the 2s before the 1s).   weight(ctx): how much it matters right now (1 = normal).
    // subjects(ctx): a message about one thing in a list (a customer, a product): the first one not on cooldown is the subject,
    //   and every subject has its own cooldown.   cooldown: not again for that long.   reminder: also said once a day when the app opens.
    // go / arg: where a tap goes.   ok(ctx): fine to start with it now (a message already showing stays as long as when() is true).
    // chime: true = worth a soft double beep when it arrives (something to act on, or a win); the others arrive quietly.
    const owedName = (d) => short(d.name, 2);
    const weekdayOf = (d) => d.oldestDate.toLocaleDateString('en-GB', { weekday: 'long' });
    const pick1 = (r, list) => list[Math.floor(r() * list.length)];
    const subjective = (m) => { m.when = (c) => m.subjects(c).length > 0; return m; };

    const CATALOG = [
        // ---- Free airtime: no promises, no sales-to-reward counts
        { id: 'ap-any', cat: 'airtime', any: true, when: () => true, text: () => 'Every sale counts toward your airtime benefits. 🎁' },
        { id: 'ap-receipts', cat: 'airtime', when: c => c.lowReceipts, weight: c => c.tenureDays < 14 ? 2 : 1, text: () => 'Share receipts. They count too. 🧾' },
        { id: 'ap-transfer', cat: 'airtime', when: c => c.lowTransfers, weight: c => c.tenureDays < 14 ? 2 : 1, text: () => 'Transfer items after each sale. It counts. 📦' },
        { id: 'ap-request', cat: 'airtime', roles: ['Wholesaler', 'Retailer'], cooldown: 4 * DAY, when: c => c.canRequestTransfer, weight: c => c.lowCount > 0 ? 2.5 : 0.8, text: () => 'Request item transfer when you restock. 📲' },
        { id: 'ap-morning', cat: 'airtime', when: c => c.tod === 'morning', text: () => 'Good morning! Record every sale today. ☀️' },
        { id: 'ap-evening', cat: 'airtime', when: c => c.tod === 'evening', text: () => 'Record today\'s sales before you close. 🌇' },
        { id: 'ap-night', cat: 'airtime', when: c => c.tod === 'night', text: () => 'Still selling late? Every sale counts. 🌙' },
        { id: 'ap-inact1', cat: 'airtime', open: true, when: c => c.inactiveDays >= 1 && c.inactiveDays <= 2, text: () => 'Record one sale today. It all counts. ✨' },
        { id: 'ap-inact3', cat: 'airtime', open: true, when: c => c.inactiveDays >= 3, text: () => 'Welcome back. Your benefits are still here. 👋' },

        // ---- Business insights: facts from the person's own records
        { id: 'in-funding', chime: true, cat: 'insight', tier: 2, cooldown: 3 * DAY, go: 'funding', when: c => c.needFunding, text: () => 'Need money for stock? Get help 💰' },
        // A customer owes: a reminder every 3 days until it is paid (each customer has their own 3 days). Never late at night.
        subjective({ id: 'in-owe', chime: true, cat: 'insight', tier: 2, cooldown: REMIND_AFTER * DAY, reminder: true, go: 'customers',
            ok: c => c.tod !== 'night',
            subjects: c => c.debtsDue.map(d => ({ key: 'owe:' + d.key, arg: { sale: d.oldestId, name: d.name }, d })),
            text: (c, r, s) => {
                const n = owedName(s.d), amt = naira(s.d.owed);
                return s.d.age < 7
                    ? pick1(r, [`${n} owes ${amt} since ${weekdayOf(s.d)}. 📒`, `Remind ${n} politely about ${amt}. 🤝`])
                    : pick1(r, [`${n} still owes ${amt}. Call kindly. 📞`, `Remind ${n} politely about ${amt}. 🤝`]);
            } }),
        { id: 'in-owe-all', cat: 'insight', cooldown: REMIND_AFTER * DAY, go: 'customers', when: c => c.debtorCount >= 2 && c.tod !== 'night', weight: () => 1.5, text: c => `Customers owe you ${naira(c.debtTotal)}. Tap to see. 👀` },
        // Stock: yours, and (for wholesalers and their salespeople) your customers'. Mornings are the time to act on it.
        subjective({ id: 'in-lowstock', chime: true, cat: 'insight', tier: 1, cooldown: 2 * DAY, go: 'product', weight: c => c.tod === 'morning' ? 1.5 : 1,
            subjects: c => c.lowProducts.map(p => ({ key: 'low:' + p.id, arg: { id: p.id, tab: 'restock' }, p })),
            text: (c, r, s) => `You're running low on ${short(s.p.name, 2)}. 📦` }),
        subjective({ id: 'in-outstock', chime: true, cat: 'insight', tier: 1, cooldown: 2 * DAY, go: 'product', weight: c => c.tod === 'morning' ? 1.5 : 1,
            subjects: c => c.outProducts.map(p => ({ key: 'out:' + p.id, arg: { id: p.id, tab: 'outofstock' }, p })),
            text: (c, r, s) => `${short(s.p.name, 2)} is out of stock. Restock soon. 📦` }),
        subjective({ id: 'in-cust-low', chime: true, cat: 'insight', tier: 1, roles: ['Wholesaler', 'Salesperson'], cooldown: 3 * DAY, go: 'customers', weight: c => c.tod === 'morning' ? 1.5 : 1,
            subjects: c => c.custLow.map(x => ({ key: 'cl:' + x.id, arg: { customer: x.id, name: x.name }, x })),
            text: (c, r, s) => `${short(s.x.name, 2)} is ${s.x.out ? 'out of' : 'low on'} ${short(s.x.product, 2)}. 🛒` }),
        { id: 'in-cust-many', chime: true, cat: 'insight', roles: ['Wholesaler', 'Salesperson'], cooldown: 2 * DAY, go: 'customers', when: c => c.custLow.length >= 3, weight: () => 2.5, text: c => `${c.custLow.length} customers need stock. Tap to see. 🛒` },

        { id: 'in-milestone', cat: 'insight', when: c => c.toMilestone && c.toMilestone.n >= 1 && c.toMilestone.n <= 20, weight: c => c.toMilestone.n <= 5 ? 2.5 : 1.2,
            text: c => `${c.toMilestone.n} ${c.toMilestone.n === 1 ? 'sale' : 'sales'} away from ${c.toMilestone.to}. 🎯` },
        { id: 'in-100k', chime: true, cat: 'insight', when: c => c.first100k, weight: () => 3, text: () => 'Your first ₦100k day this week! 👏' },
        { id: 'in-paid', chime: true, cat: 'insight', when: c => !!c.paid, weight: () => 3, text: c => `${short(c.paid.name || 'A customer', 2)} paid back ${naira(c.paid.amt)}. 🎉` },
        { id: 'in-best-item', cat: 'insight', when: c => !!c.topItem, text: c => `${c.topItem} is your best seller this week. ⭐` },
        { id: 'in-up', cat: 'insight', when: c => c.prev7 > 0 && c.last7 > c.prev7, text: c => `You sold ${naira(c.last7 - c.prev7)} more than last week. 📈` },
        { id: 'in-best-day', chime: true, cat: 'insight', when: c => c.bestDay, weight: () => 2.5, text: () => 'Your best day this week so far! 🌟' },
        { id: 'in-slow', cat: 'insight', when: c => c.slowDay && !!c.topItem, text: c => `Slow day? Offer ${c.topItem} to customers. 💡` },
        { id: 'in-daily', cat: 'insight', when: c => (c.tod === 'evening' || c.tod === 'night') && c.todaySales >= 3, weight: () => 2, text: c => `Today: ${c.todaySales} sales, ${naira(c.todayTotal)}. Well done! 🌟` },
        { id: 'in-receipts5', cat: 'insight', when: c => c.receipts7 >= 5, text: c => `${c.receipts7} receipts shared this week. Customers trust you. 🙌` },
        { id: 'in-transfer', cat: 'insight', when: c => c.lowTransfers, text: () => 'Transfer items to customers after each sale. 🚚' },
        { id: 'in-streak', cat: 'insight', when: c => c.streak >= 3, text: c => `${c.streak} days in a row. Keep the streak. 🔥` },
        { id: 'in-streak-goal', cat: 'insight', when: c => [2, 6, 13, 29].indexOf(c.streak) >= 0, weight: () => 2.5, text: c => `Tomorrow makes ${c.streak + 1} days in a row! 🔥` },
        { id: 'in-streak-risk', chime: true, cat: 'insight', when: c => c.streakRisk, weight: () => 2.5, text: c => `Sell once today to keep your ${c.streakBefore}-day streak. 🔥` },
        { id: 'in-month', cat: 'insight', when: c => c.monthTime && c.month > 0, text: c => `${naira(c.month)} recorded this month. 📅` },

        // ---- Motivation: encouragement, light Pidgin
        { id: 'mo-try', cat: 'motivation', any: true, when: () => true, text: () => 'You try today. Weldone abeg! 👏' },
        { id: 'mo-observe', cat: 'motivation', any: true, when: () => true, text: () => 'I just dey observe. 👀' },
        { id: 'mo-small', cat: 'motivation', any: true, when: () => true, text: () => 'Small small, na so business dey build. 🧱' },
        { id: 'mo-steady', cat: 'motivation', any: true, when: () => true, text: () => 'Steady steady. Your shop dey grow. 🌱' },
        { id: 'mo-hustle', cat: 'motivation', any: true, when: () => true, text: () => 'Your hustle dey pay. Keep going! 💪' },
        { id: 'mo-fit', cat: 'motivation', any: true, when: () => true, text: () => 'Oya, one more sale. You fit! 🙌' },
        { id: 'mo-proud', cat: 'motivation', any: true, when: () => true, text: () => 'We dey proud of you. 💛' },
        { id: 'mo-shine', cat: 'motivation', any: true, when: () => true, text: () => 'Your shop dey shine. Weldone! 🌟' },
        { id: 'mo-stress', cat: 'motivation', any: true, when: () => true, text: () => 'No stress. Na one sale at a time. 😌' },
        { id: 'mo-customers', cat: 'motivation', when: c => c.tod === 'afternoon' || c.tod === 'evening', text: () => 'Customers dey come. Keep it up. 🙌' },
        { id: 'mo-sharp', cat: 'motivation', when: c => c.todaySales >= 10, text: () => 'Your records dey sharp. ✅' },
        { id: 'mo-busy', cat: 'motivation', when: c => c.todaySales >= 15, weight: () => 1.5, text: () => 'Customers plenty today! Weldone o! 😍' },
        { id: 'mo-streak', cat: 'motivation', when: c => c.streak >= 3, text: () => 'You too much o! Keep the streak. 🔥' },
        { id: 'mo-paid', cat: 'motivation', when: c => !!c.paid, weight: () => 2, text: () => 'Money don land! Weldone. 💸' },
        { id: 'mo-slow', cat: 'motivation', when: c => c.slowDay, weight: () => 2, text: () => 'Slow day no dey forever. Customers go come. 🙏' },
        { id: 'mo-monday', cat: 'motivation', when: c => c.isMonday && c.tod !== 'night', weight: () => 2, text: () => 'New week o! Make we sell well. 🚀' },
        { id: 'mo-month', cat: 'motivation', when: c => c.monthStart && c.tod !== 'night', weight: () => 2, text: () => 'New month don land! Make we win. 🏆' },
        { id: 'mo-oga-any', cat: 'motivation', who: 'Male', any: true, when: () => true, text: () => 'Na you be oga o! 😎' },
        { id: 'mo-oga-shine', cat: 'motivation', who: 'Male', any: true, when: () => true, text: () => 'Oga, your shop dey shine! 🌟' },
        { id: 'mo-oga-try', cat: 'motivation', who: 'Male', when: c => c.todaySales >= 10, text: () => 'Oga, you dey try! 💪' },
        { id: 'mo-oga-show', chime: true, cat: 'motivation', who: 'Male', when: c => c.newHigh, weight: () => 2.5, text: () => 'Oga don show. Weldone! 🏆' },
        { id: 'mo-madam-any', cat: 'motivation', who: 'Female', any: true, when: () => true, text: () => 'Madam di madam! 👑' },
        { id: 'mo-madam-shine', cat: 'motivation', who: 'Female', any: true, when: () => true, text: () => 'Madam, your shop dey shine! 🌟' },
        { id: 'mo-madam-try', cat: 'motivation', who: 'Female', when: c => c.todaySales >= 10, text: () => 'Madam, you dey try o! 💪' },
        { id: 'mo-madam-show', chime: true, cat: 'motivation', who: 'Female', when: c => c.newHigh, weight: () => 2.5, text: () => 'Madam don show. Weldone! 🏆' },
        { id: 'mo-morning', cat: 'motivation', when: c => c.tod === 'morning', text: () => 'Good morning. Make today a good one. ☀️' },
        { id: 'mo-morning-pcm', cat: 'motivation', when: c => c.tod === 'morning', text: () => 'Good morning o! Make we start well. ☀️' },
        { id: 'mo-evening', cat: 'motivation', when: c => c.tod === 'evening', text: () => 'Day almost done. You did well. 🌇' },
        { id: 'mo-tired', cat: 'motivation', when: c => (c.tod === 'evening' || c.tod === 'night') && c.todaySales >= 5, text: () => 'You don work hard today. Weldone! 🌙' },
        { id: 'mo-night', cat: 'motivation', when: c => c.tod === 'night', text: () => 'Working late? Rest well after this. 🌙' },

        // ---- Inactivity (when the app opens after days away): kind, never shaming
        { id: 'ia-1', cat: 'inactivity', open: true, when: c => c.inactiveDays >= 1 && c.inactiveDays <= 2, text: () => 'We missed you. Record today\'s sales. 💛' },
        { id: 'ia-3', cat: 'inactivity', open: true, when: c => c.inactiveDays >= 3 && c.inactiveDays <= 6, text: () => 'Your shop book is waiting. 📒' },
        { id: 'ia-7', cat: 'inactivity', open: true, when: c => c.inactiveDays >= 7, text: () => 'Start again with one sale today. 🚀' },
        { id: 'ia-oga', cat: 'inactivity', open: true, who: 'Male', when: c => c.inactiveDays >= 3 && !!c.lastSaleDate, text: (c, r) => `Oga, where you dey since ${c.lastSaleDate}? ${['😊', '🤗', '💛'][Math.floor(r() * 3)]}` },
        { id: 'ia-madam', cat: 'inactivity', open: true, who: 'Female', when: c => c.inactiveDays >= 3 && !!c.lastSaleDate, text: (c, r) => `Madam, where you dey since ${c.lastSaleDate}? ${['😊', '🤗', '💛'][Math.floor(r() * 3)]}` },
        { id: 'ia-morning', cat: 'inactivity', open: true, when: c => c.inactiveDays >= 1 && c.tod === 'morning', text: () => 'Good morning. Record your first sale. ☀️' },

        // ---- The welcome after a first sale
        { id: 'welcome', chime: true, cat: 'welcome', special: true, when: () => false, text: () => 'First sale recorded. Welcome aboard! 🎉' }
    ];
    const BY_ID = {};
    CATALOG.forEach(m => { BY_ID[m.id] = m; });

    const fitsWho = (m, c) => !m.who || m.who === c.gender;
    const fitsRole = (m, c) => !m.roles || m.roles.indexOf(c.role) >= 0;

    // ---------------------------------------------------------------- remembering where a person is in their run
    function newState(seed) {
        return { v: 1, seed: seed >>> 0, n: 0, cat: null, id: null, text: null, subject: null, actions: 0, recent: [], shown: {}, times: {}, urgentRun: 0, lowSince: {}, freshAt: 0, openDay: null, welcomed: false, acts: { receipt: [], transfer: [] } };
    }

    function settle(state, m, key, subject, text, ctx) {
        const nowMs = ctx && ctx.now ? ctx.now.getTime() : Date.now();
        state.id = m.id; state.cat = m.cat; state.n++;
        state.text = (m.open || m.special) ? text : null; // these keep the words they were shown with
        state.subject = subject ? { key: subject.key, arg: subject.arg || null } : null;
        state.actions = 0;
        state.recent.push(m.id);
        if (state.recent.length > 8) state.recent.shift();
        const shown = state.shown = state.shown || {};
        const times = state.times = state.times || {};
        shown[key] = nowMs;
        times[key] = (times[key] || 0) + 1;
        Object.keys(shown).forEach(k => { if (nowMs - shown[k] > 30 * DAY) { delete shown[k]; delete times[k]; } }); // (old ones are forgotten)
    }

    // Everything that could be said now: it fits the person, is true, is fine to start with, and is not on cooldown.
    // A message about one thing (a customer, a product) is offered with the first one that is not on cooldown.
    function eligible(state, ctx) {
        const nowMs = ctx.now.getTime();
        const cooled = (m, key) => !(m.cooldown && state.shown && state.shown[key] && nowMs - state.shown[key] < m.cooldown);
        const out = [];
        CATALOG.forEach(m => {
            if (m.open || m.special || CATS.indexOf(m.cat) < 0 || !fitsWho(m, ctx) || !fitsRole(m, ctx) || (m.ok && !m.ok(ctx))) return;
            if (m.subjects) {
                const s = m.subjects(ctx).find(x => cooled(m, x.key));
                if (s) out.push({ m, s, key: s.key });
            } else if (m.when(ctx) && cooled(m, m.id)) out.push({ m, s: null, key: m.id });
        });
        return out;
    }

    // How much each kind suits this moment (they all start equal, so the kinds still take turns)
    function kindWeight(cat, c) {
        let w = 1;
        if (cat === 'airtime') { if (c.tenureDays < 7 || c.totalSales < 15) w *= 1.6; if (c.inactiveDays >= 3) w *= 1.4; } // new people: how to earn
        if (cat === 'insight') { if (c.recentWin) w *= 1.8; if (c.totalSales < 10) w *= 0.6; }                              // a fresh win is celebrated; few records, little to say
        if (cat === 'motivation') { if (c.slowDay) w *= 1.7; if (c.inactiveDays >= 3) w *= 1.3; if (c.tod === 'night') w *= 1.3; } // encouragement when it is quiet
        return w;
    }

    function scoreOf(state, x, c) {
        let w = (x.m.any ? 1 : 3) * (x.m.weight ? x.m.weight(c) : 1); // what fits this moment counts for more than what fits any
        w /= 1 + 0.5 * ((state.times || {})[x.key] || 0);             // the more it has been shown, the less it comes up
        if (state.recent.indexOf(x.m.id) >= 0) w *= 0.2;               // and not again straight away
        return w;
    }

    // Picks the next message: never the same kind as the last. Something to act on today goes first (but not in a rush,
    // and stock reminders not three insights in a row), otherwise a kind is drawn by what suits the moment, then a message of that kind by weight.
    function pick(state, ctx) {
        const rng = rngFor(state);
        const all = eligible(state, ctx);
        const others = all.filter(x => x.m.cat !== state.cat);
        const pool = others.length ? others : all;
        let chosen = null;
        const top = pool.reduce((t, x) => Math.max(t, x.m.tier || 0), 0); // 2 (money owed, money for stock) before 1 (stock running out)
        const urgent = top ? pool.filter(x => x.m.tier === top) : [];
        if (urgent.length && !ctx.busy && (top === 2 || (state.urgentRun || 0) < 2)) { // (stock reminders give way to a plain insight after two in a row)
            chosen = draw(urgent, urgent.map(x => scoreOf(state, x, ctx)), rng);
        }
        if (!chosen) {
            const cats = CATS.filter(cat => pool.some(x => x.m.cat === cat));
            const cat = draw(cats, cats.map(k => kindWeight(k, ctx)), rng);
            const list = pool.filter(x => x.m.cat === cat);
            chosen = draw(list, list.map(x => scoreOf(state, x, ctx)), rng);
        }
        if (chosen.m.cat === 'insight' && chosen.m.tier !== 2) state.urgentRun = chosen.m.tier ? (state.urgentRun || 0) + 1 : 0;
        settle(state, chosen.m, chosen.key, chosen.s, null, ctx);
        return chosen;
    }

    // What to show in the Profile now. Picks a new message when it is due (5 actions), when there is none yet,
    // or when the one shown is no longer true (it was morning and now it is evening, or a debt was paid).
    function show(state, ctx) {
        let m = BY_ID[state.id];
        let subject = null;
        const keeps = m && (m.open || m.special);
        if (m && !keeps && m.subjects && state.subject) subject = m.subjects(ctx).find(s => s.key === state.subject.key) || null;
        const valid = !!m && (keeps || (fitsWho(m, ctx) && fitsRole(m, ctx) && (m.subjects ? !!subject : m.when(ctx))));
        if (!m || !valid || state.actions >= EVERY) { const x = pick(state, ctx); m = x.m; subject = x.s; }
        const text = (m.open || m.special) ? state.text : m.text(ctx, rngFor(state), subject);
        return { text, go: m.go || null, arg: subject ? subject.arg || null : null, id: m.id, cat: m.cat, chime: !!m.chime };
    }

    // The app has just opened (once a day): after a day or more without a sale, a kind nudge replaces the current message;
    // otherwise a credit that is due its reminder is said now, as long as the last message was not an insight.
    function onOpen(state, ctx) {
        if (state.openDay === ctx.today) return false;
        state.openDay = ctx.today;
        const rng = rngFor(state);
        if (ctx.inactiveDays >= 1) {
            let list = CATALOG.filter(m => m.open && fitsWho(m, ctx) && m.when(ctx));
            if (!list.length) return false;
            const fresh = list.filter(m => state.recent.indexOf(m.id) < 0);
            if (fresh.length) list = fresh;
            const m = list[Math.floor(rng() * list.length)];
            settle(state, m, m.id, null, m.text(ctx, rng), ctx);
            return true;
        }
        if (state.cat === 'insight') return false;
        const due = eligible(state, ctx).filter(x => x.m.reminder && x.m.cat !== state.cat);
        if (!due.length) return false;
        const x = due[0]; // (the customer owing the most comes first)
        settle(state, x.m, x.key, x.s, null, ctx);
        return true;
    }

    // The first sale ever: a welcome, straight away
    function welcome(state, ctx) {
        const m = BY_ID.welcome;
        state.welcomed = true;
        settle(state, m, m.id, null, m.text(ctx), ctx);
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

    root.PikaNudges = { EVERY, CATS, CATALOG, buildContext, trackStock, newState, show, pick, eligible, onOpen, welcome, act, makeRng, chimes: (id) => !!(BY_ID[id] && BY_ID[id].chime), todayIndex: (d) => dayIdx(d || new Date()) };
    if (typeof module !== 'undefined' && module.exports) module.exports = root.PikaNudges;
})(typeof window !== 'undefined' ? window : globalThis);
