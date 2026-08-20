// dashboard-pengelola.js
// =====================================================
// DASHBOARD PENGELOLA BSU - LENGKAP DENGAN AUTO-FILL KETUA
// =====================================================

var pengelolaAktif = {
    bsuId: sessionStorage.getItem('bsuId') || 'bsu_mede1',
    namaBSU: sessionStorage.getItem('bsuNama') || 'BSU MEDE 1',
    rw: sessionStorage.getItem('bsuRw') || 'RW01',
    rt: sessionStorage.getItem('bsuRt') || 'RT01',
    ketua: sessionStorage.getItem('bsuKetua') || 'Ketua BSU'
};

var pengelolaTabAktif = 'dashboard';

// =============================================
// RENDER DASHBOARD PENGELOLA
// =============================================

function renderPengelola() {
    var namaEl = document.getElementById('pengelolaNamaBSU');
    if (namaEl) {
        namaEl.textContent = '"' + pengelolaAktif.namaBSU + '"';
    }
    
    var ketuaEl = document.getElementById('pengelolaKetua');
    if (ketuaEl) {
        ketuaEl.textContent = 'Ketua: ' + pengelolaAktif.ketua;
    }
    
    // ✅ AUTO-FILL NAMA KETUA DI INPUT FORM
    var inputKetuaDisplay = document.getElementById('inputKetuaDisplay');
    if (inputKetuaDisplay) {
        inputKetuaDisplay.textContent = pengelolaAktif.ketua;
    }
    
    // ✅ AUTO-FILL NAMA KETUA DI FIELD TERSEMBUNYI (untuk disimpan)
    var inputKetuaHidden = document.getElementById('inputKetua');
    if (inputKetuaHidden) {
        inputKetuaHidden.value = pengelolaAktif.ketua;
    }
    
    updateSaldoBSU();
    renderStatistik();
    renderRekapTransaksi();
    renderSetoranPengelola();
    renderNasabahPengelola();
    renderDropdownNasabah();
    updateSampahList();
    setupFotoPreview();
    
    // ✅ Set active bottom nav
    updateBottomNav('dashboard');
}

// =============================================
// SWITCH TAB - DENGAN BOTTOM NAV AKTIF
// =============================================

function switchPengelolaTab(tab) {
    pengelolaTabAktif = tab;
    
    // 1. UPDATE TAB BUTTONS
    var buttons = document.querySelectorAll('.pengelola-dashboard .tab-btn');
    buttons.forEach(function(btn) { 
        btn.classList.remove('active'); 
    });
    var activeBtn = document.querySelector('.tab-btn[data-tab="pengelola-' + tab + '"]');
    if (activeBtn) activeBtn.classList.add('active');
    
    // 2. UPDATE BOTTOM NAV
    updateBottomNav(tab);
    
    // 3. UPDATE CONTENT
    var contents = document.querySelectorAll('.pengelola-dashboard .tab-content');
    contents.forEach(function(content) { 
        content.classList.remove('active'); 
    });
    var activeContent = document.getElementById('pengelola-' + tab);
    if (activeContent) activeContent.classList.add('active');
    
    // 4. REFRESH DATA
    if (tab === 'dashboard') {
        renderStatistik();
        renderRekapTransaksi();
    } else if (tab === 'setoran') {
        renderSetoranPengelola();
    } else if (tab === 'nasabah') {
        renderNasabahPengelola();
    } else if (tab === 'input') {
        renderDropdownNasabah();
        updateSampahList();
        setupFotoPreview();
    } else if (tab === 'laporan') {
        // Update filter laporan jika perlu
        renderStatistik();
    }
}

// =============================================
// UPDATE BOTTOM NAV - INDIKATOR AKTIF
// =============================================

function updateBottomNav(activeTab) {
    var navItems = document.querySelectorAll('.pengelola-dashboard .bottom-nav .nav-item');
    var navFab = document.querySelector('.pengelola-dashboard .bottom-nav .nav-fab');
    
    // Reset semua nav item
    navItems.forEach(function(item) {
        item.classList.remove('active');
    });
    if (navFab) {
        navFab.classList.remove('active');
    }
    
    // Aktifkan berdasarkan tab
    var navMap = {
        'dashboard': 0,
        'setoran': 1,
        'input': 'fab',
        'nasabah': 2,
        'laporan': 3
    };
    
    var index = navMap[activeTab];
    
    if (index === 'fab') {
        if (navFab) navFab.classList.add('active');
    } else if (index !== undefined && navItems[index]) {
        navItems[index].classList.add('active');
    }
}

// =============================================
// SUBMIT DATA SAMPAH - DENGAN KETUA OTOMATIS
// =============================================

