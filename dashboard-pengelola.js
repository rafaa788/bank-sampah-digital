// dashboard-pengelola.js
// =====================================================
// DASHBOARD PENGELOLA BSU - REALTIME
// =====================================================

var pengelolaAktif = {
    bsuId: sessionStorage.getItem('bsuId') || 'bsu_mede1',
    namaBSU: sessionStorage.getItem('bsuNama') || 'BSU MEDE 1',
    rw: sessionStorage.getItem('bsuRw') || 'RW01',
    rt: sessionStorage.getItem('bsuRt') || 'RT01',
    ketua: sessionStorage.getItem('bsuKetua') || 'Ketua BSU'
};

var pengelolaTabAktif = 'dashboard';
var pengelolaRealtimeChannels = [];
var pengelolaRealtimeSetup = false;

// =============================================
// RENDER DASHBOARD PENGELOLA
// =============================================

function renderPengelola() {
    console.log('🔄 Render Pengelola Dashboard');
    
    var namaEl = document.getElementById('pengelolaNamaBSU');
    if (namaEl) namaEl.textContent = '"' + pengelolaAktif.namaBSU + '"';
    
    var ketuaEl = document.getElementById('pengelolaKetua');
    if (ketuaEl) ketuaEl.textContent = 'Ketua: ' + pengelolaAktif.ketua;
    
    var inputKetuaDisplay = document.getElementById('inputKetuaDisplay');
    if (inputKetuaDisplay) inputKetuaDisplay.textContent = pengelolaAktif.ketua;
    
    var inputKetuaHidden = document.getElementById('inputKetua');
    if (inputKetuaHidden) inputKetuaHidden.value = pengelolaAktif.ketua;
    
    // Update semua data
    updateSaldoBSU();
    renderStatistik();
    renderRekapTransaksi();
    renderSetoranPengelola();
    renderNasabahPengelola();
    updateSampahList();
    setupFotoPreview();
    updateBottomNav('dashboard');
    
    // Setup realtime jika belum
    if (!pengelolaRealtimeSetup) {
        setupPengelolaRealtime();
    }
}

// =============================================
// SWITCH TAB
// =============================================

function switchPengelolaTab(tab) {
    pengelolaTabAktif = tab;
    
    var buttons = document.querySelectorAll('.pengelola-dashboard .tab-btn');
    buttons.forEach(function(btn) { btn.classList.remove('active'); });
    var activeBtn = document.querySelector('.tab-btn[data-tab="pengelola-' + tab + '"]');
    if (activeBtn) activeBtn.classList.add('active');
    
    updateBottomNav(tab);
    
    var contents = document.querySelectorAll('.pengelola-dashboard .tab-content');
    contents.forEach(function(content) { content.classList.remove('active'); });
    var activeContent = document.getElementById('pengelola-' + tab);
    if (activeContent) activeContent.classList.add('active');
    
    // Refresh data sesuai tab
    if (tab === 'dashboard') {
        renderStatistik();
        renderRekapTransaksi();
    } else if (tab === 'setoran') {
        renderSetoranPengelola();
    } else if (tab === 'nasabah') {
        renderNasabahPengelola();
    } else if (tab === 'input') {
        updateSampahList();
        setupFotoPreview();
    } else if (tab === 'laporan') {
        renderStatistik();
    }
}

// =============================================
// UPDATE BOTTOM NAV
// =============================================

function updateBottomNav(activeTab) {
    var navItems = document.querySelectorAll('.pengelola-dashboard .bottom-nav .nav-item');
    var navFab = document.querySelector('.pengelola-dashboard .bottom-nav .nav-fab');
    
    navItems.forEach(function(item) { item.classList.remove('active'); });
    if (navFab) navFab.classList.remove('active');
    
    var navMap = { 'dashboard': 0, 'setoran': 1, 'input': 'fab', 'nasabah': 2, 'laporan': 3 };
    var index = navMap[activeTab];
    
    if (index === 'fab') {
        if (navFab) navFab.classList.add('active');
    } else if (index !== undefined && navItems[index]) {
        navItems[index].classList.add('active');
    }
}

