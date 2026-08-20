// app-nasabah.js
// =====================================================
// APLIKASI NASABAH
// =====================================================

// Data nasabah aktif (akan diisi saat login)
var nasabahAktif = null;

// Fungsi untuk render tampilan nasabah
function renderNasabah() {
    if (!nasabahAktif) {
        // Default ke nasabah pertama
        nasabahAktif = daftarNasabah[0];
    }

    // Set nama dan greeting
    document.getElementById('nasabahNama').textContent = 'Halo, ' + nasabahAktif.nama + '!';
    
    var hour = new Date().getHours();
    var greeting = 'Selamat ';
    if (hour < 12) greeting += 'Pagi';
    else if (hour < 18) greeting += 'Siang';
    else greeting += 'Malam';
    document.getElementById('nasabahGreeting').textContent = greeting;

    // Set saldo dan poin
    var saldo = hitungSaldoNasabah(nasabahAktif.id);
    var poin = hitungPoinNasabah(nasabahAktif.id);
    document.getElementById('nasabahSaldo').textContent = 'Rp ' + formatRupiah(saldo);
    document.getElementById('nasabahPoin').textContent = 'Poin Saya: ' + poin + ' PTS';

    // Render mutasi
    renderMutasiNasabah();
}

// Fungsi render mutasi nasabah
function renderMutasiNasabah() {
    var container = document.getElementById('nasabahMutasi');
    var transaksi = getTransaksiByNasabah(nasabahAktif.id);
    
    if (transaksi.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#94a3b8;font-size:12px;padding:20px;">Belum ada transaksi</div>';
        return;
    }

    // Ambil 3 terakhir
    var terakhir = transaksi.slice(-3).reverse();
    var html = '';
    
    for (var i = 0; i < terakhir.length; i++) {
        var item = terakhir[i];
        var nilai = item.berat * item.hargaPerKg;
        var statusClass = item.status === 'diverifikasi' ? 'badge-success' : 
                         (item.status === 'ditolak' ? 'badge-danger' : 'badge-pending');
        var statusLabel = item.status === 'diverifikasi' ? 'Diverifikasi' :
                         (item.status === 'ditolak' ? 'Ditolak' : 'Menunggu');
        
        html += '<div class="list-item">';
        html += '  <div class="list-left">';
        html += '    <div class="list-icon"><i class="fa-solid fa-arrow-down-left"></i></div>';
        html += '    <div>';
        html += '      <div style="font-size:11px;font-weight:600;">' + item.nama.substring(0, 30) + (item.nama.length > 30 ? '...' : '') + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + item.tanggal + ' <span class="badge ' + statusClass + '">' + statusLabel + '</span></div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div style="font-size:11px;font-weight:700;color:' + (item.status === 'diverifikasi' ? '#16a34a' : '#94a3b8') + ';">+ Rp ' + formatRupiah(nilai) + '</div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Fungsi untuk memilih nasabah (untuk demo)
function pilihNasabah(nasabahId) {
    var nasabah = getNasabahById(nasabahId);
    if (nasabah) {
        nasabahAktif = nasabah;
        renderNasabah();
        showToast('Berhasil login sebagai ' + nasabah.nama, false);
    }
}

// Export
window.renderNasabah = renderNasabah;
window.pilihNasabah = pilihNasabah;

console.log('✅ App Nasabah loaded');