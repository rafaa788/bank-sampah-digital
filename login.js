// login.js
// =====================================================
// FUNGSI LOGIN & REGISTRASI - DENGAN SUPABASE
// =====================================================

// =============================================
// FUNGSI LOGIN
// =============================================

async function handleLogin() {
    var username = document.getElementById('loginUsername').value.trim();
    var password = document.getElementById('loginPassword').value.trim();
    
    console.log('🔐 Mencoba login:', username);
    
    if (!username || !password) {
        showToast('⚠️ Masukkan username dan password!', true);
        return;
    }
    
    if (username.length < 3) {
        showToast('⚠️ Username minimal 3 karakter!', true);
        return;
    }
    
    if (password.length < 4) {
        showToast('⚠️ Password minimal 4 karakter!', true);
        return;
    }
    
    showLoading(true);
    
    try {
        // 1. CEK ADMIN (lokal)
        var adminAccounts = [
            { username: 'admin', password: 'admin123', name: 'Administrator' }
        ];
        for (var i = 0; i < adminAccounts.length; i++) {
            if (adminAccounts[i].username.toLowerCase() === username.toLowerCase() && 
                adminAccounts[i].password === password) {
                console.log('✅ Login sebagai Admin');
                sessionStorage.setItem('role', 'admin');
                sessionStorage.setItem('adminName', adminAccounts[i].name);
                showToast('✅ Selamat datang Admin!', false);
                showLoading(false);
                setTimeout(function() {
                    window.location.href = 'admin.html';
                }, 500);
                return;
            }
        }
        
        // 2. CEK PENGELOLA BSU
        var bsu = await validateBSULoginSupabase(username, password);
        if (bsu) {
            console.log('✅ Login sebagai Pengelola:', bsu.nama);
            sessionStorage.setItem('role', 'pengelola');
            sessionStorage.setItem('bsuId', bsu.id);
            sessionStorage.setItem('bsuNama', bsu.nama);
            sessionStorage.setItem('bsuRw', bsu.rw);
            sessionStorage.setItem('bsuRt', bsu.rt);
            sessionStorage.setItem('bsuKetua', bsu.ketua);
            showToast('✅ Selamat datang Pengelola ' + bsu.nama + '!', false);
            showLoading(false);
            setTimeout(function() {
                window.location.href = 'pengelola.html';
            }, 500);
            return;
        }
        
        // 3. CEK NASABAH
        var nasabah = await validateNasabahLoginSupabase(username, password);
        if (nasabah) {
            console.log('✅ Login sebagai Nasabah:', nasabah.nama);
            sessionStorage.setItem('role', 'nasabah');
            sessionStorage.setItem('nasabahId', nasabah.id);
            sessionStorage.setItem('nasabahNama', nasabah.nama);
            sessionStorage.setItem('nasabahBsuId', nasabah.bsu_id);
            showToast('✅ Selamat datang ' + nasabah.nama + '!', false);
            showLoading(false);
            setTimeout(function() {
                window.location.href = 'nasabah.html';
            }, 500);
            return;
        }
        
        // 4. GAGAL LOGIN
        console.log('❌ Login gagal untuk:', username);
        showToast('❌ Username atau password salah!', true);
        showLoading(false);
        
    } catch (error) {
        console.error('❌ Error login:', error);
        showToast('⚠️ Terjadi kesalahan, coba lagi!', true);
        showLoading(false);
    }
}

// =============================================
// VALIDASI LOGIN SUPABASE
// =============================================

async function validateBSULoginSupabase(username, password) {
    try {
        if (window.db && window.db.getBSUByUsername) {
            const data = await window.db.getBSUByUsername(username);
            if (data && data.password === password) {
                return data;
            }
        }
    } catch (e) {
        console.log('Fallback ke data lokal BSU');
    }
    
    // Fallback ke data lokal
    var bsuData = window.dataBSU || [];
    for (var i = 0; i < bsuData.length; i++) {
        if (bsuData[i].username && bsuData[i].username.toLowerCase() === username.toLowerCase()) {
            if (bsuData[i].password === password) {
                return bsuData[i];
            }
            return null;
        }
    }
    return null;
}