// =============================================
// SUBMIT DATA SAMPAH
// =============================================

function submitDataSampah() {
    console.log('📝 Submit data sampah dimulai...');
    
    try {
        var namaNasabahInput = document.getElementById('inputNamaNasabahManual');
        var namaSampahSelect = document.getElementById('inputNamaSampah');
        var jenisSelect = document.getElementById('inputJenis');
        var beratInput = document.getElementById('inputBerat');
        
        // Validasi elemen
        if (!namaNasabahInput) {
            showToast('⚠️ Error form, refresh halaman!', true);
            return;
        }
        
        var namaNasabah = namaNasabahInput.value.trim();
        var nama = namaSampahSelect ? namaSampahSelect.value : '';
        var jenis = jenisSelect ? jenisSelect.value : 'plastik';
        var berat = parseFloat(beratInput ? beratInput.value : 0);
        
        console.log('📋 Data form:', { namaNasabah, nama, jenis, berat });
        
        // Validasi
        if (!namaNasabah) {
            showToast('⚠️ Masukkan nama nasabah!', true);
            namaNasabahInput.focus();
            return;
        }
        if (!nama) {
            showToast('⚠️ Pilih nama sampah!', true);
            return;
        }
        if (!berat || berat <= 0) {
            showToast('⚠️ Masukkan berat yang valid!', true);
            return;
        }
        
        var ketuaBSU = document.getElementById('inputKetua')?.value || pengelolaAktif.ketua || 'Ketua BSU';
        var harga = getHargaByNamaSampah(nama);
        var bsu = getBSUById(pengelolaAktif.bsuId);
        
        // Ambil foto
        var fotoTimbang = document.getElementById('fotoTimbang')?.files[0];
        var fotoHasil = document.getElementById('fotoHasil')?.files[0];
        var fotoBukti = document.getElementById('fotoBukti')?.files[0];
        
        // Cek nasabah
        var finalNasabahId = null;
        var existingNasabah = null;
        var nasabahList = window.daftarNasabah || [];
        
        for (var i = 0; i < nasabahList.length; i++) {
            if (nasabahList[i].nama && nasabahList[i].nama.toLowerCase() === namaNasabah.toLowerCase() && 
                nasabahList[i].bsuId === pengelolaAktif.bsuId) {
                existingNasabah = nasabahList[i];
                break;
            }
        }
        
        if (existingNasabah) {
            finalNasabahId = existingNasabah.id;
        } else {
            var newId = 'nasabah_auto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
            var newNasabah = {
                id: newId,
                nama: namaNasabah,
                username: 'auto_' + Date.now(),
                password: 'auto',
                bsuId: pengelolaAktif.bsuId,
                bsu_id: pengelolaAktif.bsuId,
                rw: bsu ? bsu.rw : pengelolaAktif.rw,
                rt: bsu ? bsu.rt : pengelolaAktif.rt,
                alamat: '',
                noHp: '',
                no_hp: '',
                isManual: true,
                created_at: new Date().toISOString()
            };
            
            if (!window.daftarNasabah) window.daftarNasabah = [];
            window.daftarNasabah.push(newNasabah);
            finalNasabahId = newId;
            console.log('✅ Nasabah baru dibuat:', newNasabah.nama);
        }
        
        // Siapkan data transaksi
        var transId = 'trans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        var data = {
            id: transId,
            nama: nama,
            jenis: jenis || 'nonorganik',
            berat: berat,
            hargaPerKg: harga,
            harga_per_kg: harga,
            bsu: pengelolaAktif.namaBSU,
            bsuId: pengelolaAktif.bsuId,
            bsu_id: pengelolaAktif.bsuId,
            rw: bsu ? bsu.rw : pengelolaAktif.rw,
            rt: bsu ? bsu.rt : pengelolaAktif.rt,
            ketua: ketuaBSU,
            namaNasabah: namaNasabah,
            nama_nasabah: namaNasabah,
            nasabahId: finalNasabahId,
            nasabah_id: finalNasabahId,
            status: 'menunggu',
            tanggal: new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString(),
            foto_timbang: fotoTimbang ? URL.createObjectURL(fotoTimbang) : null,
            foto_hasil: fotoHasil ? URL.createObjectURL(fotoHasil) : null,
            foto_bukti: fotoBukti ? URL.createObjectURL(fotoBukti) : null
        };
        
        console.log('📦 Data transaksi:', data);
        
        if (typeof tambahTransaksi !== 'function') {
            showToast('⚠️ Error sistem, refresh halaman!', true);
            return;
        }
        
        showToast('⏳ Menyimpan data...', false);
        
        // SIMPAN TRANSAKSI
        tambahTransaksi(data)
            .then(function(result) {
                console.log('✅ Transaksi berhasil disimpan:', result);
                
                // Reset form
                document.getElementById('inputBerat').value = '';
                document.getElementById('fotoTimbang').value = '';
                document.getElementById('fotoHasil').value = '';
                document.getElementById('fotoBukti').value = '';
                document.getElementById('inputHarga').value = '';
                document.getElementById('inputTotal').value = '';
                document.getElementById('inputNamaNasabahManual').value = '';
                document.getElementById('previewTimbang').style.display = 'none';
                document.getElementById('previewHasil').style.display = 'none';
                document.getElementById('previewBukti').style.display = 'none';
                
                showToast('✅ Data sampah berhasil disimpan! Menunggu verifikasi Admin.', false);
                
                // Refresh semua data
                renderSetoranPengelola();
                updateSaldoBSU();
                renderNasabahPengelola();
                renderStatistik();
                renderRekapTransaksi();
            })
            .catch(function(error) {
                console.error('❌ Gagal menyimpan transaksi:', error);
                showToast('⚠️ Gagal menyimpan data: ' + (error.message || 'Unknown error'), true);
            });
            
    } catch (error) {
        console.error('❌ Error:', error);
        showToast('⚠️ Terjadi kesalahan: ' + error.message, true);
    }
}

