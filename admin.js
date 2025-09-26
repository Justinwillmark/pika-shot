document.addEventListener('DOMContentLoaded', () => {
    const App = {
        elements: {
            passwordModal: document.getElementById('password-modal'),
            passwordInput: document.getElementById('password-input'),
            passwordSubmit: document.getElementById('password-submit'),
            errorMessage: document.getElementById('error-message'),
            dashboardContainer: document.getElementById('dashboard-container'),
            totalUsers: document.getElementById('total-users'),
            totalScans: document.getElementById('total-scans'),
            uniqueBarcodes: document.getElementById('unique-barcodes'),
            scansChart: document.getElementById('scans-chart'),
            userSearch: document.getElementById('user-search'),
            exportCsvBtn: document.getElementById('export-csv-btn'),
            usersTableBody: document.getElementById('users-table-body'),
            leaderboardTableBody: document.getElementById('leaderboard-table-body'),
            barcodesList: document.getElementById('barcodes-list'),
        },

        state: {
            users: [],
            scanLogs: [],
            chart: null,
        },

        init() {
            this.setupEventListeners();
        },

        setupEventListeners() {
            this.elements.passwordSubmit.addEventListener('click', this.handleLogin.bind(this));
            this.elements.passwordInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
            this.elements.userSearch.addEventListener('input', this.filterUserTable.bind(this));
            this.elements.exportCsvBtn.addEventListener('click', this.exportUsersToCsv.bind(this));
        },

        handleLogin() {
            const pass = this.elements.passwordInput.value;
            if (pass === 'readyshot') {
                this.elements.passwordModal.style.display = 'none';
                this.elements.dashboardContainer.style.display = 'block';
                this.loadDashboardData();
            } else {
                this.elements.errorMessage.textContent = 'Incorrect password. Please try again.';
                this.elements.passwordInput.value = '';
            }
        },

        async loadDashboardData() {
            try {
                // Fetch data in parallel
                const [usersSnapshot, scansSnapshot] = await Promise.all([
                    window.fb.getDocs(window.fb.collection(window.fb.db, 'users')),
                    window.fb.getDocs(window.fb.collection(window.fb.db, 'scan_logs'))
                ]);

                this.state.users = usersSnapshot.docs.map(doc => doc.data());
                this.state.scanLogs = scansSnapshot.docs.map(doc => doc.data());
                
                this.renderStats();
                this.renderScansChart();
                this.renderUserTable();
                this.renderLeaderboard();
                this.renderBarcodesList();

            } catch (error) {
                console.error("Error loading dashboard data:", error);
                alert("Could not load data from Firestore. Check console for errors.");
            }
        },

        renderStats() {
            const uniqueBarcodes = new Set(this.state.scanLogs.map(log => log.barcode));
            this.elements.totalUsers.textContent = this.state.users.length.toLocaleString();
            this.elements.totalScans.textContent = this.state.scanLogs.length.toLocaleString();
            this.elements.uniqueBarcodes.textContent = uniqueBarcodes.size.toLocaleString();
        },

        renderScansChart() {
            const scansLast7Days = { labels: [], data: [] };
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                scansLast7Days.labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                scansLast7Days.data.push(0);
            }

            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            this.state.scanLogs.forEach(log => {
                const logDate = log.timestamp.toDate();
                if (logDate >= sevenDaysAgo) {
                    const label = logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const index = scansLast7Days.labels.indexOf(label);
                    if (index > -1) {
                        scansLast7Days.data[index]++;
                    }
                }
            });
            
            if (this.state.chart) {
                this.state.chart.destroy();
            }

            this.state.chart = new Chart(this.elements.scansChart, {
                type: 'line',
                data: {
                    labels: scansLast7Days.labels,
                    datasets: [{
                        label: 'Total Scans',
                        data: scansLast7Days.data,
                        borderColor: 'rgba(74, 144, 226, 1)',
                        backgroundColor: 'rgba(74, 144, 226, 0.1)',
                        fill: true,
                        tension: 0.4, // This makes the line curvy
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, grid: { color: '#e9ecef' } },
                        x: { grid: { display: false } }
                    }
                }
            });
        },

        renderUserTable() {
            this.elements.usersTableBody.innerHTML = '';
            this.state.users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.business || 'N/A'}</td>
                    <td>${user.location || 'N/A'}</td>
                    <td>${user.type || 'N/A'}</td>
                    <td>${user.phone || 'N/A'}</td>
                `;
                this.elements.usersTableBody.appendChild(row);
            });
        },

        filterUserTable() {
            const searchTerm = this.elements.userSearch.value.toLowerCase();
            const rows = this.elements.usersTableBody.getElementsByTagName('tr');
            Array.from(rows).forEach(row => {
                const text = row.textContent || row.innerText;
                row.style.display = text.toLowerCase().includes(searchTerm) ? '' : 'none';
            });
        },
        
        renderLeaderboard() {
            const scanCounts = {};
            this.state.scanLogs.forEach(log => {
                const userId = log.userId;
                if (!scanCounts[userId]) {
                    scanCounts[userId] = { count: 0, lastScan: new Date(0) };
                }
                scanCounts[userId].count++;
                if (log.timestamp.toDate() > scanCounts[userId].lastScan) {
                    scanCounts[userId].lastScan = log.timestamp.toDate();
                }
            });

            const leaderboardData = Object.entries(scanCounts)
                .map(([userId, data]) => {
                    const user = this.state.users.find(u => u.phone === userId);
                    return {
                        name: user ? user.name : userId,
                        ...data
                    };
                })
                .sort((a, b) => b.count - a.count);

            this.elements.leaderboardTableBody.innerHTML = '';
            leaderboardData.forEach((item, index) => {
                const row = document.createElement('tr');
                const lastScanFormatted = item.lastScan.getTime() > 0 ? item.lastScan.toLocaleDateString() : 'N/A';
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.count}</td>
                    <td>${lastScanFormatted}</td>
                `;
                this.elements.leaderboardTableBody.appendChild(row);
            });
        },

        renderBarcodesList() {
            const uniqueBarcodes = [...new Set(this.state.scanLogs.map(log => log.barcode))];
            this.elements.barcodesList.innerHTML = uniqueBarcodes.map(barcode => `<li>${barcode}</li>`).join('');
        },

        exportUsersToCsv() {
            const headers = ['Name', 'Business Name', 'Location', 'Category', 'Phone'];
            const rows = this.state.users.map(user => 
                [user.name, user.business, user.location, user.type, user.phone].join(',')
            );
            const csvContent = "data:text/csv;charset=utf-8," 
                + headers.join(',') + "\n" 
                + rows.join("\n");
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "pika_shot_users.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    App.init();
});