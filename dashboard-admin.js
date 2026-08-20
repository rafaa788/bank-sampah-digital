// dashboard-admin.js
// =====================================================
// DASHBOARD ADMIN - DENGAN DIAGRAM
// =====================================================

var adminTabAktif = 'dashboard';
var statusChartInstance = null;
var bsuChartInstance = null;
var trendChartInstance = null;

function renderAdmin() {
    renderVerifikasiAdmin();
    renderHargaSampah();
    renderDataBSU();
    renderNasabahAdmin();
    updateAdminSummary();
    renderAdminStatistik();
    renderDashboardCharts();
    renderTopNasabah();
    renderRingkasanJenisSampah();
}

// =============================================
// DASHBOARD - DIAGRAM
// =============================================

function renderDashboardCharts() {
    renderStatusChart();
    renderBSUChart();
    renderTrendChart();
}

// --- 1. PIE CHART: Status Transaksi ---
function renderStatusChart() {
    var transaksi = window.daftarSampah || [];
    var diverifikasi = 0, menunggu = 0, ditolak = 0;
    
    for (var i = 0; i < transaksi.length; i++) {
        if (transaksi[i].status === 'diverifikasi') diverifikasi++;
        else if (transaksi[i].status === 'menunggu') menunggu++;
        else if (transaksi[i].status === 'ditolak') ditolak++;
    }
    
    document.getElementById('totalTransaksiStatus').textContent = transaksi.length;
    
    var ctx = document.getElementById('statusChart')?.getContext('2d');
    if (!ctx) return;
    
    if (statusChartInstance) {
        statusChartInstance.destroy();
    }
    
    statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Diverifikasi', 'Menunggu', 'Ditolak'],
            datasets: [{
                data: [diverifikasi, menunggu, ditolak],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 8,
                        font: { size: 9 },
                        boxWidth: 10,
                        usePointStyle: true
                    }
                }
            },
            cutout: '65%'
        }
    });
}

// --- 2. BAR CHART: Transaksi per BSU ---
function renderBSUChart() {
    var bsuData = window.dataBSU || [];
    var labels = [];
    var values = [];
    var colors = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899'];
    
    // Ambil 8 BSU teratas
    var bsuTransaksi = [];
    for (var i = 0; i < bsuData.length; i++) {
        var bsu = bsuData[i];
        var transaksi = getTransaksiByBSU(bsu.id);
        var diverifikasi = 0;
        for (var j = 0; j < transaksi.length; j++) {
            if (transaksi[j].status === 'diverifikasi') diverifikasi++;
        }
        bsuTransaksi.push({
            nama: bsu.nama,
            total: diverifikasi
        });
    }
    
    bsuTransaksi.sort(function(a, b) { return b.total - a.total; });
    var top = bsuTransaksi.slice(0, 8);
    
    for (var i = 0; i < top.length; i++) {
        labels.push(top[i].nama.length > 12 ? top[i].nama.substring(0, 10) + '...' : top[i].nama);
        values.push(top[i].total);
    }
    
    document.getElementById('totalBSUCount').textContent = bsuTransaksi.length;
    
    var ctx = document.getElementById('bsuChart')?.getContext('2d');
    if (!ctx) return;
    
    if (bsuChartInstance) {
        bsuChartInstance.destroy();
    }
    
    bsuChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Transaksi Diverifikasi',
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderRadius: 4,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { size: 8 },
                        stepSize: 1
                    }
                },
                x: {
                    ticks: {
                        font: { size: 7 }
                    }
                }
            }
        }
    });
}