// =============================================
// PREVIEW FOTO
// =============================================

function setupFotoPreview() {
    var fotoTimbang = document.getElementById('fotoTimbang');
    if (fotoTimbang) {
        fotoTimbang.addEventListener('change', function(e) {
            previewFoto(e, 'previewTimbang');
        });
    }
    var fotoHasil = document.getElementById('fotoHasil');
    if (fotoHasil) {
        fotoHasil.addEventListener('change', function(e) {
            previewFoto(e, 'previewHasil');
        });
    }
    var fotoBukti = document.getElementById('fotoBukti');
    if (fotoBukti) {
        fotoBukti.addEventListener('change', function(e) {
            previewFoto(e, 'previewBukti');
        });
    }
}

function previewFoto(event, previewId) {
    var file = event.target.files[0];
    var preview = document.getElementById(previewId);
    if (!preview) return;
    
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = 'none';
        preview.src = '';
    }
}

// =============================================
// STATISTIK & REKAP
// =============================================

function renderStatistik() {
    var transaksi = getTransaksiByBSU(pengelolaAktif.bsuId);
    
    var totalTransaksi = transaksi.length;
    var totalDiverifikasi = 0, totalMenunggu = 0, totalDitolak = 0;
    var totalBerat = 0, totalNilai = 0;
    var totalNasabah = getNasabahByBSU(pengelolaAktif.bsuId).length;
    
    for (var i = 0; i < transaksi.length; i++) {
        var t = transaksi[i];
        var harga = t.hargaPerKg || t.harga_per_kg || 0;
        var berat = t.berat || 0;
        
        if (t.status === 'diverifikasi') {
            totalDiverifikasi++;
            totalBerat += berat;
            totalNilai += berat * harga;
        } else if (t.status === 'menunggu') {
            totalMenunggu++;
        } else if (t.status === 'ditolak') {
            totalDitolak++;
        }
    }
    
    var stats = [
        { id: 'statTotalTransaksi', value: totalTransaksi },
        { id: 'statDiverifikasi', value: totalDiverifikasi },
        { id: 'statMenunggu', value: totalMenunggu },
        { id: 'statDitolak', value: totalDitolak },
        { id: 'statTotalBerat', value: totalBerat.toFixed(1) + ' kg' },
        { id: 'statTotalNilai', value: 'Rp ' + formatRupiah(totalNilai) },
        { id: 'statTotalNasabah', value: totalNasabah }
    ];
    
    for (var i = 0; i < stats.length; i++) {
        var el = document.getElementById(stats[i].id);
        if (el) el.textContent = stats[i].value;
    }
}

