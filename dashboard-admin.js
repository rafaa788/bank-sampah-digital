// dashboard-admin.js
// =====================================================
// DASHBOARD ADMIN - REALTIME DENGAN FOTO VERIFIKASI
// RESPONSIF HP - FOTO BISA DIKLIK UNTUK DIPERBESAR
// =====================================================

var adminTabAktif = 'dashboard';
var adminRealtimeChannels = [];
var adminRealtimeSetup = false;

// Chart instances
var statusChartInstance = null;
var bsuChartInstance = null;
var trendChartInstance = null;

// =============================================
// RENDER ADMIN
// =============================================

function renderAdmin() {
    console.log('🔄 Render Admin Dashboard');
    
    if (window.syncAllData) {
        window.syncAllData().then(function() {
            renderAllAdmin();
        });
    } else {
        renderAllAdmin();
    }
    
    if (!adminRealtimeSetup) {
        setupAdminRealtime();
    }
}

function renderAllAdmin() {
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
// DASHBOARD CHARTS
// =============================================

function renderDashboardCharts() {
    renderStatusChart();
    renderBSUChart();
    renderTrendChart();
}

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
    
    if (statusChartInstance) statusChartInstance.destroy();
    
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
                    labels: { padding: 8, font: { size: 9 }, boxWidth: 10, usePointStyle: true }
                }
            },
            cutout: '65%'
        }
    });
}

function renderBSUChart() {
    var bsuData = window.dataBSU || [];
    var labels = [], values = [];
    var colors = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1', '#ec4899'];
    
    var bsuTransaksi = [];
    for (var i = 0; i < bsuData.length; i++) {
        var bsu = bsuData[i];
        var transaksi = getTransaksiByBSU(bsu.id);
        var diverifikasi = 0;
        for (var j = 0; j < transaksi.length; j++) {
            if (transaksi[j].status === 'diverifikasi') diverifikasi++;
        }
        if (diverifikasi > 0) {
            bsuTransaksi.push({ nama: bsu.nama, total: diverifikasi });
        }
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
    
    if (bsuChartInstance) bsuChartInstance.destroy();
    
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
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { font: { size: 8 }, stepSize: 1 } },
                x: { ticks: { font: { size: 7 } } }
            }
        }
    });
}

function renderTrendChart() {
    var transaksi = window.daftarSampah || [];
    var months = [], values = [];
    var now = new Date();
    
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
            if (item.status === 'diverifikasi' && itemDate >= monthStart && itemDate < monthEnd) {
                count++;
            }
        }
        values.push(count);
    }
    
    var ctx = document.getElementById('trendChart')?.getContext('2d');
    if (!ctx) return;
    
    if (trendChartInstance) trendChartInstance.destroy();
    
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
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { font: { size: 8 }, stepSize: 1 } },
                x: { ticks: { font: { size: 8 } } }
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
            nasabahData.push({ nama: n.nama, saldo: saldo, id: n.id, isManual: n.isManual || false });
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
        if (jenis === 'plastik') totalPlastik += item.berat || 0;
        else if (jenis === 'logam') totalLogam += item.berat || 0;
        else if (jenis === 'kertas') totalKertas += item.berat || 0;
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

function updateAdminSummary() {
    var totalSaldo = 0;
    var nasabahList = window.daftarNasabah || [];
    for (var i = 0; i < nasabahList.length; i++) {
        totalSaldo += hitungSaldoNasabah(nasabahList[i].id);
    }
    document.getElementById('adminSaldoGlobal').textContent = 'Rp ' + formatRupiah(totalSaldo);
}

// =============================================
// VERIFIKASI - RESPONSIF HP + FOTO BISA DIKLIK
// =============================================

