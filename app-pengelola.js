// app-pengelola.js
// =====================================================
// APLIKASI PENGELOLA BSU
// =====================================================

// Data pengelola aktif
var pengelolaAktif = {
    bsuId: 'bsu_mede1',
    namaBSU: 'BSU MEDE 1',
    rw: 'RW01',
    rt: 'RT01'
};

// Tab aktif pengelola
var pengelolaTabAktif = 'setoran';

// Fungsi render pengelola
function renderPengelola() {
    document.getElementById('pengelolaNamaBSU').textContent = '"' + pengelolaAktif.namaBSU + '"';
    
    // Render setoran
    renderSetoranPengelola();
    
    // Render daftar nasabah
    renderNasabahPengelola();
    
    // Render dropdown nasabah untuk input
    renderDropdownNasabah();
    
    // Update harga saat jenis berubah
    updateSampahList();
}

// Fungsi render setoran pengelola
function renderSetoranPengelola() {
    var container = document.getElementById('pengelolaSetoranList');
    var transaksi = getTransaksiByBSU(pengelolaAktif.bsuId);
    
    if (transaksi.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#94a3b8;font-size:12px;padding:20px;">Belum ada setoran</div>';
        return;
    }

    // Urutkan berdasarkan tanggal terbaru
    transaksi.sort(function(a, b) {
        return b.tanggal.localeCompare(a.tanggal);
    });

    var html = '';
    for (var i = 0; i < Math.min(transaksi.length, 10); i++) {
        var item = transaksi[i];
        var statusClass = item.status === 'diverifikasi' ? 'badge-success' : 
                         (item.status === 'ditolak' ? 'badge-danger' : 'badge-pending');
        var statusLabel = item.status === 'diverifikasi' ? 'Diverifikasi' :
                         (item.status === 'ditolak' ? 'Ditolak' : 'Menunggu');
        var nilai = item.berat * item.hargaPerKg;
        
        html += '<div class="list-item">';
        html += '  <div class="list-left">';
        html += '    <div class="avatar" style="width:28px;height:28px;font-size:10px;">' + item.namaNasabah.charAt(0) + '</div>';
        html += '    <div>';
        html += '      <div style="font-size:11px;font-weight:600;">' + item.namaNasabah + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + item.nama.substring(0, 25) + (item.nama.length > 25 ? '...' : '') + ' | ' + item.tanggal + '</div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div style="text-align:right;">';
        html += '    <div style="font-size:11px;font-weight:600;">Rp ' + formatRupiah(nilai) + '</div>';
        html += '    <span class="badge ' + statusClass + '">' + statusLabel + '</span>';
        html += '  </div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Fungsi render nasabah pengelola
function renderNasabahPengelola() {
    var container = document.getElementById('pengelolaNasabahList');
    var nasabah = getNasabahByBSU(pengelolaAktif.bsuId);
    
    if (nasabah.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#94a3b8;font-size:12px;padding:20px;">Belum ada nasabah</div>';
        return;
    }

    var html = '';
    for (var i = 0; i < nasabah.length; i++) {
        var n = nasabah[i];
        var saldo = hitungSaldoNasabah(n.id);
        var poin = hitungPoinNasabah(n.id);
        
        html += '<div class="list-item">';
        html += '  <div class="list-left">';
        html += '    <div class="avatar" style="width:28px;height:28px;font-size:10px;">' + n.nama.charAt(0) + '</div>';
        html += '    <div>';
        html += '      <div style="font-size:11px;font-weight:600;">' + n.nama + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + n.rw + ' - ' + n.rt + '</div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div style="text-align:right;">';
        html += '    <div style="font-size:11px;font-weight:700;color:#0d9488;">Rp ' + formatRupiah(saldo) + '</div>';
        html += '    <div style="font-size:9px;color:#64748b;">' + poin + ' Poin</div>';
        html += '  </div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Fungsi render dropdown nasabah
function renderDropdownNasabah() {
    var select = document.getElementById('inputNasabah');
    var nasabah = getNasabahByBSU(pengelolaAktif.bsuId);
    
    select.innerHTML = '<option value="">Pilih Nasabah</option>';
    for (var i = 0; i < nasabah.length; i++) {
        select.innerHTML += '<option value="' + nasabah[i].id + '">' + nasabah[i].nama + ' (' + nasabah[i].rw + ' - ' + nasabah[i].rt + ')</option>';
    }
}

// Fungsi update daftar sampah berdasarkan jenis
function updateSampahList() {
    var jenis = document.getElementById('inputJenis').value;
    var select = document.getElementById('inputNamaSampah');
    var list = presetSampah[jenis] || [];
    
    select.innerHTML = '<option value="">Pilih Nama Sampah</option>';
    for (var i = 0; i < list.length; i++) {
        select.innerHTML += '<option value="' + list[i] + '">' + list[i] + '</option>';
    }
    
    // Jika ada pilihan, update harga
    if (select.value) {
        updateHargaOtomatis();
    }
}

// Fungsi update harga otomatis
function updateHargaOtomatis() {
    var nama = document.getElementById('inputNamaSampah').value;
    var berat = parseFloat(document.getElementById('inputBerat').value) || 0;
    
    if (nama) {
        var harga = getHargaByNamaSampah(nama);
        document.getElementById('inputHarga').value = 'Rp ' + formatRupiah(harga);
        var total = harga * berat;
        document.getElementById('inputTotal').value = 'Rp ' + formatRupiah(total);
    } else {
        document.getElementById('inputHarga').value = '';
        document.getElementById('inputTotal').value = '';
    }
}

// Event listener untuk update harga
document.addEventListener('DOMContentLoaded', function() {
    var beratInput = document.getElementById('inputBerat');
    if (beratInput) {
        beratInput.addEventListener('input', updateHargaOtomatis);
    }
    var namaInput = document.getElementById('inputNamaSampah');
    if (namaInput) {
        namaInput.addEventListener('change', updateHargaOtomatis);
    }
});

// Fungsi submit data sampah
function submitDataSampah() {
    var nasabahId = document.getElementById('inputNasabah').value;
    var nama = document.getElementById('inputNamaSampah').value;
    var jenis = document.getElementById('inputJenis').value;
    var berat = parseFloat(document.getElementById('inputBerat').value);
    
    if (!nasabahId) {
        showToast('Pilih nasabah terlebih dahulu!', true);
        return;
    }
    if (!nama) {
        showToast('Pilih nama sampah!', true);
        return;
    }
    if (!berat || berat <= 0) {
        showToast('Masukkan berat yang valid!', true);
        return;
    }
    
    var nasabah = getNasabahById(nasabahId);
    var harga = getHargaByNamaSampah(nama);
    var bsu = getBSUById(pengelolaAktif.bsuId);
    
    // Simulasi upload foto (base64)
    var fotoTimbang = document.getElementById('fotoTimbang').files[0];
    var fotoHasil = document.getElementById('fotoHasil').files[0];
    var fotoBukti = document.getElementById('fotoBukti').files[0];
    
    var data = {
        nama: nama,
        jenis: jenis,
        berat: berat,
        hargaPerKg: harga,
        bsu: pengelolaAktif.namaBSU,
        bsuId: pengelolaAktif.bsuId,
        rw: bsu ? bsu.rw : pengelolaAktif.rw,
        rt: bsu ? bsu.rt : pengelolaAktif.rt,
        namaNasabah: nasabah ? nasabah.nama : 'Unknown',
        nasabahId: nasabahId,
        foto_timbang: fotoTimbang ? URL.createObjectURL(fotoTimbang) : null,
        foto_hasil: fotoHasil ? URL.createObjectURL(fotoHasil) : null,
        foto_bukti: fotoBukti ? URL.createObjectURL(fotoBukti) : null
    };
    
    tambahTransaksi(data);
    
    // Reset form
    document.getElementById('inputBerat').value = '';
    document.getElementById('fotoTimbang').value = '';
    document.getElementById('fotoHasil').value = '';
    document.getElementById('fotoBukti').value = '';
    document.getElementById('inputHarga').value = '';
    document.getElementById('inputTotal').value = '';
    
    showToast('Data sampah berhasil disimpan! Menunggu verifikasi.', false);
    
    // Refresh data
    renderSetoranPengelola();
}

// Fungsi switch tab pengelola
function switchPengelolaTab(tab) {
    pengelolaTabAktif = tab;
    
    // Update tab buttons
    var buttons = document.querySelectorAll('#screen-pengelola .tab-btn');
    buttons.forEach(function(btn) {
        btn.classList.remove('active');
    });
    document.querySelector('#screen-pengelola .tab-btn[data-tab="pengelola-' + tab + '"]').classList.add('active');
    
    // Update tab content
    var contents = document.querySelectorAll('#screen-pengelola .tab-content');
    contents.forEach(function(content) {
        content.classList.remove('active');
    });
    document.getElementById('pengelola-' + tab).classList.add('active');
}

// Fungsi export laporan pengelola
function exportPengelolaLaporan(periode) {
    var data = getTransaksiByBSU(pengelolaAktif.bsuId);
    var bsu = pengelolaAktif.namaBSU;
    var rw = pengelolaAktif.rw;
    var rt = pengelolaAktif.rt;
    
    if (data.length === 0) {
        showToast('Tidak ada data untuk diekspor!', true);
        return;
    }
    
    var filtered = data;
    var periodeLabel = periode === 'mingguan' ? 'Mingguan' : (periode === 'bulanan' ? 'Bulanan' : 'Tahunan');
    var rekapData = generateRekapPerNasabahAdmin(filtered);
    var html = generateAdminExcelHTML(rekapData, filtered, bsu, rw, rt, periodeLabel);
    downloadExcel(html, 'Laporan_Pengelola_' + bsu + '_' + periodeLabel + '.xls');
    showToast('Laporan ' + periodeLabel + ' berhasil diekspor!', false);
}

// Fungsi export PDF pengelola
function exportPengelolaLaporanPDF(periode) {
    var data = getTransaksiByBSU(pengelolaAktif.bsuId);
    var bsu = pengelolaAktif.namaBSU;
    var rw = pengelolaAktif.rw;
    var rt = pengelolaAktif.rt;
    
    if (data.length === 0) {
        showToast('Tidak ada data untuk diekspor!', true);
        return;
    }
    
    var periodeLabel = periode === 'mingguan' ? 'Mingguan' : (periode === 'bulanan' ? 'Bulanan' : 'Tahunan');
    var rekapData = generateRekapPerNasabahAdmin(data);
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
}

// Export ke global
window.renderPengelola = renderPengelola;
window.switchPengelolaTab = switchPengelolaTab;
window.updateSampahList = updateSampahList;
window.updateHargaOtomatis = updateHargaOtomatis;
window.submitDataSampah = submitDataSampah;
window.exportPengelolaLaporan = exportPengelolaLaporan;
window.exportPengelolaLaporanPDF = exportPengelolaLaporanPDF;

console.log('✅ App Pengelola loaded');