function renderRekapTransaksi() {
    var container = document.getElementById('pengelolaRekapList');
    if (!container) return;
    
    var transaksi = getTransaksiByBSU(pengelolaAktif.bsuId);
    var diverifikasi = transaksi.filter(function(t) { return t.status === 'diverifikasi'; });
    
    if (diverifikasi.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-check-circle"></i><p>Belum ada transaksi yang diverifikasi</p></div>';
        return;
    }
    
    diverifikasi.sort(function(a, b) {
        return new Date(b.created_at || b.tanggal) - new Date(a.created_at || a.tanggal);
    });
    
    var rekap = diverifikasi.slice(0, 10);
    var html = '';
    
    for (var i = 0; i < rekap.length; i++) {
        var item = rekap[i];
        var nasabah = getNasabahById(item.nasabahId || item.nasabah_id);
        var nilai = (item.berat || 0) * (item.hargaPerKg || item.harga_per_kg || 0);
        
        html += '<div class="list-item">';
        html += '  <div class="list-left">';
        html += '    <div class="avatar" style="width:28px;height:28px;font-size:10px;background:#dcfce7;color:#15803d;">' + (nasabah ? nasabah.nama.charAt(0) : '?') + '</div>';
        html += '    <div>';
        html += '      <div style="font-size:11px;font-weight:600;">' + (nasabah ? nasabah.nama : item.namaNasabah || item.nama_nasabah || 'Unknown') + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + (item.nama || 'Sampah') + ' | ' + (item.tanggal || '-') + '</div>';
        html += '      <div style="font-size:8px;color:#94a3b8;">Berat: ' + (item.berat || 0).toFixed(1) + ' kg | Rp ' + formatRupiah(item.hargaPerKg || item.harga_per_kg || 0) + '/kg</div>';
        html += '      <div style="font-size:8px;color:#94a3b8;">👤 Ketua: ' + (item.ketua || '-') + '</div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div style="text-align:right;">';
        html += '    <div style="font-size:11px;font-weight:700;color:#0d9488;">Rp ' + formatRupiah(nilai) + '</div>';
        html += '    <span class="badge badge-success">Diverifikasi</span>';
        html += '  </div>';
        html += '</div>';
    }
    
    if (diverifikasi.length > 10) {
        html += '<div style="text-align:center;font-size:10px;color:#94a3b8;padding:8px;">Dan ' + (diverifikasi.length - 10) + ' transaksi lainnya</div>';
    }
    
    container.innerHTML = html;
}

function updateSaldoBSU() {
    var transaksi = getTransaksiByBSU(pengelolaAktif.bsuId);
    var totalSaldo = 0;
    
    for (var i = 0; i < transaksi.length; i++) {
        var t = transaksi[i];
        if (t.status === 'diverifikasi') {
            totalSaldo += (t.berat || 0) * (t.hargaPerKg || t.harga_per_kg || 0);
        }
    }
    
    var saldoEl = document.getElementById('pengelolaSaldo');
    if (saldoEl) saldoEl.textContent = 'Rp ' + formatRupiah(totalSaldo);
}

