// auth-local.js
// =============================================
// AUTENTIKASI LOKAL (TANPA SUPABASE)
// =============================================

// =============================================
// LOGIN
// =============================================
function handleLogin() {
    var username = document.getElementById('loginUsername').value.trim();
    var password = document.getElementById('loginPassword').value.trim();
    
    if (!username || !password) {
        showToast('Masukkan username dan password!', true);
        return;
    }
    
    showLoading(true);
    
    // 1. Cek Admin
    var adminAccounts = [
        { username: 'admin', password: 'admin123', name: 'Administrator' }
    ];
    for (var i = 0; i < adminAccounts.length; i++) {
        if (adminAccounts[i].username.toLowerCase() === username.toLowerCase() && 
            adminAccounts[i].password === password) {
            sessionStorage.setItem('role', 'admin');
            sessionStorage.setItem('adminName', adminAccounts[i].name);
            showLoading(false);
            window.location.href = 'admin.html';
            return;
        }
    }
    
    // 2. Cek Pengelola BSU
    var bsu = getBSUByUsername(username);
    if (bsu && bsu.password === password) {
        sessionStorage.setItem('role', 'pengelola');
        sessionStorage.setItem('bsuId', bsu.id);
        sessionStorage.setItem('bsuNama', bsu.nama);
        sessionStorage.setItem('bsuRw', bsu.rw);
        sessionStorage.setItem('bsuRt', bsu.rt);
        showLoading(false);
        window.location.href = 'pengelola.html';
        return;
    }
    
    // 3. Cek Nasabah
    var nasabah = getNasabahByUsername(username);
    if (nasabah && nasabah.password === password) {
        sessionStorage.setItem('role', 'nasabah');
        sessionStorage.setItem('nasabahId', nasabah.id);
        sessionStorage.setItem('nasabahNama', nasabah.nama);
        showLoading(false);
        window.location.href = 'nasabah.html';
        return;
    }
    
    showToast('Username atau password salah!', true);
    showLoading(false);
}

// =============================================
// DAFTAR AKUN NASABAH
// =============================================
function bukaModalDaftar() {
    var modal = document.getElementById('modalDaftar');
    if (modal) {
        modal.style.display = 'flex';
        loadBSUOptions();
        return;
    }
    buatModalDaftar();
}