async function validateNasabahLoginSupabase(username, password) {
    try {
        if (window.db && window.db.getNasabahByUsername) {
            const data = await window.db.getNasabahByUsername(username);
            if (data && data.password === password) {
                return data;
            }
        }
    } catch (e) {
        console.log('Fallback ke data lokal Nasabah');
    }
    
    // Fallback ke data lokal
    var nasabahList = window.daftarNasabah || [];
    for (var i = 0; i < nasabahList.length; i++) {
        if (nasabahList[i].username && nasabahList[i].username.toLowerCase() === username.toLowerCase()) {
            if (nasabahList[i].password === password) {
                return nasabahList[i];
            }
            return null;
        }
    }
    return null;
}

// =============================================
// MODAL DAFTAR
// =============================================

function bukaModalDaftar() {
    console.log('📝 Membuka modal daftar');
    var modal = document.getElementById('modalDaftar');
    if (modal) {
        modal.style.display = 'flex';
        loadBSUOptions();
        return;
    }
    buatModalDaftar();
}

function buatModalDaftar() {
    var oldModal = document.getElementById('modalDaftar');
    if (oldModal) oldModal.remove();
    
    var modalHTML = `
        <div id="modalDaftar" class="modal-overlay" onclick="if(event.target===this) tutupModalDaftar()">
            <div class="modal-content" style="max-width:480px;max-height:90vh;overflow-y:auto;">
                <div class="modal-header">
                    <h3><i class="fa-solid fa-user-plus"></i> Daftar Akun Nasabah</h3>
                    <button class="modal-close" onclick="tutupModalDaftar()">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="daftarSuccess" style="display:none;background:#dcfce7;color:#15803d;padding:10px 12px;border-radius:8px;margin-bottom:12px;text-align:center;font-size:12px;font-weight:600;border:1px solid #86efac;"></div>
                    <div id="daftarError" style="display:none;background:#fecaca;color:#dc2626;padding:10px 12px;border-radius:8px;margin-bottom:12px;text-align:center;font-size:12px;font-weight:600;border:1px solid #f87171;"></div>
                    <div class="form-group">
                        <label>Nama Lengkap <span style="color:red;">*</span></label>
                        <input type="text" id="daftarNama" class="form-control" placeholder="Masukkan nama lengkap">
                        <small style="color:#94a3b8;font-size:9px;">Nama akan digunakan untuk identifikasi di BSU</small>
                    </div>
                    <div class="form-group">
                        <label>Username <span style="color:red;">*</span></label>
                        <input type="text" id="daftarUsername" class="form-control" placeholder="Pilih username unik">
                        <small style="color:#94a3b8;font-size:9px;">Minimal 3 karakter, huruf/angka/underscore</small>
                    </div>
                    <div class="form-group">
                        <label>Password <span style="color:red;">*</span></label>
                        <input type="password" id="daftarPassword" class="form-control" placeholder="Buat password (min 4 karakter)">
                    </div>
                    <div class="form-group">
                        <label>Konfirmasi Password <span style="color:red;">*</span></label>
                        <input type="password" id="daftarPasswordConfirm" class="form-control" placeholder="Konfirmasi password">
                    </div>
                    <div class="form-group">
                        <label>Pilih BSU <span style="color:red;">*</span></label>
                        <select id="daftarBSU" class="form-control">
                            <option value="">-- Pilih BSU --</option>
                        </select>
                        <small style="color:#94a3b8;font-size:9px;">Pilih BSU tempat Anda akan menabung sampah</small>
                    </div>
                    <div class="form-row">
                        <div class="form-group half">
                            <label>RW <span style="color:red;">*</span></label>
                            <input type="text" id="daftarRW" class="form-control" placeholder="Contoh: RW01" readonly>
                            <small style="color:#94a3b8;font-size:9px;">Akan terisi otomatis dari BSU</small>
                        </div>
                        <div class="form-group half">
                            <label>RT <span style="color:red;">*</span></label>
                            <input type="text" id="daftarRT" class="form-control" placeholder="Contoh: RT01" readonly>
                            <small style="color:#94a3b8;font-size:9px;">Akan terisi otomatis dari BSU</small>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Ketua BSU</label>
                        <input type="text" id="daftarKetua" class="form-control" readonly>
                        <small style="color:#94a3b8;font-size:9px;">Akan terisi otomatis dari BSU</small>
                    </div>
                    <div class="form-group">
                        <label>Alamat</label>
                        <textarea id="daftarAlamat" class="form-control" placeholder="Masukkan alamat lengkap" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <label>No. HP</label>
                        <input type="text" id="daftarNoHP" class="form-control" placeholder="Masukkan nomor HP aktif">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="tutupModalDaftar()">Batal</button>
                    <button class="btn-primary" onclick="daftarNasabah()">
                        <i class="fa-solid fa-user-plus"></i> Daftar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    var div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);
    
    loadBSUOptions();
    setupDaftarEvents();
}

function setupDaftarEvents() {
    var bsuSelect = document.getElementById('daftarBSU');
    if (bsuSelect) {
        bsuSelect.onchange = function() {
            var selected = this.options[this.selectedIndex];
            var rwField = document.getElementById('daftarRW');
            var rtField = document.getElementById('daftarRT');
            var ketuaField = document.getElementById('daftarKetua');
            
            if (selected && selected.value) {
                if (rwField) rwField.value = selected.dataset.rw || '';
                if (rtField) rtField.value = selected.dataset.rt || '';
                if (ketuaField) ketuaField.value = selected.dataset.ketua || '';
            } else {
                if (rwField) rwField.value = '';
                if (rtField) rtField.value = '';
                if (ketuaField) ketuaField.value = '';
            }
        };
    }
}

function tutupModalDaftar() {
    var modal = document.getElementById('modalDaftar');
    if (modal) modal.style.display = 'none';
}

async function loadBSUOptions() {
    var select = document.getElementById('daftarBSU');
    if (!select) return;
    
    try {
        // Coba dari Supabase dulu
        if (window.db && window.db.getBSU) {
            const data = await window.db.getBSU();
            if (data && data.length > 0) {
                select.innerHTML = '<option value="">-- Pilih BSU --</option>';
                for (var i = 0; i < data.length; i++) {
                    var bsu = data[i];
                    var label = bsu.nama + ' (RW ' + bsu.rw + ' - RT ' + bsu.rt + ') - Ketua: ' + bsu.ketua;
                    select.innerHTML += '<option value="' + bsu.id + '" data-rw="' + bsu.rw + '" data-rt="' + bsu.rt + '" data-ketua="' + bsu.ketua + '">' + label + '</option>';
                }
                return;
            }
        }
    } catch (e) {
        console.log('Fallback ke data lokal BSU options');
    }
    
    // Fallback ke data lokal
    loadBSUOptionsLocal(select);
}

function loadBSUOptionsLocal(select) {
    var bsuData = window.dataBSU || [];
    select.innerHTML = '<option value="">-- Pilih BSU --</option>';
    for (var i = 0; i < bsuData.length; i++) {
        var bsu = bsuData[i];
        var label = bsu.nama + ' (RW ' + bsu.rw + ' - RT ' + bsu.rt + ') - Ketua: ' + bsu.ketua;
        select.innerHTML += '<option value="' + bsu.id + '" data-rw="' + bsu.rw + '" data-rt="' + bsu.rt + '" data-ketua="' + bsu.ketua + '">' + label + '</option>';
    }
}

// =============================================
// PROSES DAFTAR NASABAH
// =============================================

// login.js - Bagian daftarNasabah yang diperbaiki

async function daftarNasabah() {
    // ... validasi sama seperti sebelumnya ...
    
    // ===== SIMPAN DATA =====
    showLoading(true);
    
    var newId = 'nasabah_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    var newNasabah = {
        id: newId,
        nama: namaValue,
        username: usernameValue,
        password: passwordValue,
        bsu_id: bsuId,
        rw: rwValue,
        rt: rtValue,
        alamat: alamatValue || '',
        no_hp: noHpValue || '',
        created_at: new Date().toISOString()
    };
    
    try {
        // SIMPAN KE SUPABASE
        if (window.db && window.db.createNasabah) {
            const saved = await window.db.createNasabah(newNasabah);
            console.log('✅ Nasabah tersimpan di Supabase:', saved);
            
            // Update cache lokal
            if (!window.daftarNasabah) window.daftarNasabah = [];
            window.daftarNasabah.push(saved);
            
            showToast('✅ Akun berhasil dibuat! Silakan login.', false);
            
            // Reset form dan tutup modal
            setTimeout(function() {
                tutupModalDaftar();
                // Kosongkan form login, biarkan user isi sendiri
                document.getElementById('loginUsername').value = '';
                document.getElementById('loginPassword').value = '';
                showToast('✅ Silakan login dengan akun baru Anda', false);
            }, 1500);
            
        } else {
            // Fallback ke lokal
            console.warn('⚠️ db.createNasabah tidak tersedia, simpan lokal');
            if (!window.daftarNasabah) window.daftarNasabah = [];
            window.daftarNasabah.push(newNasabah);
            showToast('✅ Akun berhasil dibuat (mode offline)!', false);
            setTimeout(function() {
                tutupModalDaftar();
            }, 1500);
        }
        
        showLoading(false);
        
    } catch (error) {
        console.error('❌ Error menyimpan nasabah:', error);
        showToast('⚠️ Gagal mendaftar: ' + error.message, true);
        showLoading(false);
    }
}
// =============================================
// QUICK INFO
// =============================================

function quickInfo(role) {
    console.log('ℹ️ Quick Info:', role);
    
    var infoMessage = '';
    
    if (role === 'nasabah') {
        infoMessage = '📋 Nasabah: daftar dulu jika belum punya akun';
        showToast(infoMessage, false);
    } else if (role === 'pengelola') {
        infoMessage = '🔑 Pengelola BSU: username "mede1", password "mede123"';
        document.getElementById('loginUsername').value = 'mede1';
        document.getElementById('loginPassword').value = 'mede123';
        showToast('✅ Form diisi! Klik Masuk', false);
    } else if (role === 'admin') {
        infoMessage = '🔑 Admin: username "admin", password "admin123"';
        document.getElementById('loginUsername').value = 'admin';
        document.getElementById('loginPassword').value = 'admin123';
        showToast('✅ Form diisi! Klik Masuk', false);
    }
}

// =============================================
// CHECK SESSION
// =============================================

function checkSession() {
    var role = sessionStorage.getItem('role');
    var currentPage = window.location.pathname.split('/').pop();
    console.log('🔍 Check session - Role:', role, 'Page:', currentPage);
    
    if (role === 'nasabah' && (currentPage === 'index.html' || currentPage === '')) {
        window.location.href = 'nasabah.html';
        return;
    }
    if (role === 'pengelola' && (currentPage === 'index.html' || currentPage === '')) {
        window.location.href = 'pengelola.html';
        return;
    }
    if (role === 'admin' && (currentPage === 'index.html' || currentPage === '')) {
        window.location.href = 'admin.html';
        return;
    }
    
    if (!role && currentPage !== 'index.html' && currentPage !== '') {
        window.location.href = 'index.html';
    }
}

// =============================================
// LOGOUT
// =============================================

function logoutUser() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        sessionStorage.clear();
        showToast('✅ Berhasil logout!', false);
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 300);
    }
}

// =============================================
// FUNGSI CEK DATA (DEBUG)
// =============================================

async function cekDataNasabah() {
    console.log('📋 DATA NASABAH TERDAFTAR:');
    
    try {
        if (window.db && window.db.getNasabah) {
            const data = await window.db.getNasabah();
            console.log('📊 Dari Supabase:', data);
            console.log('Total:', data.length, 'nasabah');
            return data;
        }
    } catch (e) {
        var data = window.daftarNasabah || [];
        console.table(data);
        console.log('Total:', data.length, 'nasabah (lokal)');
        return data;
    }
}

// =============================================
// EXPORT KE GLOBAL
// =============================================
window.handleLogin = handleLogin;
window.quickInfo = quickInfo;
window.logoutUser = logoutUser;
window.checkSession = checkSession;
window.bukaModalDaftar = bukaModalDaftar;
window.tutupModalDaftar = tutupModalDaftar;
window.cekDataNasabah = cekDataNasabah;
window.daftarNasabah = daftarNasabah;

console.log('✅ Login Module loaded');
console.log('👤 Admin: admin / admin123');
console.log('👤 BSU: mede1 / mede123');
console.log('📝 Silakan daftar akun nasabah terlebih dahulu!');