function submitDataSampah() {
    var selectNasabah = document.getElementById('inputNasabah');
    var manualInput = document.getElementById('inputNamaNasabahManual');
    var nama = document.getElementById('inputNamaSampah')?.value;
    var jenis = document.getElementById('inputJenis')?.value;
    var berat = parseFloat(document.getElementById('inputBerat')?.value);
    
    // ✅ Ambil ketua dari field tersembunyi atau dari sessionStorage
    var ketuaBSU = document.getElementById('inputKetua')?.value || pengelolaAktif.ketua || 'Ketua BSU';
    
    var nasabahId = selectNasabah.value;
    var namaNasabah = '';
    var isManual = false;
    
    if (!nasabahId || nasabahId === '') {
        if (manualInput && manualInput.style.display !== 'none' && manualInput.value.trim()) {
            namaNasabah = manualInput.value.trim();
            isManual = true;
        } else {
            showToast('⚠️ Pilih nasabah atau masukkan nama manual!', true);
            return;
        }
    } else {
        var nasabah = getNasabahById(nasabahId);
        if (!nasabah) {
            showToast('⚠️ Data nasabah tidak ditemukan!', true);
            return;
        }
        namaNasabah = nasabah.nama;
    }
    
    if (!nama) {
        showToast('⚠️ Pilih nama sampah!', true);
        return;
    }
    if (!berat || berat <= 0) {
        showToast('⚠️ Masukkan berat yang valid!', true);
        return;
    }
    
    var harga = getHargaByNamaSampah(nama);
    var bsu = getBSUById(pengelolaAktif.bsuId);
    
    var fotoTimbang = document.getElementById('fotoTimbang')?.files[0];
    var fotoHasil = document.getElementById('fotoHasil')?.files[0];
    var fotoBukti = document.getElementById('fotoBukti')?.files[0];
    
    var finalNasabahId = nasabahId;
    if (isManual) {
        var existingNasabah = null;
        var nasabahList = window.daftarNasabah || [];
        for (var i = 0; i < nasabahList.length; i++) {
            if (nasabahList[i].nama.toLowerCase() === namaNasabah.toLowerCase() && 
                nasabahList[i].bsuId === pengelolaAktif.bsuId) {
                existingNasabah = nasabahList[i];
                break;
            }
        }
        
        if (existingNasabah) {
            finalNasabahId = existingNasabah.id;
        } else {
            var newId = 'nasabah_manual_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
            var newNasabah = {
                id: newId,
                nama: namaNasabah,
                username: 'manual_' + Date.now(),
                password: 'manual',
                bsuId: pengelolaAktif.bsuId,
                rw: bsu ? bsu.rw : pengelolaAktif.rw,
                rt: bsu ? bsu.rt : pengelolaAktif.rt,
                alamat: '',
                noHp: '',
                isManual: true
            };
            
            if (!window.daftarNasabah) {
                window.daftarNasabah = [];
            }
            window.daftarNasabah.push(newNasabah);
            finalNasabahId = newId;
        }
    }
    
    // ✅ Data dengan ketua otomatis
    var data = {
        nama: nama,
        jenis: jenis || 'nonorganik',
        berat: berat,
        hargaPerKg: harga,
        bsu: pengelolaAktif.namaBSU,
        bsuId: pengelolaAktif.bsuId,
        rw: bsu ? bsu.rw : pengelolaAktif.rw,
        rt: bsu ? bsu.rt : pengelolaAktif.rt,
        ketua: ketuaBSU, // ✅ Otomatis terisi
        namaNasabah: namaNasabah,
        nasabahId: finalNasabahId,
        status: 'menunggu',
        foto_timbang: fotoTimbang ? URL.createObjectURL(fotoTimbang) : null,
        foto_hasil: fotoHasil ? URL.createObjectURL(fotoHasil) : null,
        foto_bukti: fotoBukti ? URL.createObjectURL(fotoBukti) : null
    };
    
    console.log('📝 Data yang disimpan:', data);
    console.log('👤 Ketua BSU:', ketuaBSU);
    
    tambahTransaksi(data);
    
    document.getElementById('inputBerat').value = '';
    document.getElementById('fotoTimbang').value = '';
    document.getElementById('fotoHasil').value = '';
    document.getElementById('fotoBukti').value = '';
    document.getElementById('inputHarga').value = '';
    document.getElementById('inputTotal').value = '';
    
    document.getElementById('previewTimbang').style.display = 'none';
    document.getElementById('previewHasil').style.display = 'none';
    document.getElementById('previewBukti').style.display = 'none';
    
    if (manualInput) {
        manualInput.value = '';
        manualInput.style.display = 'none';
    }
    selectNasabah.value = '';
    
    showToast('✅ Data sampah berhasil disimpan! Menunggu verifikasi oleh Admin.', false);
    
    renderSetoranPengelola();
    updateSaldoBSU();
    renderNasabahPengelola();
    renderDropdownNasabah();
    renderStatistik();
    renderRekapTransaksi();
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
// FUNGSI LAINNYA (Statistik, Rekap, dll)
// =============================================

function renderStatistik() {
    var transaksi = getTransaksiByBSU(pengelolaAktif.bsuId);
    
    var totalTransaksi = transaksi.length;
    var totalDiverifikasi = 0;
    var totalMenunggu = 0;
    var totalDitolak = 0;
    var totalBerat = 0;
    var totalNilai = 0;
    var totalNasabah = getNasabahByBSU(pengelolaAktif.bsuId).length;
    
    for (var i = 0; i < transaksi.length; i++) {
        var t = transaksi[i];
        if (t.status === 'diverifikasi') {
            totalDiverifikasi++;
            totalBerat += t.berat;
            totalNilai += t.berat * t.hargaPerKg;
        } else if (t.status === 'menunggu') {
            totalMenunggu++;
        } else if (t.status === 'ditolak') {
            totalDitolak++;
        }
    }
    
    var stats = [
        { id: 'statTotalTransaksi', value: totalTransaksi, label: 'Total Transaksi' },
        { id: 'statDiverifikasi', value: totalDiverifikasi, label: 'Diverifikasi' },
        { id: 'statMenunggu', value: totalMenunggu, label: 'Menunggu' },
        { id: 'statDitolak', value: totalDitolak, label: 'Ditolak' },
        { id: 'statTotalBerat', value: totalBerat.toFixed(1) + ' kg', label: 'Total Berat' },
        { id: 'statTotalNilai', value: 'Rp ' + formatRupiah(totalNilai), label: 'Total Nilai' },
        { id: 'statTotalNasabah', value: totalNasabah, label: 'Total Nasabah' }
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
    var diverifikasi = transaksi.filter(function(t) {
        return t.status === 'diverifikasi';
    });
    
    if (diverifikasi.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-check-circle"></i><p>Belum ada transaksi yang diverifikasi</p></div>';
        return;
    }
    
    diverifikasi.sort(function(a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
    });
    
    var rekap = diverifikasi.slice(0, 10);
    var html = '';
    
    for (var i = 0; i < rekap.length; i++) {
        var item = rekap[i];
        var nasabah = getNasabahById(item.nasabahId);
        var nilai = item.berat * item.hargaPerKg;
        
        html += '<div class="list-item">';
        html += '  <div class="list-left">';
        html += '    <div class="avatar" style="width:28px;height:28px;font-size:10px;background:#dcfce7;color:#15803d;">' + (nasabah ? nasabah.nama.charAt(0) : '?') + '</div>';
        html += '    <div>';
        html += '      <div style="font-size:11px;font-weight:600;">' + (nasabah ? nasabah.nama : item.namaNasabah || 'Unknown') + '</div>';
        html += '      <div style="font-size:9px;color:#64748b;">' + (item.nama || 'Sampah') + ' | ' + (item.tanggal || '-') + '</div>';
        html += '      <div style="font-size:8px;color:#94a3b8;">Berat: ' + item.berat.toFixed(1) + ' kg | Rp ' + formatRupiah(item.hargaPerKg) + '/kg</div>';
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
            totalSaldo += t.berat * t.hargaPerKg;
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
        return new Date(b.created_at) - new Date(a.created_at);
    });
    
    var limit = Math.min(transaksi.length, 10);
    var html = '';
    
    for (var i = 0; i < limit; i++) {
        var item = transaksi[i];
        var nasabah = getNasabahById(item.nasabahId);
        var statusClass = item.status === 'diverifikasi' ? 'badge-success' : 
                         (item.status === 'ditolak' ? 'badge-danger' : 'badge-pending');
        var statusLabel = item.status === 'diverifikasi' ? 'Diverifikasi' :
                         (item.status === 'ditolak' ? 'Ditolak' : 'Menunggu');
        var nilai = item.berat * item.hargaPerKg;
        
        html += '<div class="list-item">';
        html += '  <div class="list-left">';
        html += '    <div class="avatar" style="width:28px;height:28px;font-size:10px;">' + (nasabah ? nasabah.nama.charAt(0) : '?') + '</div>';
        html += '    <div>';
        html += '      <div style="font-size:11px;font-weight:600;">' + (nasabah ? nasabah.nama : item.namaNasabah || 'Unknown') + '</div>';
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
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-users-slash"></i><p>Belum ada nasabah terdaftar di BSU ini</p><p style="font-size:10px;color:#94a3b8;margin-top:4px;">💡 Silakan daftar akun nasabah terlebih dahulu</p></div>';
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

function renderDropdownNasabah() {
    var select = document.getElementById('inputNasabah');
    if (!select) return;
    
    var nasabah = getNasabahByBSU(pengelolaAktif.bsuId);
    
    select.innerHTML = '';
    
    var manualOption = document.createElement('option');
    manualOption.value = '';
    manualOption.textContent = '✏️ Input Manual (Ketik Nama)';
    select.appendChild(manualOption);
    
    var listLabel = document.createElement('option');
    listLabel.value = '';
    listLabel.textContent = '── Daftar Nasabah ──';
    listLabel.disabled = true;
    listLabel.style.color = '#94a3b8';
    select.appendChild(listLabel);
    
    if (nasabah.length === 0) {
        var emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '⚠️ Belum ada nasabah terdaftar';
        emptyOption.disabled = true;
        select.appendChild(emptyOption);
    } else {
        for (var i = 0; i < nasabah.length; i++) {
            var option = document.createElement('option');
            option.value = nasabah[i].id;
            var label = nasabah[i].nama + ' (' + nasabah[i].rw + ' - ' + nasabah[i].rt + ')';
            if (nasabah[i].isManual) label += ' [Manual]';
            option.textContent = label;
            select.appendChild(option);
        }
    }
    
    select.onchange = function() {
        var selectedValue = this.value;
        var namaInput = document.getElementById('inputNamaNasabahManual');
        var label = document.querySelector('label[for="inputNasabah"]');
        
        if (selectedValue === '') {
            if (namaInput) {
                namaInput.style.display = 'block';
            }
            if (label) {
                label.textContent = 'Nama Nasabah (Manual)';
            }
        } else {
            if (namaInput) {
                namaInput.style.display = 'none';
                namaInput.value = '';
            }
            if (label) {
                label.textContent = 'Nama Nasabah';
            }
        }
    };
    
    var formGroup = select.closest('.form-group');
    if (formGroup) {
        var existingInput = document.getElementById('inputNamaNasabahManual');
        if (!existingInput) {
            var manualInput = document.createElement('input');
            manualInput.type = 'text';
            manualInput.id = 'inputNamaNasabahManual';
            manualInput.className = 'form-control';
            manualInput.placeholder = 'Ketik nama nasabah (manual)';
            manualInput.style.display = 'none';
            manualInput.style.marginTop = '5px';
            
            var info = document.createElement('small');
            info.style.cssText = 'display:block;color:#94a3b8;font-size:9px;margin-top:2px;';
            info.textContent = '💡 Kosongkan pilihan untuk input manual';
            
            formGroup.appendChild(manualInput);
            formGroup.appendChild(info);
        }
    }
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
}

function updateHargaOtomatis() {
    var nama = document.getElementById('inputNamaSampah')?.value;
    var berat = parseFloat(document.getElementById('inputBerat')?.value) || 0;
    
    var hargaEl = document.getElementById('inputHarga');
    var totalEl = document.getElementById('inputTotal');
    
    if (nama) {
        var harga = getHargaByNamaSampah(nama);
        if (hargaEl) hargaEl.value = 'Rp ' + formatRupiah(harga);
        var total = harga * berat;
        if (totalEl) totalEl.value = 'Rp ' + formatRupiah(total);
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
console.log('👤 Ketua:', pengelolaAktif.ketua);

// =============================================
// REAL-TIME AUTO REFRESH FOR PENGELOLA
// =============================================

var pengelolaRealtimeChannels = [];
var pengelolaRealtimeSetup = false;

function setupPengelolaRealtime() {
    if (pengelolaRealtimeSetup) return;
    
    if (window.removeAllChannels) {
        window.removeAllChannels(pengelolaRealtimeChannels);
    }
    pengelolaRealtimeChannels = [];
    
    function refreshPengelola() {
        console.log('🔄 Auto refresh pengelola dashboard...');
        if (window.syncAllData) {
            window.syncAllData().then(() => {
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
        }).then(channels => {
            pengelolaRealtimeChannels = channels;
            pengelolaRealtimeSetup = true;
            console.log('✅ Pengelola real-time active!');
        });
    }
}

// Update renderPengelola - tambahkan di akhir
function renderPengelola() {
    // ... kode render yang sudah ada ...
    
    if (!pengelolaRealtimeSetup) {
        setupPengelolaRealtime();
    }
}