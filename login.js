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
        // 1. CEK ADMIN
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

function tutupModalDaftar() {
    var modal = document.getElementById('modalDaftar');
    if (modal) modal.style.display = 'none';
}

// =============================================
// PROSES DAFTAR NASABAH (LENGKAP)
// =============================================

async function daftarNasabah() {
    console.log('📝 Proses registrasi nasabah...');
    
    var errorEl = document.getElementById('daftarError');
    var successEl = document.getElementById('daftarSuccess');
    
    if (!errorEl) {
        console.error('❌ Element daftarError tidak ditemukan!');
        showToast('⚠️ Error sistem, silakan refresh halaman!', true);
        return;
    }
    
    errorEl.style.display = 'none';
    errorEl.textContent = '';
    if (successEl) {
        successEl.style.display = 'none';
        successEl.textContent = '';
    }
    
    var namaField = document.getElementById('daftarNama');
    var usernameField = document.getElementById('daftarUsername');
    var passwordField = document.getElementById('daftarPassword');
    var passwordConfirmField = document.getElementById('daftarPasswordConfirm');
    var bsuSelect = document.getElementById('daftarBSU');
    var rwField = document.getElementById('daftarRW');
    var rtField = document.getElementById('daftarRT');
    var alamatField = document.getElementById('daftarAlamat');
    var noHpField = document.getElementById('daftarNoHP');
    
    if (!namaField || !usernameField || !passwordField || !passwordConfirmField || !bsuSelect) {
        showToast('⚠️ Error form, silakan refresh halaman!', true);
        return;
    }
    
    var namaValue = namaField.value.trim();
    var usernameValue = usernameField.value.trim();
    var passwordValue = passwordField.value;
    var passwordConfirmValue = passwordConfirmField.value;
    var bsuId = bsuSelect.value;
    var rwValue = rwField ? rwField.value.trim() : '';
    var rtValue = rtField ? rtField.value.trim() : '';
    var alamatValue = alamatField ? alamatField.value.trim() : '';
    var noHpValue = noHpField ? noHpField.value.trim() : '';
    
    console.log('📋 Data form:', { 
        nama: namaValue, 
        username: usernameValue, 
        bsuId: bsuId
    });
    
    var errors = [];
    
    if (!namaValue) errors.push('Nama lengkap wajib diisi');
    else if (namaValue.length < 3) errors.push('Nama minimal 3 karakter');
    
    if (!usernameValue) errors.push('Username wajib diisi');
    else if (usernameValue.length < 3) errors.push('Username minimal 3 karakter');
    else if (!/^[a-zA-Z0-9_]+$/.test(usernameValue)) errors.push('Username hanya boleh huruf, angka, dan underscore');
    
    if (!passwordValue) errors.push('Password wajib diisi');
    else if (passwordValue.length < 4) errors.push('Password minimal 4 karakter');
    
    if (passwordValue !== passwordConfirmValue) errors.push('Password tidak cocok');
    
    if (!bsuId) errors.push('Pilih BSU terlebih dahulu');
    
    if (errors.length > 0) {
        errorEl.textContent = '⚠️ ' + errors.join(' | ');
        errorEl.style.display = 'block';
        showToast('⚠️ ' + errors[0], true);
        return;
    }
    
    showLoading(true);
    
    var newId = 'nasabah_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    var newNasabah = {
        id: newId,
        nama: namaValue,
        username: usernameValue.toLowerCase(),
        password: passwordValue,
        bsu_id: bsuId,
        rw: rwValue,
        rt: rtValue,
        alamat: alamatValue || '',
        no_hp: noHpValue || '',
        created_at: new Date().toISOString()
    };
    
    try {
        if (window.db && window.db.createNasabah) {
            const saved = await window.db.createNasabah(newNasabah);
            console.log('✅ Nasabah tersimpan di Supabase:', saved);
            
            if (!window.daftarNasabah) window.daftarNasabah = [];
            window.daftarNasabah.push(saved);
            
            showToast('✅ Akun berhasil dibuat! Silakan login.', false);
            
            setTimeout(function() {
                tutupModalDaftar();
                document.getElementById('loginUsername').value = usernameValue.toLowerCase();
                document.getElementById('loginPassword').value = '';
                showToast('✅ Silakan login dengan username: ' + usernameValue.toLowerCase(), false);
            }, 1500);
        } else {
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
// CHECK SESSION, LOGOUT, DLL
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

function logoutUser() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        sessionStorage.clear();
        showToast('✅ Berhasil logout!', false);
        setTimeout(function() {
            window.location.href = 'index.html';
        }, 300);
    }
}

function quickInfo(role) {
    console.log('ℹ️ Quick Info:', role);
    
    if (role === 'nasabah') {
        showToast('📋 Nasabah: daftar dulu jika belum punya akun', false);
    } else if (role === 'pengelola') {
        document.getElementById('loginUsername').value = 'mede1';
        document.getElementById('loginPassword').value = 'mede123';
        showToast('✅ Form diisi! Klik Masuk', false);
    } else if (role === 'admin') {
        document.getElementById('loginUsername').value = 'admin';
        document.getElementById('loginPassword').value = 'admin123';
        showToast('✅ Form diisi! Klik Masuk', false);
    }
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

function cekDataNasabah() {
    console.log('📋 DATA NASABAH TERDAFTAR:');
    var data = window.daftarNasabah || [];
    console.table(data);
    console.log('Total:', data.length, 'nasabah');
    return data;
}

// =============================================
// LOAD BSU OPTIONS
// =============================================

async function loadBSUOptions() {
    var select = document.getElementById('daftarBSU');
    if (!select) return;
    
    try {
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
    
    var bsuData = window.dataBSU || [];
    select.innerHTML = '<option value="">-- Pilih BSU --</option>';
    for (var i = 0; i < bsuData.length; i++) {
        var bsu = bsuData[i];
        var label = bsu.nama + ' (RW ' + bsu.rw + ' - RT ' + bsu.rt + ') - Ketua: ' + bsu.ketua;
        select.innerHTML += '<option value="' + bsu.id + '" data-rw="' + bsu.rw + '" data-rt="' + bsu.rt + '" data-ketua="' + bsu.ketua + '">' + label + '</option>';
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
window.daftarNasabah = daftarNasabah;  // ← INI PENTING!
window.loadBSUOptions = loadBSUOptions;

console.log('✅ Login Module loaded');
console.log('👤 Admin: admin / admin123');
console.log('👤 BSU: mede1 / mede123');
console.log('📝 Silakan daftar akun nasabah terlebih dahulu!');