function renderVerifikasiAdmin() {
    var container = document.getElementById('adminVerifikasiList');
    if (!container) return;
    
    var semuaTransaksi = window.daftarSampah || [];
    console.log('📋 Total transaksi di cache:', semuaTransaksi.length);
    
    var statusFilter = document.getElementById('adminStatusFilter')?.value || 'menunggu';
    var daftarTampil = statusFilter === 'all' ? semuaTransaksi : semuaTransaksi.filter(function(item) {
        return item.status === statusFilter;
    });
    
    var menunggu = semuaTransaksi.filter(function(item) {
        return item.status === 'menunggu';
    });
    
    console.log('⏳ Menunggu verifikasi:', menunggu.length);
    
    var countEl = document.getElementById('adminVerifikasiCount');
    if (countEl) countEl.textContent = 'Menunggu: ' + menunggu.length;
    
    if (daftarTampil.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-inbox"></i><p>Tidak ada data pada status ini</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < daftarTampil.length; i++) {
        var item = daftarTampil[i];
        var harga = item.harga_per_kg || item.hargaPerKg || 0;
        var nilai = (item.berat || 0) * harga;
        var nasabah = getNasabahById(item.nasabah_id) || getNasabahById(item.nasabahId);
        
        var hasFotoTimbang = item.foto_timbang && item.foto_timbang !== 'null' && item.foto_timbang !== '';
        var hasFotoHasil = item.foto_hasil && item.foto_hasil !== 'null' && item.foto_hasil !== '';
        var hasFotoBukti = item.foto_bukti && item.foto_bukti !== 'null' && item.foto_bukti !== '';
        
        var fotoCount = 0;
        if (hasFotoTimbang) fotoCount++;
        if (hasFotoHasil) fotoCount++;
        if (hasFotoBukti) fotoCount++;
        
        var statusLabel = item.status === 'diverifikasi' ? 'Diterima' :
            (item.status === 'ditolak' ? 'Ditolak' : 'Menunggu');
        var statusClass = item.status === 'diverifikasi' ? 'badge-success' :
            (item.status === 'ditolak' ? 'badge-danger' : 'badge-pending');
        
        html += '<div class="list-item" style="flex-direction:column;align-items:stretch;margin-bottom:12px;padding:12px;border:1px solid #e2e8f0;border-radius:10px;background:white;">';
        
        // ===== HEADER =====
        html += '  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;flex-wrap:wrap;gap:6px;">';
        html += '    <div class="list-left" style="align-items:flex-start;flex:1;min-width:0;">';
        html += '      <div class="avatar" style="width:32px;height:32px;font-size:12px;background:#fef3c7;color:#d97706;display:flex;align-items:center;justify-content:center;border-radius:50%;flex-shrink:0;">' + (nasabah ? nasabah.nama.charAt(0).toUpperCase() : '?') + '</div>';
        html += '      <div style="min-width:0;flex:1;">';
        html += '        <div style="font-size:13px;font-weight:700;color:#1e293b;word-break:break-word;">' + (nasabah ? nasabah.nama : (item.nama_nasabah || 'Unknown')) + '</div>';
        html += '        <div style="font-size:9px;color:#64748b;word-break:break-word;">' + (item.bsu || '-') + ' | ' + (item.rw || '-') + ' - ' + (item.rt || '-') + '</div>';
        html += '        <div style="font-size:8px;color:#94a3b8;margin-top:1px;">Ketua: ' + (item.ketua || '-') + ' | 📅 ' + (item.tanggal || '-') + '</div>';
        html += '        <div style="font-size:8px;color:#94a3b8;margin-top:1px;display:flex;flex-wrap:wrap;gap:4px;">';
        if (hasFotoTimbang) html += '<span style="background:#dbeafe;padding:0 6px;border-radius:3px;">📷</span>';
        if (hasFotoHasil) html += '<span style="background:#dbeafe;padding:0 6px;border-radius:3px;">📸</span>';
        if (hasFotoBukti) html += '<span style="background:#dbeafe;padding:0 6px;border-radius:3px;">📋</span>';
        if (fotoCount === 0) html += '<span style="color:#94a3b8;">Tidak ada foto</span>';
        html += '</div>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div style="text-align:right;flex-shrink:0;">';
        html += '      <div style="font-size:13px;font-weight:700;color:#0d9488;">Rp ' + formatRupiah(nilai) + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + (item.berat || 0) + ' kg</div>';
        html += '      <span class="badge ' + statusClass + '" style="font-size:8px;padding:2px 8px;">' + statusLabel + '</span>';
        html += '    </div>';
        html += '  </div>';
        
        // ===== INFO SAMPAH =====
        html += '  <div style="font-size:9px;color:#475569;padding:4px 8px;background:#f1f5f9;border-radius:4px;margin-bottom:8px;word-break:break-word;">';
        html += '    <strong>🗑️ Sampah:</strong> ' + (item.nama || '-');
        html += '    <span style="margin-left:8px;"><strong>Jenis:</strong> ' + (item.jenis || 'nonorganik') + '</span>';
        html += '  </div>';
        
        // ===== FOTO BUKTI (3 KOLOM - RESPONSIF HP) =====
        if (hasFotoTimbang || hasFotoHasil || hasFotoBukti) {
            html += '  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:10px;">';
            
            // FOTO TIMBANG
            html += '    <div style="background:#f8fafc;border-radius:6px;padding:4px;text-align:center;border:1px solid #e2e8f0;">';
            html += '      <div style="font-size:7px;font-weight:600;color:#64748b;margin-bottom:2px;">📷 Timbang</div>';
            if (hasFotoTimbang) {
                html += '      <img src="' + item.foto_timbang + '" style="width:100%;max-height:80px;object-fit:contain;border-radius:4px;border:1px solid #e2e8f0;background:white;cursor:pointer;" onclick="openFotoModal(\'' + item.foto_timbang + '\', \'📷 Foto Timbang - ' + (nasabah ? nasabah.nama : '') + '\')" onerror="this.parentElement.innerHTML=\'<div style=padding:10px;color:#94a3b8;font-size:8px;>❌</div>\'" title="Klik untuk perbesar">';
            } else {
                html += '      <div style="padding:15px;color:#94a3b8;font-size:8px;">-</div>';
            }
            html += '    </div>';
            
            // FOTO HASIL
            html += '    <div style="background:#f8fafc;border-radius:6px;padding:4px;text-align:center;border:1px solid #e2e8f0;">';
            html += '      <div style="font-size:7px;font-weight:600;color:#64748b;margin-bottom:2px;">📸 Hasil</div>';
            if (hasFotoHasil) {
                html += '      <img src="' + item.foto_hasil + '" style="width:100%;max-height:80px;object-fit:contain;border-radius:4px;border:1px solid #e2e8f0;background:white;cursor:pointer;" onclick="openFotoModal(\'' + item.foto_hasil + '\', \'📸 Foto Hasil - ' + (nasabah ? nasabah.nama : '') + '\')" onerror="this.parentElement.innerHTML=\'<div style=padding:10px;color:#94a3b8;font-size:8px;>❌</div>\'" title="Klik untuk perbesar">';
            } else {
                html += '      <div style="padding:15px;color:#94a3b8;font-size:8px;">-</div>';
            }
            html += '    </div>';
            
            // FOTO BUKTI
            html += '    <div style="background:#f8fafc;border-radius:6px;padding:4px;text-align:center;border:1px solid #e2e8f0;">';
            html += '      <div style="font-size:7px;font-weight:600;color:#64748b;margin-bottom:2px;">📋 Bukti</div>';
            if (hasFotoBukti) {
                html += '      <img src="' + item.foto_bukti + '" style="width:100%;max-height:80px;object-fit:contain;border-radius:4px;border:1px solid #e2e8f0;background:white;cursor:pointer;" onclick="openFotoModal(\'' + item.foto_bukti + '\', \'📋 Foto Bukti - ' + (nasabah ? nasabah.nama : '') + '\')" onerror="this.parentElement.innerHTML=\'<div style=padding:10px;color:#94a3b8;font-size:8px;>❌</div>\'" title="Klik untuk perbesar">';
            } else {
                html += '      <div style="padding:15px;color:#94a3b8;font-size:8px;">-</div>';
            }
            html += '    </div>';
            
            html += '  </div>';
        }
        
        // ===== TOMBOL AKSI =====
        html += '  <div style="display:flex;gap:6px;justify-content:flex-end;border-top:1px solid #f1f5f9;padding-top:8px;flex-wrap:wrap;">';
        if (item.status === 'menunggu') {
            html += '    <button class="btn-verifikasi terima" onclick="verifikasiSampah(\'' + item.id + '\',\'diverifikasi\')" style="padding:4px 12px;border:none;border-radius:4px;font-size:10px;font-weight:600;cursor:pointer;background:#16a34a;color:white;display:flex;align-items:center;gap:3px;">';
            html += '      <i class="fa-solid fa-check"></i> Terima';
            html += '    </button>';
            html += '    <button class="btn-verifikasi tolak" onclick="verifikasiSampah(\'' + item.id + '\',\'ditolak\')" style="padding:4px 12px;border:none;border-radius:4px;font-size:10px;font-weight:600;cursor:pointer;background:#dc2626;color:white;display:flex;align-items:center;gap:3px;">';
            html += '      <i class="fa-solid fa-xmark"></i> Tolak';
            html += '    </button>';
        }
        html += '    <button class="btn-verifikasi detail" onclick="showDetailVerifikasi(\'' + item.id + '\')" style="padding:4px 12px;border:none;border-radius:4px;font-size:10px;font-weight:600;cursor:pointer;background:#3b82f6;color:white;display:flex;align-items:center;gap:3px;">';
        html += '      <i class="fa-solid fa-eye"></i> Detail';
        html += '    </button>';
        html += '  </div>';
        
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// =============================================
// OPEN FOTO MODAL - UNTUK MELIHAT FOTO BESAR
// =============================================

function openFotoModal(src, title) {
    var html = `
        <div id="modalFoto" class="modal-foto-overlay" style="display:flex;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);z-index:99999;justify-content:center;align-items:center;padding:20px;" onclick="if(event.target===this) this.style.display='none'">
            <div style="max-width:95%;max-height:95%;position:relative;">
                <button onclick="document.getElementById('modalFoto').style.display='none'" style="position:absolute;top:-40px;right:0;background:none;border:none;color:white;font-size:28px;cursor:pointer;z-index:10;">&times;</button>
                ${title ? '<div style="color:white;font-size:14px;font-weight:600;text-align:center;margin-bottom:10px;text-shadow:0 2px 4px rgba(0,0,0,0.5);">' + title + '</div>' : ''}
                <img src="${src}" style="max-width:100%;max-height:90vh;object-fit:contain;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,0.5);" onclick="event.stopPropagation();">
                <div style="color:rgba(255,255,255,0.6);font-size:11px;text-align:center;margin-top:8px;">Klik di luar gambar untuk menutup</div>
            </div>
        </div>
    `;
    
    var oldModal = document.getElementById('modalFoto');
    if (oldModal) oldModal.remove();
    
    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild);
}

// =============================================
// SHOW DETAIL VERIFIKASI (MODAL DENGAN FOTO)
// =============================================

function showDetailVerifikasi(id) {
    var transaksi = window.daftarSampah || [];
    var item = null;
    for (var i = 0; i < transaksi.length; i++) {
        if (transaksi[i].id === id) {
            item = transaksi[i];
            break;
        }
    }
    
    if (!item) {
        showToast('Data transaksi tidak ditemukan!', true);
        return;
    }
    
    var harga = item.harga_per_kg || item.hargaPerKg || 0;
    var nilai = (item.berat || 0) * harga;
    var nasabah = getNasabahById(item.nasabah_id) || getNasabahById(item.nasabahId);
    
    var hasFotoTimbang = item.foto_timbang && item.foto_timbang !== 'null' && item.foto_timbang !== '';
    var hasFotoHasil = item.foto_hasil && item.foto_hasil !== 'null' && item.foto_hasil !== '';
    var hasFotoBukti = item.foto_bukti && item.foto_bukti !== 'null' && item.foto_bukti !== '';
    
    var html = `
        <div id="modalDetailVerifikasi" class="modal-overlay" style="display:flex;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:99999;justify-content:center;align-items:center;padding:16px;" onclick="if(event.target===this) this.style.display='none'">
            <div class="modal-content" style="max-width:600px;width:100%;max-height:90vh;overflow-y:auto;background:white;border-radius:12px;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
                <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:10px;margin-bottom:12px;">
                    <h3 style="font-size:15px;font-weight:700;color:#1e293b;margin:0;">
                        <i class="fa-solid fa-receipt" style="color:#0d9488;"></i> Detail Transaksi
                    </h3>
                    <button class="modal-close" onclick="document.getElementById('modalDetailVerifikasi').style.display='none'" style="background:none;border:none;font-size:22px;cursor:pointer;color:#94a3b8;">&times;</button>
                </div>
                
                <div class="modal-body">
                    <!-- Info Nasabah -->
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:6px;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <div style="width:40px;height:40px;border-radius:50%;background:#fef3c7;color:#d97706;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;flex-shrink:0;">
                                ${nasabah ? nasabah.nama.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                                <div style="font-size:14px;font-weight:700;color:#1e293b;">${nasabah ? nasabah.nama : (item.nama_nasabah || 'Unknown')}</div>
                                <div style="font-size:10px;color:#64748b;">${item.bsu || '-'} | ${item.rw || '-'} - ${item.rt || '-'}</div>
                                <div style="font-size:9px;color:#94a3b8;">Ketua: ${item.ketua || '-'}</div>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:16px;font-weight:700;color:#0d9488;">Rp ${formatRupiah(nilai)}</div>
                            <div style="font-size:10px;color:#64748b;">${item.berat || 0} kg</div>
                            <span class="badge badge-pending" style="font-size:9px;padding:2px 10px;">⏳ Menunggu</span>
                        </div>
                    </div>
                    
                    <!-- Info Sampah -->
                    <div style="background:#f1f5f9;padding:8px 12px;border-radius:6px;margin-bottom:12px;font-size:11px;">
                        <strong>🗑️ Sampah:</strong> ${item.nama || '-'} 
                        <span style="margin-left:10px;"><strong>Jenis:</strong> ${item.jenis || 'nonorganik'}</span>
                        <span style="margin-left:10px;"><strong>📅:</strong> ${item.tanggal || '-'}</span>
                    </div>
                    
                    <!-- FOTO BUKTI (3 KOLOM) -->
                    <div style="margin-bottom:12px;">
                        <div style="font-size:11px;font-weight:600;color:#1e293b;margin-bottom:6px;">📸 Foto Bukti</div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">
                            <!-- Foto Timbang -->
                            <div style="background:#f8fafc;border-radius:6px;padding:6px;text-align:center;border:1px solid #e2e8f0;">
                                <div style="font-size:8px;font-weight:600;color:#64748b;margin-bottom:4px;">📷 Timbang</div>
                                ${hasFotoTimbang ? 
                                    `<img src="${item.foto_timbang}" style="width:100%;max-height:150px;object-fit:contain;border-radius:4px;border:1px solid #e2e8f0;background:white;cursor:pointer;" onclick="openFotoModal('${item.foto_timbang}', '📷 Foto Timbang - ${nasabah ? nasabah.nama : ''}')" onerror="this.parentElement.innerHTML='<div style=padding:15px;color:#94a3b8;font-size:10px;>❌</div>'">` : 
                                    `<div style="padding:20px;color:#94a3b8;font-size:10px;">-</div>`
                                }
                            </div>
                            
                            <!-- Foto Hasil -->
                            <div style="background:#f8fafc;border-radius:6px;padding:6px;text-align:center;border:1px solid #e2e8f0;">
                                <div style="font-size:8px;font-weight:600;color:#64748b;margin-bottom:4px;">📸 Hasil</div>
                                ${hasFotoHasil ? 
                                    `<img src="${item.foto_hasil}" style="width:100%;max-height:150px;object-fit:contain;border-radius:4px;border:1px solid #e2e8f0;background:white;cursor:pointer;" onclick="openFotoModal('${item.foto_hasil}', '📸 Foto Hasil - ${nasabah ? nasabah.nama : ''}')" onerror="this.parentElement.innerHTML='<div style=padding:15px;color:#94a3b8;font-size:10px;>❌</div>'">` : 
                                    `<div style="padding:20px;color:#94a3b8;font-size:10px;">-</div>`
                                }
                            </div>
                            
                            <!-- Foto Bukti -->
                            <div style="background:#f8fafc;border-radius:6px;padding:6px;text-align:center;border:1px solid #e2e8f0;">
                                <div style="font-size:8px;font-weight:600;color:#64748b;margin-bottom:4px;">📋 Bukti</div>
                                ${hasFotoBukti ? 
                                    `<img src="${item.foto_bukti}" style="width:100%;max-height:150px;object-fit:contain;border-radius:4px;border:1px solid #e2e8f0;background:white;cursor:pointer;" onclick="openFotoModal('${item.foto_bukti}', '📋 Foto Bukti - ${nasabah ? nasabah.nama : ''}')" onerror="this.parentElement.innerHTML='<div style=padding:15px;color:#94a3b8;font-size:10px;>❌</div>'">` : 
                                    `<div style="padding:20px;color:#94a3b8;font-size:10px;">-</div>`
                                }
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tombol Aksi -->
                    <div style="display:flex;gap:8px;justify-content:flex-end;border-top:1px solid #e2e8f0;padding-top:12px;flex-wrap:wrap;">
                        <button onclick="document.getElementById('modalDetailVerifikasi').style.display='none'" style="padding:6px 16px;border:1px solid #e2e8f0;border-radius:4px;background:white;color:#64748b;font-size:11px;font-weight:600;cursor:pointer;">
                            Tutup
                        </button>
                        ${item.status === 'menunggu' ? `
                        <button onclick="verifikasiSampah('${item.id}','diverifikasi');document.getElementById('modalDetailVerifikasi').style.display='none'" style="padding:6px 16px;border:none;border-radius:4px;background:#16a34a;color:white;font-size:11px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;">
                            <i class="fa-solid fa-check"></i> Terima
                        </button>
                        <button onclick="verifikasiSampah('${item.id}','ditolak');document.getElementById('modalDetailVerifikasi').style.display='none'" style="padding:6px 16px;border:none;border-radius:4px;background:#dc2626;color:white;font-size:11px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;">
                            <i class="fa-solid fa-xmark"></i> Tolak
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    var oldModal = document.getElementById('modalDetailVerifikasi');
    if (oldModal) oldModal.remove();
    
    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild);
}