function renderSetoranPengelola() {
    var container = document.getElementById('pengelolaSetoranList');
    if (!container) return;
    
    var transaksi = getTransaksiByBSU(pengelolaAktif.bsuId);
    
    if (transaksi.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-inbox"></i><p>Belum ada setoran</p></div>';
        return;
    }
    
    transaksi.sort(function(a, b) {
        return new Date(b.created_at || b.tanggal) - new Date(a.created_at || a.tanggal);
    });
    
    var limit = Math.min(transaksi.length, 10);
    var html = '';
    
    for (var i = 0; i < limit; i++) {
        var item = transaksi[i];
        var nasabah = getNasabahById(item.nasabahId || item.nasabah_id);
        var statusClass = item.status === 'diverifikasi' ? 'badge-success' : 
                         (item.status === 'ditolak' ? 'badge-danger' : 'badge-pending');
        var statusLabel = item.status === 'diverifikasi' ? 'Diverifikasi' :
                         (item.status === 'ditolak' ? 'Ditolak' : 'Menunggu');
        var nilai = (item.berat || 0) * (item.hargaPerKg || item.harga_per_kg || 0);
        
        html += '<div class="list-item">';
        html += '  <div class="list-left">';
        html += '    <div class="avatar" style="width:28px;height:28px;font-size:10px;">' + (nasabah ? nasabah.nama.charAt(0) : '?') + '</div>';
        html += '    <div>';
        html += '      <div style="font-size:11px;font-weight:600;">' + (nasabah ? nasabah.nama : item.namaNasabah || item.nama_nasabah || 'Unknown') + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + (item.nama || 'Sampah').substring(0, 25) + ' | ' + (item.tanggal || '-') + '</div>';
        html += '      <div style="font-size:8px;color:#94a3b8;">👤 Ketua: ' + (item.ketua || pengelolaAktif.ketua) + '</div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div style="text-align:right;">';
        html += '    <div style="font-size:11px;font-weight:600;">Rp ' + formatRupiah(nilai) + '</div>';
        html += '    <span class="badge ' + statusClass + '">' + statusLabel + '</span>';
        html += '  </div>';
        html += '</div>';
    }
    
    if (transaksi.length > 10) {
        html += '<div style="text-align:center;font-size:10px;color:#94a3b8;padding:8px;">Dan ' + (transaksi.length - 10) + ' transaksi lainnya</div>';
    }
    
    container.innerHTML = html;
}