// --- 3. LINE CHART: Trend Bulanan ---
function renderTrendChart() {
    var transaksi = window.daftarSampah || [];
    var months = [];
    var values = [];
    var now = new Date();
    
    // 6 bulan terakhir
    for (var i = 5; i >= 0; i--) {
        var month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        var monthLabel = month.toLocaleString('id-ID', { month: 'short' });
        months.push(monthLabel);
        
        var count = 0;
        var monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        var monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 1);
        
        for (var j = 0; j < transaksi.length; j++) {
            var item = transaksi[j];
            var itemDate = new Date(item.created_at || item.tanggal || item.createdAt);
            if (item.status === 'diverifikasi' && 
                itemDate >= monthStart && itemDate < monthEnd) {
                count++;
            }
        }
        values.push(count);
    }
    
    var ctx = document.getElementById('trendChart')?.getContext('2d');
    if (!ctx) return;
    
    if (trendChartInstance) {
        trendChartInstance.destroy();
    }
    
    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Transaksi Diverifikasi',
                data: values,
                borderColor: '#0d9488',
                backgroundColor: 'rgba(13, 148, 136, 0.1)',
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#0d9488'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { size: 8 },
                        stepSize: 1
                    }
                },
                x: {
                    ticks: {
                        font: { size: 8 }
                    }
                }
            }
        }
    });
}

// =============================================
// TOP 5 NASABAH
// =============================================