function buatModalDaftar() {
    var modalHTML = `
        <div id="modalDaftar" class="modal-overlay" onclick="if(event.target===this) tutupModalDaftar()">
            <div class="modal-content" style="max-width:480px;max-height:90vh;overflow-y:auto;">
                <div class="modal-header">
                    <h3><i class="fa-solid fa-user-plus"></i> Daftar Akun Nasabah</h3>
                    <button class="modal-close" onclick="tutupModalDaftar()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Nama Lengkap <span style="color:red;">*</span></label>
                        <input type="text" id="daftarNama" class="form-control" placeholder="Masukkan nama lengkap">
                        <small style="color:#94a3b8;font-size:9px;">Nama akan digunakan untuk identifikasi di BSU</small>
                    </div>
                    <div class="form-group">
                        <label>Username <span style="color:red;">*</span></label>
                        <input type="text" id="daftarUsername" class="form-control" placeholder="Pilih username unik">
                        <small style="color:#94a3b8;font-size:9px;">Minimal 3 karakter, tidak boleh sama dengan pengguna lain</small>
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
                        <label>Alamat</label>
                        <textarea id="daftarAlamat" class="form-control" placeholder="Masukkan alamat lengkap" rows="2"></textarea>
                    </div>
                    <div class="form-group">
                        <label>No. HP</label>
                        <input type="text" id="daftarNoHP" class="form-control" placeholder="Masukkan nomor HP aktif">
                    </div>
                    <div id="daftarError" style="color:red;font-size:11px;margin-bottom:8px;display:none;"></div>
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
    
    var overlay = document.createElement('div');
    overlay.innerHTML = modalHTML;
    document.body.appendChild(overlay.firstElementChild);
    loadBSUOptions();
    setupDaftarEvents();
}

function setupDaftarEvents() {
    var bsuSelect = document.getElementById('daftarBSU');
    if (bsuSelect) {
        bsuSelect.addEventListener('change', function() {
            var selected = this.options[this.selectedIndex];
            if (selected && selected.value) {
                document.getElementById('daftarRW').value = selected.dataset.rw || '';
                document.getElementById('daftarRT').value = selected.dataset.rt || '';
            } else {
                document.getElementById('daftarRW').value = '';
                document.getElementById('daftarRT').value = '';
            }
        });
    }
    
    var inputs = document.querySelectorAll('#modalDaftar .form-control');
    inputs.forEach(function(input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                daftarNasabah();
            }
        });
    });
}

function loadBSUOptions() {
    var select = document.getElementById('daftarBSU');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Pilih BSU --</option>';
    for (var i = 0; i < dataBSU.length; i++) {
        var bsu = dataBSU[i];
        var label = bsu.nama;
        if (bsu.rw) label += ' (RW ' + bsu.rw;
        if (bsu.rt) label += ' - RT ' + bsu.rt;
        label += ')';
        if (bsu.ketua) label += ' - Ketua: ' + bsu.ketua;
        
        select.innerHTML += `<option value="${bsu.id}" data-rw="${bsu.rw || ''}" data-rt="${bsu.rt || ''}">
            ${label}
        </option>`;
    }
    
    if (dataBSU.length > 0) {
        select.value = dataBSU[0].id;
        var event = new Event('change');
        select.dispatchEvent(event);
    }
}

function tutupModalDaftar() {
    var modal = document.getElementById('modalDaftar');
    if (modal) modal.style.display = 'none';
}

function daftarNasabah() {
    var errorEl = document.getElementById('daftarError');
    errorEl.style.display = 'none';
    errorEl.textContent = '';
    
    var nama = document.getElementById('daftarNama').value.trim();
    var username = document.getElementById('daftarUsername').value.trim();
    var password = document.getElementById('daftarPassword').value;
    var passwordConfirm = document.getElementById('daftarPasswordConfirm').value;
    var bsuId = document.getElementById('daftarBSU').value;
    var rw = document.getElementById('daftarRW').value.trim();
    var rt = document.getElementById('daftarRT').value.trim();
    var alamat = document.getElementById('daftarAlamat').value.trim();
    var noHp = document.getElementById('daftarNoHP').value.trim();
    
    // Validasi
    var errors = [];
    if (!nama) errors.push('Nama lengkap wajib diisi');
    if (nama.length < 3) errors.push('Nama minimal 3 karakter');
    if (!username) errors.push('Username wajib diisi');
    if (username.length < 3) errors.push('Username minimal 3 karakter');
    if (!password) errors.push('Password wajib diisi');
    if (password.length < 4) errors.push('Password minimal 4 karakter');
    if (password !== passwordConfirm) errors.push('Password tidak cocok');
    if (!bsuId) errors.push('Pilih BSU terlebih dahulu');
    if (!rw) errors.push('RW tidak valid');
    if (!rt) errors.push('RT tidak valid');
    
    // Cek username duplikat
    if (username) {
        var existing = getNasabahByUsername(username);
        if (existing) errors.push('Username "' + username + '" sudah digunakan');
    }
    
    // Cek nama duplikat di BSU yang sama
    if (nama && bsuId) {
        var existingNames = daftarNasabah.filter(function(n) {
            return n.bsuId === bsuId && n.nama.toLowerCase() === nama.toLowerCase();
        });
        if (existingNames.length > 0) errors.push('Nama "' + nama + '" sudah terdaftar di BSU ini');
    }
    
    if (errors.length > 0) {
        errorEl.textContent = '⚠️ ' + errors.join(' | ');
        errorEl.style.display = 'block';
        return;
    }
    
    // Buat ID baru
    var newId = 'nasabah_' + Date.now();
    var newNasabah = {
        id: newId,
        nama: nama,
        username: username,
        password: password,
        bsuId: bsuId,
        rw: rw,
        rt: rt,
        alamat: alamat || '',
        noHp: noHp || ''
    };
    
    daftarNasabah.push(newNasabah);
    
    showToast('✅ Akun berhasil dibuat! Silakan login.', false);
    tutupModalDaftar();
    
    document.getElementById('loginUsername').value = username;
    document.getElementById('loginPassword').value = '';
    
    // Reset form
    document.getElementById('daftarNama').value = '';
    document.getElementById('daftarUsername').value = '';
    document.getElementById('daftarPassword').value = '';
    document.getElementById('daftarPasswordConfirm').value = '';
    document.getElementById('daftarRW').value = '';
    document.getElementById('daftarRT').value = '';
    document.getElementById('daftarAlamat').value = '';
    document.getElementById('daftarNoHP').value = '';
}

// =============================================
// QUICK LOGIN
// =============================================
function quickLogin(role) {
    if (role === 'nasabah') {
        document.getElementById('loginUsername').value = 'sarah123';
        document.getElementById('loginPassword').value = 'sarah123';
        handleLogin();
    } else if (role === 'pengelola') {
        document.getElementById('loginUsername').value = 'mede1';
        document.getElementById('loginPassword').value = 'mede123';
        handleLogin();
    } else if (role === 'admin') {
        document.getElementById('loginUsername').value = 'admin';
        document.getElementById('loginPassword').value = 'admin123';
        handleLogin();
    }
}

// =============================================
// LOGOUT
// =============================================
function logoutUser() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

// =============================================
// CHECK SESSION
// =============================================
function checkSession() {
    var role = sessionStorage.getItem('role');
    var currentPage = window.location.pathname.split('/').pop();
    
    if (role === 'nasabah' && currentPage !== 'nasabah.html' && currentPage !== 'index.html') {
        window.location.href = 'nasabah.html';
    } else if (role === 'pengelola' && currentPage !== 'pengelola.html' && currentPage !== 'index.html') {
        window.location.href = 'pengelola.html';
    } else if (role === 'admin' && currentPage !== 'admin.html' && currentPage !== 'index.html') {
        window.location.href = 'admin.html';
    }
}

// =============================================
// FUNGSI BANTUAN
// =============================================
function getNasabahByUsername(username) {
    for (var i = 0; i < daftarNasabah.length; i++) {
        if (daftarNasabah[i].username && daftarNasabah[i].username.toLowerCase() === username.toLowerCase()) {
            return daftarNasabah[i];
        }
    }
    return null;
}

function showLoading(show) {
    var loading = document.getElementById('loadingIndicator');
    if (!loading) {
        var div = document.createElement('div');
        div.id = 'loadingIndicator';
        div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:none;justify-content:center;align-items:center;z-index:9999;';
        div.innerHTML = '<div style="background:white;padding:20px 30px;border-radius:12px;text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="font-size:28px;color:#0d9488;"></i><p style="margin-top:10px;font-size:13px;color:#1e293b;">Memproses...</p></div>';
        document.body.appendChild(div);
        loading = div;
    }
    loading.style.display = show ? 'flex' : 'none';
}

// =============================================
// INIT
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    checkSession();
    
    // Enter key support for login
    var loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
    
    var loginUsername = document.getElementById('loginUsername');
    if (loginUsername) {
        loginUsername.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
});

// Export
window.handleLogin = handleLogin;
window.quickLogin = quickLogin;
window.logoutUser = logoutUser;
window.checkSession = checkSession;
window.bukaModalDaftar = bukaModalDaftar;
window.tutupModalDaftar = tutupModalDaftar;
window.daftarNasabah = daftarNasabah;
window.showLoading = showLoading;

console.log('✅ Auth Local loaded');