// =============================================
// VERIFIKASI SAMPAH
// =============================================

async function verifikasiSampah(id, status) {
    console.log('🔍 Verifikasi sampah:', id, '->', status);
    showLoading(true);
    
    try {
        var updated = await updateStatusTransaksi(id, status);
        console.log('📦 Hasil update:', updated);
        
        if (updated) {
            var data = window.daftarSampah || [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].id === id) {
                    data[i].status = status;
                    data[i].updated_at = new Date().toISOString();
                    break;
                }
            }
            
            if (window._onTransaksiChange) {
                window._onTransaksiChange({ eventType: 'UPDATE', new: updated });
            }
            
            var message = status === 'diverifikasi' ? '✅ Data sampah diverifikasi!' : '❌ Data sampah ditolak!';
            showToast(message, false);
            
            renderVerifikasiAdmin();
            renderDataBSU();
            renderNasabahAdmin();
            updateAdminSummary();
            renderAdminStatistik();
            renderDashboardCharts();
            renderTopNasabah();
            renderRingkasanJenisSampah();
        } else {
            showToast('⚠️ Gagal memperbarui status! Coba refresh.', true);
        }
    } catch (e) {
        console.error('❌ Error verifikasi:', e);
        showToast('⚠️ Error: ' + e.message, true);
    } finally {
        showLoading(false);
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
    
    if (window.updateHargaSampahSupabase) {
        window.updateHargaSampahSupabase(nama, harga);
    } else {
        window.hargaSampahDetail[nama] = harga;
        showToast('Harga ' + nama + ' diupdate menjadi Rp ' + formatRupiah(harga), false);
    }
    renderHargaSampah();
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
    
    var bsuList = window.dataBSU || [];
    if (filterBSU !== 'all') bsuList = bsuList.filter(function(b) { return b.id === filterBSU; });
    if (filterRW !== 'all') bsuList = bsuList.filter(function(b) { return b.rw === filterRW; });
    if (filterRT !== 'all') bsuList = bsuList.filter(function(b) { return b.rt === filterRT; });
    
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
            var harga = t.harga_per_kg || t.hargaPerKg || 0;
            var berat = t.berat || 0;
            totalBerat += berat;
            totalNilai += berat * harga;
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
        var bsuData = window.dataBSU || [];
        for (var i = 0; i < bsuData.length; i++) {
            bsuSelect.innerHTML += '<option value="' + bsuData[i].id + '">' + bsuData[i].nama + '</option>';
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
    
    var nasabahList = window.daftarNasabah || [];
    
    if (nasabahList.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-users-slash"></i><p>Belum ada nasabah terdaftar</p></div>';
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
        
        var bsu = getBSUById(n.bsu_id);
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
// SWITCH TAB
// =============================================

function switchAdminTab(tab) {
    adminTabAktif = tab;
    
    var buttons = document.querySelectorAll('.admin-dashboard .tab-btn');
    buttons.forEach(function(btn) { btn.classList.remove('active'); });
    var activeBtn = document.querySelector('.tab-btn[data-tab="admin-' + tab + '"]');
    if (activeBtn) activeBtn.classList.add('active');
    
    var navItems = document.querySelectorAll('.admin-dashboard .bottom-nav .nav-item');
    navItems.forEach(function(item) { item.classList.remove('active'); });
    
    var navMap = { 'dashboard': 0, 'verifikasi': 1, 'harga': 1, 'bsu': 2, 'nasabah': 3, 'laporan': 4 };
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
        var bsuData = window.dataBSU || [];
        for (var i = 0; i < bsuData.length; i++) {
            select.innerHTML += '<option value="' + bsuData[i].id + '">' + bsuData[i].nama + '</option>';
        }
    }
}

function exportAdminLaporan(format) {
    var data = window.daftarSampah || [];
    var bsu = document.getElementById('filterBSULaporan')?.value || 'all';
    var periode = document.getElementById('filterPeriodeLaporan')?.value || 'mingguan';
    
    var now = new Date();
    var startDate = new Date(now);
    
    if (periode === 'mingguan') startDate.setDate(now.getDate() - 7);
    else if (periode === 'bulanan') startDate.setMonth(now.getMonth() - 1);
    else if (periode === 'tahunan') startDate.setFullYear(now.getFullYear() - 1);
    else if (periode === 'semua') startDate = new Date(2000, 0, 1);
    
    data = data.filter(function(item) {
        var itemDate = new Date(item.created_at || item.tanggal || item.createdAt);
        return itemDate >= startDate && itemDate <= now;
    });
    
    if (bsu !== 'all') {
        data = data.filter(function(item) {
            return item.bsu_id === bsu || item.bsuId === bsu || item.bsu === bsu;
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
    var data = window.daftarSampah || [];
    if (data.length === 0) {
        showToast('Tidak ada data untuk diekspor!', true);
        return;
    }
    
    var nasabahMap = {};
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var nama = item.nama_nasabah || item.namaNasabah || '-';
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
        var harga = item.harga_per_kg || item.hargaPerKg || 0;
        var nilai = (item.berat || 0) * harga;
        nasabahMap[nama].totalBerat += item.berat || 0;
        nasabahMap[nama].totalNilai += nilai;
        nasabahMap[nama].totalTransaksi++;
    }
    
    var rekapData = Object.values(nasabahMap);
    rekapData.sort(function(a, b) { return b.totalNilai - a.totalNilai; });
    
    var html = generateAdminExcelHTML(rekapData, data, 'all', 'all', 'all', 'Rekap Nasabah');
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
window.showDetailVerifikasi = showDetailVerifikasi;
window.openFotoModal = openFotoModal;

console.log('✅ Dashboard Admin loaded - Responsif HP + Foto Bisa Dilihat');

// =============================================
// AUTO REFRESH SETUP
// =============================================

function setupAdminRealtime() {
    if (adminRealtimeSetup) return;
    
    if (window.removeAllChannels) {
        window.removeAllChannels(adminRealtimeChannels);
    }
    adminRealtimeChannels = [];
    
    function refreshAdmin() {
        console.log('🔄 Auto refresh admin dashboard...');
        if (window.syncAllData) {
            window.syncAllData().then(function() {
                renderAllAdmin();
            });
        } else {
            renderAllAdmin();
        }
    }
    
    if (window.setupAllRealtime) {
        window.setupAllRealtime({
            onTransaksiChange: refreshAdmin,
            onNasabahChange: refreshAdmin,
            onHargaChange: refreshAdmin,
            onBSUChange: refreshAdmin
        }).then(function(channels) {
            adminRealtimeChannels = channels;
            adminRealtimeSetup = true;
            console.log('✅ Admin real-time active!');
        });
    }
}

// Auto refresh setiap 10 detik (fallback)
setInterval(function() {
    if (window.syncAllData) {
        window.syncAllData().then(function() {
            if (document.querySelector('.admin-dashboard')) {
                renderAllAdmin();
            }
        });
    }
}, 10000);