function renderTopNasabah() {
    var container = document.getElementById('topNasabahList');
    if (!container) return;
    
    var nasabahList = window.daftarNasabah || [];
    var nasabahData = [];
    
    for (var i = 0; i < nasabahList.length; i++) {
        var n = nasabahList[i];
        var saldo = hitungSaldoNasabah(n.id);
        if (saldo > 0) {
            nasabahData.push({
                nama: n.nama,
                saldo: saldo,
                id: n.id,
                isManual: n.isManual || false
            });
        }
    }
    
    nasabahData.sort(function(a, b) { return b.saldo - a.saldo; });
    var top = nasabahData.slice(0, 5);
    
    if (top.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-trophy"></i><p>Belum ada data nasabah dengan setoran</p></div>';
        return;
    }
    
    var maxSaldo = top.length > 0 ? top[0].saldo : 1;
    var medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    var colors = ['#f59e0b', '#94a3b8', '#cd7f32', '#64748b', '#475569'];
    
    var html = '';
    for (var i = 0; i < top.length; i++) {
        var n = top[i];
        var percent = (n.saldo / maxSaldo * 100).toFixed(0);
        var avatarBg = n.isManual ? '#fef3c7' : '#dcfce7';
        var avatarColor = n.isManual ? '#d97706' : '#15803d';
        
        html += '<div class="list-item">';
        html += '  <div class="list-left">';
        html += '    <div style="font-size:18px;width:32px;text-align:center;">' + medals[i] + '</div>';
        html += '    <div class="avatar" style="width:28px;height:28px;font-size:10px;background:' + avatarBg + ';color:' + avatarColor + ';">' + n.nama.charAt(0) + '</div>';
        html += '    <div>';
        html += '      <div style="font-size:11px;font-weight:600;">' + n.nama + (n.isManual ? ' <span style="font-size:8px;color:#d97706;">(Manual)</span>' : '') + '</div>';
        html += '      <div style="font-size:9px;color:#94a3b8;width:100%;max-width:150px;background:#f1f5f9;border-radius:4px;height:6px;margin-top:2px;">';
        html += '        <div style="width:' + percent + '%;background:' + colors[i] + ';height:6px;border-radius:4px;"></div>';
        html += '      </div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div style="text-align:right;">';
        html += '    <div style="font-size:11px;font-weight:700;color:#0d9488;">Rp ' + formatRupiah(n.saldo) + '</div>';
        html += '  </div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// =============================================
// RINGKASAN PER JENIS SAMPAH
// =============================================

function renderRingkasanJenisSampah() {
    var transaksi = window.daftarSampah || [];
    var totalPlastik = 0, totalLogam = 0, totalKertas = 0;
    
    for (var i = 0; i < transaksi.length; i++) {
        var item = transaksi[i];
        if (item.status !== 'diverifikasi') continue;
        
        var jenis = item.jenis || getKategoriByNamaSampah(item.nama) || 'plastik';
        if (jenis === 'plastik') totalPlastik += item.berat;
        else if (jenis === 'logam') totalLogam += item.berat;
        else if (jenis === 'kertas') totalKertas += item.berat;
    }
    
    document.getElementById('statPlastik').textContent = totalPlastik.toFixed(1) + ' kg';
    document.getElementById('statLogam').textContent = totalLogam.toFixed(1) + ' kg';
    document.getElementById('statKertas').textContent = totalKertas.toFixed(1) + ' kg';
}

// =============================================
// STATISTIK ADMIN
// =============================================

function renderAdminStatistik() {
    var transaksi = window.daftarSampah || [];
    var diverifikasi = 0, menunggu = 0, ditolak = 0;
    
    for (var i = 0; i < transaksi.length; i++) {
        if (transaksi[i].status === 'diverifikasi') diverifikasi++;
        else if (transaksi[i].status === 'menunggu') menunggu++;
        else if (transaksi[i].status === 'ditolak') ditolak++;
    }
    
    var totalNasabah = (window.daftarNasabah || []).length;
    
    document.getElementById('adminStatDiverifikasi').textContent = diverifikasi;
    document.getElementById('adminStatMenunggu').textContent = menunggu;
    document.getElementById('adminStatDitolak').textContent = ditolak;
    document.getElementById('adminStatTotalNasabah').textContent = totalNasabah;
}

// =============================================
// UPDATE ADMIN SUMMARY
// =============================================

function updateAdminSummary() {
    var totalSaldo = 0;
    for (var i = 0; i < daftarNasabah.length; i++) {
        totalSaldo += hitungSaldoNasabah(daftarNasabah[i].id);
    }
    document.getElementById('adminSaldoGlobal').textContent = 'Rp ' + formatRupiah(totalSaldo);
}

// =============================================
// VERIFIKASI
// =============================================

function renderVerifikasiAdmin() {
    var container = document.getElementById('adminVerifikasiList');
    if (!container) return;
    
    var menunggu = getTransaksiByStatus('menunggu');
    
    var countEl = document.getElementById('adminVerifikasiCount');
    if (countEl) countEl.textContent = 'Menunggu: ' + menunggu.length;
    
    if (menunggu.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-check-circle"></i><p>Tidak ada data menunggu verifikasi</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < menunggu.length; i++) {
        var item = menunggu[i];
        var nilai = item.berat * item.hargaPerKg;
        var nasabah = getNasabahById(item.nasabahId);
        
        html += '<div class="list-item" style="flex-direction:column;align-items:stretch;">';
        html += '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">';
        html += '    <div class="list-left">';
        html += '      <div class="avatar" style="width:28px;height:28px;font-size:10px;">' + (nasabah ? nasabah.nama.charAt(0) : '?') + '</div>';
        html += '      <div>';
        html += '        <div style="font-size:11px;font-weight:600;">' + (nasabah ? nasabah.nama : 'Unknown') + '</div>';
        html += '        <div style="font-size:9px;color:#64748b;">' + (item.bsu || '-') + ' | ' + (item.rw || '-') + ' - ' + (item.rt || '-') + '</div>';
        html += '        <div style="font-size:8px;color:#94a3b8;">Ketua: ' + (item.ketua || '-') + '</div>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div style="text-align:right;">';
        html += '      <div style="font-size:11px;font-weight:600;">Rp ' + formatRupiah(nilai) + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + item.berat + ' kg</div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div style="font-size:10px;color:#475569;padding:4px 8px;background:#f1f5f9;border-radius:4px;margin-bottom:6px;">';
        html += '    <strong>Sampah:</strong> ' + (item.nama || '-');
        html += '  </div>';
        html += '  <div style="display:flex;gap:6px;justify-content:flex-end;">';
        html += '    <button class="btn-verifikasi terima" onclick="verifikasiSampah(\'' + item.id + '\',\'diverifikasi\')"><i class="fa-solid fa-check"></i> Terima</button>';
        html += '    <button class="btn-verifikasi tolak" onclick="verifikasiSampah(\'' + item.id + '\',\'ditolak\')"><i class="fa-solid fa-xmark"></i> Tolak</button>';
        html += '  </div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

function verifikasiSampah(id, status) {
    var item = updateStatusTransaksi(id, status);
    if (item) {
        showToast('Data sampah ' + (status === 'diverifikasi' ? 'diverifikasi' : 'ditolak'), false);
        renderVerifikasiAdmin();
        renderDataBSU();
        renderNasabahAdmin();
        updateAdminSummary();
        renderAdminStatistik();
        renderDashboardCharts();
        renderTopNasabah();
        renderRingkasanJenisSampah();
    }
}

// =============================================
// HARGA SAMPAH
// =============================================

function renderHargaSampah() {
    var container = document.getElementById('hargaSampahList');
    if (!container) return;
    
    var jenis = document.getElementById('hargaFilterJenis')?.value || 'plastik';
    var search = document.getElementById('hargaSearch')?.value?.toLowerCase() || '';
    var list = presetSampah[jenis] || [];
    
    var html = '';
    var count = 0;
    
    for (var i = 0; i < list.length; i++) {
        var nama = list[i];
        if (search && !nama.toLowerCase().includes(search)) continue;
        var harga = getHargaByNamaSampah(nama);
        
        html += '<div class="list-item" style="padding:6px 10px;">';
        html += '  <div style="font-size:10px;flex:1;">' + nama + '</div>';
        html += '  <div style="display:flex;align-items:center;gap:6px;">';
        html += '    <input type="number" id="harga_edit_' + i + '" value="' + harga + '" style="width:70px;padding:3px 5px;border:1px solid #e2e8f0;border-radius:4px;font-size:10px;" onchange="updateHargaSampah(\'' + nama + '\', this.value)">';
        html += '    <span style="font-size:9px;color:#64748b;">/kg</span>';
        html += '  </div>';
        html += '</div>';
        count++;
    }
    
    if (count === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-search"></i><p>Tidak ada data</p></div>';
    } else {
        container.innerHTML = html;
    }
}

function updateHargaSampah(nama, hargaBaru) {
    var harga = parseFloat(hargaBaru);
    if (isNaN(harga) || harga < 0) {
        showToast('Masukkan harga yang valid!', true);
        return;
    }
    
    // Update ke Supabase
    if (window.updateHargaSampahSupabase) {
        window.updateHargaSampahSupabase(nama, harga);
    } else {
        // Fallback lokal
        window.hargaSampahDetail[nama] = harga;
        showToast('Harga ' + nama + ' diupdate menjadi Rp ' + formatRupiah(harga), false);
    }
}

// =============================================
// DATA BSU
// =============================================

function renderDataBSU() {
    var container = document.getElementById('bsuDataList');
    if (!container) return;
    
    var filterBSU = document.getElementById('filterBSU')?.value || 'all';
    var filterRW = document.getElementById('filterRW')?.value || 'all';
    var filterRT = document.getElementById('filterRT')?.value || 'all';
    
    var bsuList = dataBSU;
    if (filterBSU !== 'all') {
        bsuList = bsuList.filter(function(b) { return b.id === filterBSU; });
    }
    if (filterRW !== 'all') {
        bsuList = bsuList.filter(function(b) { return b.rw === filterRW; });
    }
    if (filterRT !== 'all') {
        bsuList = bsuList.filter(function(b) { return b.rt === filterRT; });
    }
    
    updateFilterOptions();
    
    if (bsuList.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-building"></i><p>Tidak ada data BSU</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < bsuList.length; i++) {
        var bsu = bsuList[i];
        var transaksi = getTransaksiByBSU(bsu.id);
        var nasabahCount = getNasabahByBSU(bsu.id).length;
        var totalBerat = 0, totalNilai = 0, totalTransaksi = 0;
        var menunggu = 0, diverifikasi = 0, ditolak = 0;
        
        for (var j = 0; j < transaksi.length; j++) {
            var t = transaksi[j];
            totalBerat += t.berat;
            totalNilai += t.berat * t.hargaPerKg;
            totalTransaksi++;
            if (t.status === 'menunggu') menunggu++;
            else if (t.status === 'diverifikasi') diverifikasi++;
            else if (t.status === 'ditolak') ditolak++;
        }
        
        html += '<div class="list-item" style="flex-direction:column;align-items:stretch;">';
        html += '  <div style="display:flex;justify-content:space-between;align-items:center;">';
        html += '    <div>';
        html += '      <div style="font-size:12px;font-weight:700;">' + bsu.nama + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + bsu.rw + ' - ' + bsu.rt + ' | Ketua: ' + bsu.ketua + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">👤 Nasabah: ' + nasabahCount + ' orang</div>';
        html += '    </div>';
        html += '    <div style="text-align:right;">';
        html += '      <div style="font-size:11px;font-weight:700;color:#0d9488;">Rp ' + formatRupiah(totalNilai) + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + totalTransaksi + ' transaksi</div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div style="display:flex;gap:8px;font-size:9px;margin-top:4px;flex-wrap:wrap;">';
        html += '    <span><span class="badge badge-success">' + diverifikasi + ' Diverifikasi</span></span>';
        html += '    <span><span class="badge badge-pending">' + menunggu + ' Menunggu</span></span>';
        html += '    <span><span class="badge badge-danger">' + ditolak + ' Ditolak</span></span>';
        html += '    <span style="color:#64748b;">Berat: ' + totalBerat.toFixed(1) + ' kg</span>';
        html += '  </div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
    updateAdminSummary();
}

function updateFilterOptions() {
    var bsuSelect = document.getElementById('filterBSU');
    if (bsuSelect) {
        var currentBSU = bsuSelect.value;
        bsuSelect.innerHTML = '<option value="all">Semua BSU</option>';
        for (var i = 0; i < dataBSU.length; i++) {
            bsuSelect.innerHTML += '<option value="' + dataBSU[i].id + '">' + dataBSU[i].nama + '</option>';
        }
        bsuSelect.value = currentBSU;
    }
    
    var rwSelect = document.getElementById('filterRW');
    if (rwSelect) {
        var currentRW = rwSelect.value;
        var rws = getUniqueRW();
        rwSelect.innerHTML = '<option value="all">Semua RW</option>';
        for (var i = 0; i < rws.length; i++) {
            rwSelect.innerHTML += '<option value="' + rws[i] + '">' + rws[i] + '</option>';
        }
        rwSelect.value = currentRW;
    }
    
    var rtSelect = document.getElementById('filterRT');
    if (rtSelect) {
        var currentRT = rtSelect.value;
        var rw = document.getElementById('filterRW')?.value || 'all';
        var rts = getUniqueRT(rw === 'all' ? null : rw);
        rtSelect.innerHTML = '<option value="all">Semua RT</option>';
        for (var i = 0; i < rts.length; i++) {
            rtSelect.innerHTML += '<option value="' + rts[i] + '">' + rts[i] + '</option>';
        }
        rtSelect.value = currentRT;
    }
}

// =============================================
// DATA NASABAH ADMIN
// =============================================

function renderNasabahAdmin() {
    var container = document.getElementById('adminNasabahList');
    if (!container) return;
    
    var nasabahList = daftarNasabah;
    
    if (nasabahList.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-users-slash"></i><p>Belum ada nasabah terdaftar</p><p style="font-size:10px;color:#94a3b8;margin-top:4px;">💡 Silakan daftar akun nasabah terlebih dahulu</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < nasabahList.length; i++) {
        var n = nasabahList[i];
        var saldo = hitungSaldoNasabah(n.id);
        var transaksi = getTransaksiByNasabah(n.id);
        var diverifikasi = 0;
        
        for (var j = 0; j < transaksi.length; j++) {
            if (transaksi[j].status === 'diverifikasi') diverifikasi++;
        }
        
        var bsu = getBSUById(n.bsuId);
        var isManual = n.isManual || false;
        var avatarBg = isManual ? '#fef3c7' : '#dcfce7';
        var avatarColor = isManual ? '#d97706' : '#15803d';
        
        html += '<div class="list-item">';
        html += '  <div class="list-left">';
        html += '    <div class="avatar" style="width:28px;height:28px;font-size:10px;background:' + avatarBg + ';color:' + avatarColor + ';">' + n.nama.charAt(0) + '</div>';
        html += '    <div>';
        html += '      <div style="font-size:11px;font-weight:600;">' + n.nama + (isManual ? ' <span style="font-size:8px;color:#d97706;">(Manual)</span>' : '') + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + (bsu ? bsu.nama : '-') + ' | ' + n.rw + ' - ' + n.rt + '</div>';
        html += '      <div style="font-size:8px;color:#94a3b8;">Username: ' + (n.username || '-') + ' | ' + diverifikasi + ' transaksi</div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div style="text-align:right;">';
        html += '    <div style="font-size:11px;font-weight:700;color:#0d9488;">Rp ' + formatRupiah(saldo) + '</div>';
        html += '  </div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// =============================================
// SWITCH TAB - DENGAN BOTTOM NAV AKTIF
// =============================================

function switchAdminTab(tab) {
    adminTabAktif = tab;
    
    var buttons = document.querySelectorAll('.admin-dashboard .tab-btn');
    buttons.forEach(function(btn) { btn.classList.remove('active'); });
    var activeBtn = document.querySelector('.tab-btn[data-tab="admin-' + tab + '"]');
    if (activeBtn) activeBtn.classList.add('active');
    
    var navItems = document.querySelectorAll('.admin-dashboard .bottom-nav .nav-item');
    navItems.forEach(function(item) { item.classList.remove('active'); });
    
    var navMap = {
        'dashboard': 0,
        'verifikasi': 1,
        'harga': 1,
        'bsu': 2,
        'nasabah': 3,
        'laporan': 4
    };
    var index = navMap[tab] || 0;
    if (navItems[index]) navItems[index].classList.add('active');
    
    var contents = document.querySelectorAll('.admin-dashboard .tab-content');
    contents.forEach(function(content) { content.classList.remove('active'); });
    var activeContent = document.getElementById('admin-' + tab);
    if (activeContent) activeContent.classList.add('active');
    
    if (tab === 'dashboard') {
        renderDashboardCharts();
        renderTopNasabah();
        renderRingkasanJenisSampah();
        renderAdminStatistik();
    } else if (tab === 'verifikasi') {
        renderVerifikasiAdmin();
    } else if (tab === 'harga') {
        renderHargaSampah();
    } else if (tab === 'bsu') {
        renderDataBSU();
    } else if (tab === 'nasabah') {
        renderNasabahAdmin();
    } else if (tab === 'laporan') {
        updateFilterLaporan();
    }
}

// =============================================
// LAPORAN ADMIN
// =============================================

function updateFilterLaporan() {
    var select = document.getElementById('filterBSULaporan');
    if (select) {
        select.innerHTML = '<option value="all">Semua BSU</option>';
        for (var i = 0; i < dataBSU.length; i++) {
            select.innerHTML += '<option value="' + dataBSU[i].id + '">' + dataBSU[i].nama + '</option>';
        }
    }
}

function exportAdminLaporan(format) {
    var data = daftarSampah || [];
    var bsu = document.getElementById('filterBSULaporan')?.value || 'all';
    var periode = document.getElementById('filterPeriodeLaporan')?.value || 'mingguan';
    
    var now = new Date();
    var startDate = new Date(now);
    
    if (periode === 'mingguan') {
        startDate.setDate(now.getDate() - 7);
    } else if (periode === 'bulanan') {
        startDate.setMonth(now.getMonth() - 1);
    } else if (periode === 'tahunan') {
        startDate.setFullYear(now.getFullYear() - 1);
    } else if (periode === 'semua') {
        startDate = new Date(2000, 0, 1);
    }
    
    data = data.filter(function(item) {
        var itemDate = new Date(item.created_at || item.tanggal || item.createdAt);
        return itemDate >= startDate && itemDate <= now;
    });
    
    if (bsu !== 'all') {
        data = data.filter(function(item) {
            return item.bsuId === bsu || item.bsu_id === bsu || item.bsu === bsu;
        });
    }
    
    if (data.length === 0) {
        showToast('Tidak ada data untuk periode ini!', true);
        return;
    }
    
    var periodeLabel = periode === 'mingguan' ? 'Mingguan' : 
                       (periode === 'bulanan' ? 'Bulanan' : 
                       (periode === 'tahunan' ? 'Tahunan' : 'Semua'));
    var rekapData = generateRekapPerNasabahAdmin(data);
    
    if (format === 'excel' || format === 'full') {
        var html = generateAdminExcelHTML(rekapData, data, bsu, 'all', 'all', periodeLabel);
        downloadExcel(html, 'Laporan_Admin_' + periodeLabel + '.xls');
        showToast('Laporan Excel berhasil diekspor!', false);
    } else if (format === 'pdf') {
        var html = generateAdminPDFHTML(rekapData, data, bsu, 'all', 'all', periodeLabel);
        var printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
            showToast('Popup diblokir! Silakan izinkan popup.', true);
            return;
        }
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(function() { printWindow.focus(); printWindow.print(); }, 500);
        showToast('Laporan PDF siap dicetak', false);
    } else if (format === 'word') {
        var html = generateAdminWordHTML(rekapData, data, bsu, 'all', 'all', periodeLabel);
        downloadWord(html, 'Laporan_Admin_' + periodeLabel + '.doc');
        showToast('Laporan Word berhasil diekspor!', false);
    }
}

function exportAdminNasabahRekap() {
    if (daftarSampah.length === 0) {
        showToast('Tidak ada data untuk diekspor!', true);
        return;
    }
    
    var nasabahMap = {};
    for (var i = 0; i < daftarSampah.length; i++) {
        var item = daftarSampah[i];
        var nama = item.namaNasabah || '-';
        if (nama === '-' || nama === 'undefined' || nama === 'null') continue;
        if (!nasabahMap[nama]) {
            nasabahMap[nama] = {
                nama: nama,
                totalBerat: 0,
                totalNilai: 0,
                totalTransaksi: 0,
                bsu: item.bsu || '-',
                rw: item.rw || '-',
                rt: item.rt || '-'
            };
        }
        var nilai = item.berat * item.hargaPerKg;
        nasabahMap[nama].totalBerat += item.berat;
        nasabahMap[nama].totalNilai += nilai;
        nasabahMap[nama].totalTransaksi++;
    }
    
    var rekapData = Object.values(nasabahMap);
    rekapData.sort(function(a, b) { return b.totalNilai - a.totalNilai; });
    
    var html = generateAdminExcelHTML(rekapData, daftarSampah, 'all', 'all', 'all', 'Rekap Nasabah');
    downloadExcel(html, 'Rekap_Semua_Nasabah.xls');
    showToast('Rekap nasabah berhasil diekspor!', false);
}

// =============================================
// EXPORT KE GLOBAL
// =============================================
window.renderAdmin = renderAdmin;
window.renderVerifikasiAdmin = renderVerifikasiAdmin;
window.renderHargaSampah = renderHargaSampah;
window.renderDataBSU = renderDataBSU;
window.renderNasabahAdmin = renderNasabahAdmin;
window.renderAdminStatistik = renderAdminStatistik;
window.renderDashboardCharts = renderDashboardCharts;
window.renderTopNasabah = renderTopNasabah;
window.renderRingkasanJenisSampah = renderRingkasanJenisSampah;
window.updateAdminSummary = updateAdminSummary;
window.switchAdminTab = switchAdminTab;
window.verifikasiSampah = verifikasiSampah;
window.updateHargaSampah = updateHargaSampah;
window.updateFilterOptions = updateFilterOptions;
window.exportAdminLaporan = exportAdminLaporan;
window.exportAdminNasabahRekap = exportAdminNasabahRekap;
window.updateFilterLaporan = updateFilterLaporan;

console.log('✅ Dashboard Admin loaded with Charts');
console.log('👤 Total Nasabah terdaftar:', daftarNasabah.length);