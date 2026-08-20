// app-admin.js
// =====================================================
// APLIKASI ADMIN
// =====================================================

// Admin aktif
var adminAktif = {
    nama: 'Admin Sistem'
};

// Tab aktif admin
var adminTabAktif = 'verifikasi';

// Filter admin
var filterAdmin = {
    bsu: 'all',
    rw: 'all',
    rt: 'all',
    periode: 'mingguan'
};

// Fungsi render admin
function renderAdmin() {
    renderVerifikasiAdmin();
    renderHargaSampah();
    renderDataBSU();
    renderNasabahAdmin();
}

// =====================================================
// VERIFIKASI
// =====================================================
function renderVerifikasiAdmin() {
    var container = document.getElementById('adminVerifikasiList');
    var menunggu = getTransaksiByStatus('menunggu');
    
    document.getElementById('adminVerifikasiCount').textContent = 'Menunggu: ' + menunggu.length;
    
    if (menunggu.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#94a3b8;font-size:12px;padding:20px;">Tidak ada data menunggu verifikasi</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < menunggu.length; i++) {
        var item = menunggu[i];
        var nilai = item.berat * item.hargaPerKg;
        
        html += '<div class="list-item" style="flex-direction:column;align-items:stretch;">';
        html += '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">';
        html += '    <div class="list-left">';
        html += '      <div class="avatar" style="width:28px;height:28px;font-size:10px;">' + item.namaNasabah.charAt(0) + '</div>';
        html += '      <div>';
        html += '        <div style="font-size:11px;font-weight:600;">' + item.namaNasabah + '</div>';
        html += '        <div style="font-size:9px;color:#64748b;">' + item.bsu + ' | ' + item.rw + ' - ' + item.rt + ' | ' + item.tanggal + '</div>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div style="text-align:right;">';
        html += '      <div style="font-size:11px;font-weight:600;">Rp ' + formatRupiah(nilai) + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + item.berat + ' kg</div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div style="font-size:10px;color:#475569;padding:4px 8px;background:#f1f5f9;border-radius:4px;margin-bottom:6px;">';
        html += '    <strong>Sampah:</strong> ' + item.nama;
        html += '  </div>';
        html += '  <div style="display:flex;gap:6px;justify-content:flex-end;">';
        html += '    <button class="btn-verifikasi terima" onclick="verifikasiSampah(\'' + item.id + '\',\'diverifikasi\')"><i class="fa-solid fa-check"></i> Terima</button>';
        html += '    <button class="btn-verifikasi tolak" onclick="verifikasiSampah(\'' + item.id + '\',\'ditolak\')"><i class="fa-solid fa-xmark"></i> Tolak</button>';
        html += '  </div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Fungsi verifikasi sampah
function verifikasiSampah(id, status) {
    var item = updateStatusTransaksi(id, status);
    if (item) {
        showToast('Data sampah ' + (status === 'diverifikasi' ? 'diverifikasi' : 'ditolak'), false);
        renderVerifikasiAdmin();
        renderDataBSU();
        renderNasabahAdmin();
        // Update dashboard admin
        updateAdminSummary();
    }
}

// =====================================================
// HARGA SAMPAH
// =====================================================
function renderHargaSampah() {
    var container = document.getElementById('hargaSampahList');
    var jenis = document.getElementById('hargaFilterJenis').value;
    var search = document.getElementById('hargaSearch').value.toLowerCase();
    var list = presetSampah[jenis] || [];
    
    var html = '';
    var count = 0;
    
    for (var i = 0; i < list.length; i++) {
        var nama = list[i];
        if (search && !nama.toLowerCase().includes(search)) continue;
        var harga = hargaSampahDetail[nama] || defaultHargaPerKategori[jenis] || 0;
        
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
        container.innerHTML = '<div style="text-align:center;color:#94a3b8;font-size:12px;padding:20px;">Tidak ada data</div>';
    } else {
        container.innerHTML = html;
    }
}

// Fungsi update harga sampah
function updateHargaSampah(nama, hargaBaru) {
    var harga = parseFloat(hargaBaru);
    if (isNaN(harga) || harga < 0) {
        showToast('Masukkan harga yang valid!', true);
        return;
    }
    hargaSampahDetail[nama] = harga;
    showToast('Harga ' + nama + ' diupdate menjadi Rp ' + formatRupiah(harga), false);
}

// =====================================================
// DATA BSU
// =====================================================
function renderDataBSU() {
    var container = document.getElementById('bsuDataList');
    var filterBSU = document.getElementById('filterBSU').value;
    var filterRW = document.getElementById('filterRW').value;
    var filterRT = document.getElementById('filterRT').value;
    var filterPeriode = document.getElementById('filterPeriode').value;
    
    // Update filter admin
    filterAdmin.bsu = filterBSU;
    filterAdmin.rw = filterRW;
    filterAdmin.rt = filterRT;
    filterAdmin.periode = filterPeriode;
    
    // Filter data BSU
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
    
    // Update filter options
    updateFilterOptions();
    
    if (bsuList.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#94a3b8;font-size:12px;padding:20px;">Tidak ada data BSU</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < bsuList.length; i++) {
        var bsu = bsuList[i];
        var transaksi = getTransaksiByBSU(bsu.id);
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
        html += '    </div>';
        html += '    <div style="text-align:right;">';
        html += '      <div style="font-size:11px;font-weight:700;color:#0d9488;">Rp ' + formatRupiah(totalNilai) + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + totalTransaksi + ' transaksi</div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div style="display:flex;gap:8px;font-size:9px;margin-top:4px;">';
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

// Fungsi update filter options
function updateFilterOptions() {
    // Update BSU filter
    var bsuSelect = document.getElementById('filterBSU');
    var currentBSU = bsuSelect.value;
    bsuSelect.innerHTML = '<option value="all">Semua BSU</option>';
    for (var i = 0; i < dataBSU.length; i++) {
        bsuSelect.innerHTML += '<option value="' + dataBSU[i].id + '">' + dataBSU[i].nama + '</option>';
    }
    bsuSelect.value = currentBSU;
    
    // Update RW filter
    var rwSelect = document.getElementById('filterRW');
    var currentRW = rwSelect.value;
    var rws = getUniqueRW();
    rwSelect.innerHTML = '<option value="all">Semua RW</option>';
    for (var i = 0; i < rws.length; i++) {
        rwSelect.innerHTML += '<option value="' + rws[i] + '">' + rws[i] + '</option>';
    }
    rwSelect.value = currentRW;
    
    // Update RT filter (based on RW)
    var rtSelect = document.getElementById('filterRT');
    var currentRT = rtSelect.value;
    var rts = getUniqueRT(rwSelect.value);
    rtSelect.innerHTML = '<option value="all">Semua RT</option>';
    for (var i = 0; i < rts.length; i++) {
        rtSelect.innerHTML += '<option value="' + rts[i] + '">' + rts[i] + '</option>';
    }
    rtSelect.value = currentRT;
}

// =====================================================
// DATA NASABAH ADMIN
// =====================================================
function renderNasabahAdmin() {
    var container = document.getElementById('adminNasabahList');
    var nasabahList = daftarNasabah;
    
    if (nasabahList.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#94a3b8;font-size:12px;padding:20px;">Tidak ada data nasabah</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < nasabahList.length; i++) {
        var n = nasabahList[i];
        var saldo = hitungSaldoNasabah(n.id);
        var poin = hitungPoinNasabah(n.id);
        var transaksi = getTransaksiByNasabah(n.id);
        var bsu = getBSUById(n.bsuId);
        
        html += '<div class="list-item">';
        html += '  <div class="list-left">';
        html += '    <div class="avatar" style="width:28px;height:28px;font-size:10px;">' + n.nama.charAt(0) + '</div>';
        html += '    <div>';
        html += '      <div style="font-size:11px;font-weight:600;">' + n.nama + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + (bsu ? bsu.nama : '-') + ' | ' + n.rw + ' - ' + n.rt + '</div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div style="text-align:right;">';
        html += '    <div style="font-size:11px;font-weight:700;color:#0d9488;">Rp ' + formatRupiah(saldo) + '</div>';
        html += '    <div style="font-size:9px;color:#64748b;">' + transaksi.length + ' transaksi | ' + poin + ' poin</div>';
        html += '  </div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// =====================================================
// ADMIN SUMMARY
// =====================================================
function updateAdminSummary() {
    var totalSaldo = 0;
    var totalPoin = 0;
    
    for (var i = 0; i < daftarNasabah.length; i++) {
        var saldo = hitungSaldoNasabah(daftarNasabah[i].id);
        totalSaldo += saldo;
        totalPoin += hitungPoinNasabah(daftarNasabah[i].id);
    }
    
    document.getElementById('adminSaldoGlobal').textContent = 'Rp ' + formatRupiah(totalSaldo);
    document.getElementById('adminPoinGlobal').textContent = 'Poin Beredar: ' + totalPoin + ' PTS';
}

// =====================================================
// EXPORT LAPORAN ADMIN
// =====================================================
function exportAdminLaporan(format) {
    var data = daftarSampah;
    var bsu = filterAdmin.bsu;
    var rw = filterAdmin.rw;
    var rt = filterAdmin.rt;
    var periode = filterAdmin.periode;
    
    if (bsu !== 'all') {
        data = data.filter(function(item) { return item.bsuId === bsu; });
    }
    if (rw !== 'all') {
        data = data.filter(function(item) { return item.rw === rw; });
    }
    if (rt !== 'all') {
        data = data.filter(function(item) { return item.rt === rt; });
    }
    
    if (data.length === 0) {
        showToast('Tidak ada data untuk diekspor!', true);
        return;
    }
    
    var periodeLabel = periode === 'mingguan' ? 'Mingguan' : (periode === 'bulanan' ? 'Bulanan' : 'Tahunan');
    var rekapData = generateRekapPerNasabahAdmin(data);
    
    if (format === 'excel') {
        var html = generateAdminExcelHTML(rekapData, data, bsu, rw, rt, periodeLabel);
        downloadExcel(html, 'Laporan_Admin_' + periodeLabel + '.xls');
        showToast('Laporan Excel berhasil diekspor!', false);
    } else if (format === 'pdf') {
        var html = generateAdminPDFHTML(rekapData, data, bsu, rw, rt, periodeLabel);
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
        var html = generateAdminWordHTML(rekapData, data, bsu, rw, rt, periodeLabel);
        downloadWord(html, 'Laporan_Admin_' + periodeLabel + '.doc');
        showToast('Laporan Word berhasil diekspor!', false);
    }
}

// =====================================================
// EXPORT NASABAH REKAP
// =====================================================
function exportAdminNasabahRekap() {
    // Gunakan fungsi dari laporan.js
    if (typeof window.exportAdminNasabahRekap === 'function') {
        window.exportAdminNasabahRekap();
    } else {
        showToast('Fitur export rekap nasabah', false);
    }
}

// =====================================================
// SWITCH TAB ADMIN
// =====================================================
function switchAdminTab(tab) {
    adminTabAktif = tab;
    
    var buttons = document.querySelectorAll('#screen-admin .tab-btn');
    buttons.forEach(function(btn) {
        btn.classList.remove('active');
    });
    document.querySelector('#screen-admin .tab-btn[data-tab="admin-' + tab + '"]').classList.add('active');
    
    var contents = document.querySelectorAll('#screen-admin .tab-content');
    contents.forEach(function(content) {
        content.classList.remove('active');
    });
    document.getElementById('admin-' + tab).classList.add('active');
    
    // Refresh data saat switch tab
    if (tab === 'verifikasi') renderVerifikasiAdmin();
    else if (tab === 'harga') renderHargaSampah();
    else if (tab === 'bsu') renderDataBSU();
    else if (tab === 'nasabah') renderNasabahAdmin();
}

// =====================================================
// EVENT LISTENER UNTUK FILTER
// =====================================================
document.addEventListener('DOMContentLoaded', function() {
    // Filter BSU change -> update RW dan RT
    var filterBSU = document.getElementById('filterBSU');
    if (filterBSU) {
        filterBSU.addEventListener('change', function() {
            updateFilterOptions();
            renderDataBSU();
        });
    }
    
    var filterRW = document.getElementById('filterRW');
    if (filterRW) {
        filterRW.addEventListener('change', function() {
            updateFilterOptions();
            renderDataBSU();
        });
    }
    
    var filterRT = document.getElementById('filterRT');
    if (filterRT) {
        filterRT.addEventListener('change', function() {
            renderDataBSU();
        });
    }
    
    var filterPeriode = document.getElementById('filterPeriode');
    if (filterPeriode) {
        filterPeriode.addEventListener('change', function() {
            renderDataBSU();
        });
    }
});

// Export ke global
window.renderAdmin = renderAdmin;
window.renderVerifikasiAdmin = renderVerifikasiAdmin;
window.renderHargaSampah = renderHargaSampah;
window.renderDataBSU = renderDataBSU;
window.renderNasabahAdmin = renderNasabahAdmin;
window.updateAdminSummary = updateAdminSummary;
window.switchAdminTab = switchAdminTab;
window.exportAdminLaporan = exportAdminLaporan;
window.exportAdminNasabahRekap = exportAdminNasabahRekap;
window.verifikasiSampah = verifikasiSampah;
window.updateHargaSampah = updateHargaSampah;
window.updateFilterOptions = updateFilterOptions;

console.log('✅ App Admin loaded');