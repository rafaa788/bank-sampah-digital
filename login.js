// login.js
// =====================================================
// FUNGSI LOGIN - NASABAH LANGSUNG MASUK
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
        
        // 3. CEK NASABAH - AUTO CREATE JIKA BELUM ADA
        var nasabah = await getOrCreateNasabah(username, password);
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
// FUNGSI GET OR CREATE NASABAH (OTOMATIS)
// =============================================

async function getOrCreateNasabah(username, password) {
    var existing = await validateNasabahLoginSupabase(username, password);
    if (existing) {
        return existing;
    }
    
    console.log('📝 Membuat akun nasabah otomatis untuk:', username);
    
    var newId = 'nasabah_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    var newNasabah = {
        id: newId,
        nama: username.charAt(0).toUpperCase() + username.slice(1),
        username: username.toLowerCase(),
        password: password,
        bsu_id: 'bsu_mede1',
        rw: 'RW01',
        rt: 'RT01',
        alamat: '',
        no_hp: '',
        created_at: new Date().toISOString()
    };
    
    try {
        if (window.db && window.db.createNasabah) {
            const saved = await window.db.createNasabah(newNasabah);
            console.log('✅ Nasabah otomatis tersimpan di Supabase:', saved);
            if (!window.daftarNasabah) window.daftarNasabah = [];
            window.daftarNasabah.push(saved);
            return saved;
        } else {
            console.warn('⚠️ db.createNasabah tidak tersedia, simpan lokal');
            if (!window.daftarNasabah) window.daftarNasabah = [];
            window.daftarNasabah.push(newNasabah);
            return newNasabah;
        }
    } catch (error) {
        console.error('❌ Error menyimpan nasabah otomatis:', error);
        return null;
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
// QUICK LOGIN
// =============================================

function quickLogin(role) {
    if (role === 'nasabah') {
        // NASABAH: LANGSUNG MASUK TANPA PASSWORD
        var randomName = 'Nasabah_' + Math.floor(Math.random() * 1000);
        var username = 'user' + Date.now();
        var password = 'user123';
        
        var newId = 'nasabah_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        var newNasabah = {
            id: newId,
            nama: randomName,
            username: username,
            password: password,
            bsu_id: 'bsu_mede1',
            rw: 'RW01',
            rt: 'RT01',
            alamat: '',
            no_hp: '',
            created_at: new Date().toISOString()
        };
        
        if (!window.daftarNasabah) window.daftarNasabah = [];
        window.daftarNasabah.push(newNasabah);
        
        sessionStorage.setItem('role', 'nasabah');
        sessionStorage.setItem('nasabahId', newId);
        sessionStorage.setItem('nasabahNama', randomName);
        sessionStorage.setItem('nasabahBsuId', 'bsu_mede1');
        
        showToast('✅ Selamat datang ' + randomName + '!', false);
        
        setTimeout(function() {
            window.location.href = 'nasabah.html';
        }, 300);
        
    } else if (role === 'pengelola') {
        // PENGELOLA: TIDAK MENGISI FORM, HANYA FOKUS KE INPUT USERNAME
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginUsername').focus();
        showToast('🔑 Masukkan username dan password Pengelola', false);
        
    } else if (role === 'admin') {
        // ADMIN: TIDAK MENGISI FORM, HANYA FOKUS KE INPUT USERNAME
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginUsername').focus();
        showToast('🔑 Masukkan username dan password Admin', false);
    }
}

// =============================================
// FUNGSI LAINNYA
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

function showLoading(show) {
    var loading = document.getElementById('loadingIndicator');
    if (!loading) {
        var div = document.createElement('div');
        div.id = 'loadingIndicator';
        div.innerHTML = `
            <div class="loading-box">
                <div class="loading-spinner"></div>
                <div class="loading-text">Memproses...</div>
            </div>
        `;
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
// EXPORT KE GLOBAL
// =============================================
window.handleLogin = handleLogin;
window.quickLogin = quickLogin;
window.logoutUser = logoutUser;
window.checkSession = checkSession;
window.cekDataNasabah = cekDataNasabah;
window.showLoading = showLoading;

console.log('✅ Login Module loaded');
console.log('👤 Nasabah: klik tombol Nasabah langsung masuk!');
console.log('👤 Admin: admin / admin123 (isi manual)');
console.log('👤 BSU: mede1 / mede123 (isi manual)');