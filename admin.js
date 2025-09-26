document.addEventListener('DOMContentLoaded', () => {
    const App = {
        elements: {
            loginModal: document.getElementById('login-modal'),
            loginForm: document.getElementById('login-form'),
            emailInput: document.getElementById('email-input'),
            passwordInput: document.getElementById('password-input'),
            errorMessage: document.getElementById('error-message'),
            dashboardContainer: document.getElementById('dashboard-container'),
            refreshBtn: document.getElementById('refresh-btn'),
            totalUsers: document.getElementById('total-users'),
            totalScans: document.getElementById('total-scans'),
            uniqueBarcodes: document.getElementById('unique-barcodes'),
            totalSalesAllTime: document.getElementById('total-sales-all-time'),
            totalSalesToday: document.getElementById('total-sales-today'),
            scansChart: document.getElementById('scans-chart'),
            // Table Elements
            usersTableBody: document.getElementById('users-table-body'),
            userSearch: document.getElementById('user-search'),
            exportUsersBtn: document.getElementById('export-users-btn'),
            callsTableBody: document.getElementById('calls-table-body'),
            callsSearch: document.getElementById('calls-search'),
            exportCallsBtn: document.getElementById('export-calls-btn'),
            leaderboardTableBody: document.getElementById('leaderboard-table-body'),
            leaderboardSearch: document.getElementById('leaderboard-search'),
            exportLeaderboardBtn: document.getElementById('export-leaderboard-btn'),
            barcodesTableBody: document.getElementById('barcodes-table-body'),
            barcodesSearch: document.getElementById('barcodes-search'),
            exportBarcodesBtn: document.getElementById('export-barcodes-btn'),
        },

        state: {
            users: [],
            scanLogs: [],
            callLogs: [],
            salesLogs: [],
            chart: null,
            dateOptions: { weekday: 'long', month: 'short', year: 'numeric' },
        },

        init() {
            this.setupEventListeners();
            this.checkAuthState();
        },
        
        checkAuthState() {
            window.fb.onAuthStateChanged(window.fb.auth, (user) => {
                if (user) {
                    this.elements.loginModal.style.display = 'none';
                    this.elements.dashboardContainer.style.display = 'block';
                    this.loadDashboardData();
                } else {
                    this.elements.loginModal.style.display = 'flex';
                    this.elements.dashboardContainer.style.display = 'none';
                }
            });
        },

        setupEventListeners() {
            this.elements.loginForm.addEventListener('submit', this.handleLogin.bind(this));
            this.elements.refreshBtn.addEventListener('click', this.handleRefresh.bind(this));
            // Search Listeners
            this.elements.userSearch.addEventListener('input', (e) => this.filterTable(e.target.value, this.elements.usersTableBody));
            this.elements.callsSearch.addEventListener('input', (e) => this.filterTable(e.target.value, this.elements.callsTableBody));
            this.elements.leaderboardSearch.addEventListener('input', (e) => this.filterTable(e.target.value, this.elements.leaderboardTableBody));
            this.elements.barcodesSearch.addEventListener('input', (e) => this.filterTable(e.target.value, this.elements.barcodesTableBody));
            // Export Listeners
            this.elements.exportUsersBtn.addEventListener('click', () => this.exportTableToCsv('pika_shot_users.csv', this.state.users, ['Name', 'Business Name', 'Location', 'Category', 'Phone'], ['name', 'business', 'location', 'type', 'phone']));
            this.elements.exportCallsBtn.addEventListener('click', () => this.exportTableToCsv('pika_shot_calls.csv', this.state.callLogs, ['Wholesaler', 'Retailer Called', 'Date of Call'], ['wholesalerName', 'retailerName', 'timestamp']));
            this.elements.exportLeaderboardBtn.addEventListener('click', this.exportLeaderboardToCsv.bind(this));
            this.elements.exportBarcodesBtn.addEventListener('click', this.exportBarcodesToCsv.bind(this));
        },

        async handleLogin(e) {
            e.preventDefault();
            const email = this.elements.emailInput.value;
            const password = this.elements.passwordInput.value;
            try {
                await window.fb.signInWithEmailAndPassword(window.fb.auth, email, password);
                this.elements.errorMessage.textContent = '';
            } catch (error) {
                console.error("Login failed:", error);
                this.elements.errorMessage.textContent = 'Login failed. Please check email and password.';
            }
        },

        async handleRefresh() {
            this.elements.refreshBtn.classList.add('loading');
            await this.loadDashboardData();
            setTimeout(() => {
                this.elements.refreshBtn.classList.remove('loading');
            }, 500);
        },

        async loadDashboardData() {
            try {
                const usersQuery = window.fb.query(window.fb.collection(window.fb.db, 'users'));
                const scansQuery = window.fb.query(window.fb.collection(window.fb.db, 'scan_logs'));
                const callsQuery = window.fb.query(window.fb.collection(window.fb.db, 'call_logs'), window.fb.orderBy('timestamp', 'desc'));
                const salesQuery = window.fb.query(window.fb.collection(window.fb.db, 'sales_logs'));

                const [usersSnapshot, scansSnapshot, callsSnapshot, salesSnapshot] = await Promise.all([
                    window.fb.getDocs(usersQuery), window.fb.getDocs(scansQuery),
                    window.fb.getDocs(callsQuery), window.fb.getDocs(salesQuery)
                ]);

                this.state.users = usersSnapshot.docs.map(doc => doc.data());
                this.state.scanLogs = scansSnapshot.docs.map(doc => doc.data());
                this.state.callLogs = callsSnapshot.docs.map(doc => doc.data());
                this.state.salesLogs = salesSnapshot.docs.map(doc => doc.data());
                
                this.renderAllComponents();
            } catch (error) {
                console.error("Error loading dashboard data:", error);
                alert("Could not load data from Firestore. Check console for errors.");
            }
        },
        
        renderAllComponents() {
            this.renderStats();
            this.renderScansChart();
            this.renderUserTable();
            this.renderCallLogTable();
            this.renderLeaderboard();
            this.renderBarcodesTable();
        },

        renderStats() {
            const uniqueBarcodes = new Set(this.state.scanLogs.map(log => log.barcode));
            this.elements.totalUsers.textContent = this.state.users.length.toLocaleString();
            this.elements.totalScans.textContent = this.state.scanLogs.length.toLocaleString();
            this.elements.uniqueBarcodes.textContent = uniqueBarcodes.size.toLocaleString();
            const totalSales = this.state.salesLogs.reduce((sum, sale) => sum + (sale.total || 0), 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todaySales = this.state.salesLogs
                .filter(sale => sale.timestamp && sale.timestamp.toDate() >= today)
                .reduce((sum, sale) => sum + (sale.total || 0), 0);
            const formatNaira = (amount) => amount.toLocaleString('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 });
            this.elements.totalSalesAllTime.textContent = formatNaira(totalSales);
            this.elements.totalSalesToday.textContent = formatNaira(todaySales);
        },

        renderScansChart() {
            const scansLast30Days = { labels: [], data: [] };
            for (let i = 29; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                scansLast30Days.labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                scansLast30Days.data.push(0);
            }
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            thirtyDaysAgo.setHours(0, 0, 0, 0);
            this.state.scanLogs.forEach(log => {
                if (log.timestamp) {
                    const logDate = log.timestamp.toDate();
                    if (logDate >= thirtyDaysAgo) {
                        const label = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        const index = scansLast30Days.labels.indexOf(label);
                        if (index > -1) scansLast30Days.data[index]++;
                    }
                }
            });
            if (this.state.chart) this.state.chart.destroy();
            this.state.chart = new Chart(this.elements.scansChart, {
                type: 'line', data: { labels: scansLast30Days.labels, datasets: [{ label: 'Total Scans', data: scansLast30Days.data, borderColor: 'rgba(74, 144, 226, 1)', backgroundColor: 'rgba(74, 144, 226, 0.1)', fill: true, tension: 0.4, borderWidth: 2 }] },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: '#e9ecef' } }, x: { grid: { display: false }, ticks: { autoSkip: true, maxRotation: 0, minRotation: 0 } } } }
            });
        },

        renderUserTable() {
            this.elements.usersTableBody.innerHTML = '';
            if (this.state.users.length === 0) {
                 this.elements.usersTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No users found.</td></tr>';
                 return;
            }
            this.state.users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${user.name||'N/A'}</td><td>${user.business||'N/A'}</td><td>${user.location||'N/A'}</td><td>${user.type||'N/A'}</td><td>${user.phone||'N/A'}</td>`;
                this.elements.usersTableBody.appendChild(row);
            });
        },

        renderCallLogTable() {
            this.elements.callsTableBody.innerHTML = '';
            if (this.state.callLogs.length === 0) {
                 this.elements.callsTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No call activity recorded yet.</td></tr>';
                 return;
            }
            this.state.callLogs.forEach(log => {
                const row = document.createElement('tr');
                const callDate = log.timestamp ? log.timestamp.toDate().toLocaleDateString('en-GB', this.state.dateOptions) : 'Invalid Date';
                row.innerHTML = `<td>${log.wholesalerName||'N/A'}</td><td>${log.retailerName||'N/A'}</td><td>${callDate}</td>`;
                this.elements.callsTableBody.appendChild(row);
            });
        },

        renderLeaderboard() {
            const scanCounts = {};
            this.state.scanLogs.forEach(log => {
                const userId = log.userId;
                if (!userId) return;
                if (!scanCounts[userId]) scanCounts[userId] = { count: 0, lastScan: new Date(0) };
                scanCounts[userId].count++;
                if (log.timestamp && log.timestamp.toDate() > scanCounts[userId].lastScan) scanCounts[userId].lastScan = log.timestamp.toDate();
            });
            const leaderboardData = Object.entries(scanCounts)
                .map(([userId, data]) => ({ name: (this.state.users.find(u => u.phone === userId) || {}).name || userId, ...data }))
                .sort((a, b) => b.count - a.count);

            this.elements.leaderboardTableBody.innerHTML = '';
            if (leaderboardData.length === 0) {
                 this.elements.leaderboardTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No scan data for leaderboard.</td></tr>';
                 return;
            }
            leaderboardData.forEach((item, index) => {
                const row = document.createElement('tr');
                const lastScanFormatted = item.lastScan.getTime() > 0 ? item.lastScan.toLocaleDateString('en-GB', this.state.dateOptions) : 'N/A';
                row.innerHTML = `<td>${index + 1}</td><td>${item.name}</td><td>${item.count}</td><td>${lastScanFormatted}</td>`;
                this.elements.leaderboardTableBody.appendChild(row);
            });
        },

        renderBarcodesTable() {
            const uniqueBarcodes = [...new Set(this.state.scanLogs.map(log => log.barcode))].filter(Boolean);
            this.elements.barcodesTableBody.innerHTML = '';
            if (uniqueBarcodes.length === 0) {
                 this.elements.barcodesTableBody.innerHTML = '<tr><td style="text-align:center;">No barcodes scanned yet.</td></tr>';
                 return;
            }
            uniqueBarcodes.forEach(barcode => {
                const row = document.createElement('tr');
                row.innerHTML = `<td>${barcode}</td>`;
                this.elements.barcodesTableBody.appendChild(row);
            });
        },

        filterTable(searchTerm, tableBody) {
            const term = searchTerm.toLowerCase();
            const rows = tableBody.getElementsByTagName('tr');
            Array.from(rows).forEach(row => {
                const text = row.textContent || row.innerText;
                row.style.display = text.toLowerCase().includes(term) ? '' : 'none';
            });
        },
        
        exportTableToCsv(filename, data, headers, fields) {
            const rows = data.map(item => fields.map(field => {
                let val = item[field] || '';
                if (field === 'timestamp' && val.toDate) val = val.toDate().toLocaleDateString('en-GB', this.state.dateOptions);
                return `"${(val).toString().replace(/"/g, '""')}"`;
            }).join(','));
            const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.join("\n");
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csvContent));
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        exportLeaderboardToCsv() {
             const scanCounts = {};
            this.state.scanLogs.forEach(log => {
                const userId = log.userId;
                if (!userId) return;
                if (!scanCounts[userId]) scanCounts[userId] = { count: 0, lastScan: new Date(0) };
                scanCounts[userId].count++;
                if (log.timestamp && log.timestamp.toDate() > scanCounts[userId].lastScan) scanCounts[userId].lastScan = log.timestamp.toDate();
            });
            const leaderboardData = Object.entries(scanCounts)
                .map(([userId, data]) => ({ rank: 0, name: (this.state.users.find(u => u.phone === userId) || {}).name || userId, scans: data.count, lastScan: data.lastScan }))
                .sort((a, b) => b.scans - a.scans)
                .map((item, index) => ({...item, rank: index + 1 }));

            this.exportTableToCsv('pika_shot_leaderboard.csv', leaderboardData, ['Rank', 'User', 'Scans', 'Last Scan'], ['rank', 'name', 'scans', 'lastScan']);
        },

        exportBarcodesToCsv() {
            const uniqueBarcodes = [...new Set(this.state.scanLogs.map(log => log.barcode))].filter(Boolean);
            const data = uniqueBarcodes.map(b => ({ barcode: b }));
            this.exportTableToCsv('pika_shot_barcodes.csv', data, ['Barcode'], ['barcode']);
        }
    };

    App.init();
});