function renderNasabahPengelola() {
    var container = document.getElementById('pengelolaNasabahList');
    if (!container) return;
    
    var nasabah = getNasabahByBSU(pengelolaAktif.bsuId);
    
    var countEl = document.getElementById('nasabahCount');
    if (countEl) countEl.textContent = 'Total: ' + nasabah.length;
    
    if (nasabah.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-users-slash"></i><p>Belum ada nasabah terdaftar</p><p style="font-size:10px;color:#94a3b8;margin-top:4px;">💡 Nasabah akan otomatis terdaftar saat input data</p></div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < nasabah.length; i++) {
        var n = nasabah[i];
        var saldo = hitungSaldoNasabah(n.id);
        var transaksi = getTransaksiByNasabah(n.id);
        var diverifikasi = 0;
        
        for (var j = 0; j < transaksi.length; j++) {
            if (transaksi[j].status === 'diverifikasi') diverifikasi++;
        }
        
        var isManual = n.isManual || false;
        var avatarBg = isManual ? '#fef3c7' : '#dcfce7';
        var avatarColor = isManual ? '#d97706' : '#15803d';
        
        html += '<div class="list-item">';
        html += '  <div class="list-left">';
        html += '    <div class="avatar" style="width:28px;height:28px;font-size:10px;background:' + avatarBg + ';color:' + avatarColor + ';">' + n.nama.charAt(0) + '</div>';
        html += '    <div>';
        html += '      <div style="font-size:11px;font-weight:600;">' + n.nama + (isManual ? ' <span style="font-size:8px;color:#d97706;">(Manual)</span>' : '') + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + n.rw + ' - ' + n.rt + ' | ' + diverifikasi + ' transaksi diverifikasi</div>';
        html += '    </div>';
        html += '  </div>';
        html += '  <div style="text-align:right;">';
        html += '    <div style="font-size:11px;font-weight:700;color:#0d9488;">Rp ' + formatRupiah(saldo) + '</div>';
        html += '  </div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

function updateSampahList() {
    var jenis = document.getElementById('inputJenis')?.value || 'plastik';
    var select = document.getElementById('inputNamaSampah');
    if (!select) return;
    
    var list = presetSampah[jenis] || [];
    
    select.innerHTML = '<option value="">Pilih Nama Sampah</option>';
    for (var i = 0; i < list.length; i++) {
        select.innerHTML += '<option value="' + list[i] + '">' + list[i] + '</option>';
    }
    updateHargaOtomatis();
}

function updateHargaOtomatis() {
    var nama = document.getElementById('inputNamaSampah')?.value;
    var berat = parseFloat(document.getElementById('inputBerat')?.value) || 0;
    
    var hargaEl = document.getElementById('inputHarga');
    var totalEl = document.getElementById('inputTotal');
    
    if (nama) {
        var harga = getHargaByNamaSampah(nama);
        if (hargaEl) hargaEl.value = 'Rp ' + formatRupiah(harga);
        if (totalEl) totalEl.value = 'Rp ' + formatRupiah(harga * berat);
    } else {
        if (hargaEl) hargaEl.value = '';
        if (totalEl) totalEl.value = '';
    }
}

function exportPengelolaLaporan(periode) {
    var data = getTransaksiByBSU(pengelolaAktif.bsuId);
    if (data.length === 0) {
        showToast('Tidak ada data untuk diekspor!', true);
        return;
    }
    
    var periodeLabel = periode === 'mingguan' ? 'Mingguan' : 
                       (periode === 'bulanan' ? 'Bulanan' : 
                       (periode === 'tahunan' ? 'Tahunan' : 'Lengkap'));
    var rekapData = generateRekapPerNasabahAdmin(data);
    var html = generateAdminExcelHTML(rekapData, data, pengelolaAktif.namaBSU, pengelolaAktif.rw, pengelolaAktif.rt, periodeLabel);
    downloadExcel(html, 'Laporan_Pengelola_' + pengelolaAktif.namaBSU + '_' + periodeLabel + '.xls');
    showToast('Laporan ' + periodeLabel + ' berhasil diekspor!', false);
}

function exportPengelolaLaporanPDF(periode) {
    var data = getTransaksiByBSU(pengelolaAktif.bsuId);
    if (data.length === 0) {
        showToast('Tidak ada data untuk diekspor!', true);
        return;
    }
    
    var periodeLabel = periode === 'mingguan' ? 'Mingguan' : 
                       (periode === 'bulanan' ? 'Bulanan' : 
                       (periode === 'tahunan' ? 'Tahunan' : 'Lengkap'));
    var rekapData = generateRekapPerNasabahAdmin(data);
    var html = generateAdminPDFHTML(rekapData, data, pengelolaAktif.namaBSU, pengelolaAktif.rw, pengelolaAktif.rt, periodeLabel);
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

// =============================================
// EXPORT KE GLOBAL
// =============================================
window.renderPengelola = renderPengelola;
window.switchPengelolaTab = switchPengelolaTab;
window.updateSampahList = updateSampahList;
window.updateHargaOtomatis = updateHargaOtomatis;
window.submitDataSampah = submitDataSampah;
window.exportPengelolaLaporan = exportPengelolaLaporan;
window.exportPengelolaLaporanPDF = exportPengelolaLaporanPDF;
window.updateBottomNav = updateBottomNav;

console.log('✅ Dashboard Pengelola loaded');
console.log('🏢 BSU:', pengelolaAktif.namaBSU);

// =============================================
// REALTIME SETUP
// =============================================

function setupPengelolaRealtime() {
    if (pengelolaRealtimeSetup) return;
    
    if (window.removeAllChannels) {
        window.removeAllChannels(pengelolaRealtimeChannels);
    }
    pengelolaRealtimeChannels = [];
    
    function refreshPengelola() {
        console.log('🔄 Auto refresh pengelola dashboard...');
        if (window.syncAllData) {
            window.syncAllData().then(function() {
                renderPengelola();
            });
        } else {
            renderPengelola();
        }
    }
    
    if (window.setupAllRealtime) {
        window.setupAllRealtime({
            onTransaksiChange: refreshPengelola,
            onNasabahChange: refreshPengelola,
            onHargaChange: refreshPengelola
        }).then(function(channels) {
            pengelolaRealtimeChannels = channels;
            pengelolaRealtimeSetup = true;
            console.log('✅ Pengelola real-time active!');
        });
    }
}