// login.js
// =====================================================
// LOGIN DENGAN SUPABASE
// =====================================================

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
        var bsu = await validateBSULogin(username, password);
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
        var nasabah = await validateNasabahLogin(username, password);
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
        
        // 4. BUAT NASABAH BARU (jika belum ada)
        var newNasabah = await createNasabahOtomatis(username, password);
        if (newNasabah) {
            console.log('✅ Nasabah baru dibuat:', newNasabah.nama);
            sessionStorage.setItem('role', 'nasabah');
            sessionStorage.setItem('nasabahId', newNasabah.id);
            sessionStorage.setItem('nasabahNama', newNasabah.nama);
            sessionStorage.setItem('nasabahBsuId', newNasabah.bsu_id);
            showToast('✅ Selamat datang ' + newNasabah.nama + '! (Akun baru)', false);
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
        showToast('⚠️ Terjadi kesalahan: ' + error.message, true);
        showLoading(false);
    }
}

async function validateBSULogin(username, password) {
    try {
        if (window.db && window.db.getBSUByUsername) {
            const data = await window.db.getBSUByUsername(username);
            if (data && data.password === password) {
                return data;
            }
        }
    } catch (e) {
        console.log('⚠️ Gagal cek BSU:', e.message);
    }
    return null;
}

async function validateNasabahLogin(username, password) {
    try {
        if (window.db && window.db.getNasabahByUsername) {
            const data = await window.db.getNasabahByUsername(username);
            if (data && data.password === password) {
                return data;
            }
        }
    } catch (e) {
        console.log('⚠️ Gagal cek Nasabah:', e.message);
    }
    return null;
}

async function createNasabahOtomatis(username, password) {
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
        is_manual: true,
        created_at: new Date().toISOString()
    };
    
    try {
        if (window.db && window.db.createNasabah) {
            const saved = await window.db.createNasabah(newNasabah);
            if (saved) {
                if (!window.daftarNasabah) window.daftarNasabah = [];
                window.daftarNasabah.push(saved);
                return saved;
            }
        }
    } catch (e) {
        console.error('❌ Gagal buat nasabah:', e.message);
    }
    
    if (!window.daftarNasabah) window.daftarNasabah = [];
    window.daftarNasabah.push(newNasabah);
    return newNasabah;
}

function quickLogin(role) {
    if (role === 'nasabah') {
        var randomName = 'Nasabah_' + Math.floor(Math.random() * 1000);
        var username = 'user' + Date.now();
        var password = 'user123';
        
        createNasabahOtomatis(username, password).then(function(nasabah) {
            sessionStorage.setItem('role', 'nasabah');
            sessionStorage.setItem('nasabahId', nasabah.id);
            sessionStorage.setItem('nasabahNama', nasabah.nama);
            sessionStorage.setItem('nasabahBsuId', nasabah.bsu_id);
            showToast('✅ Selamat datang ' + nasabah.nama + '!', false);
            setTimeout(function() {
                window.location.href = 'nasabah.html';
            }, 300);
        });
        
    } else if (role === 'pengelola') {
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginUsername').focus();
        showToast('🔑 Masukkan username dan password Pengelola (mede1 / mede123)', false);
        
    } else if (role === 'admin') {
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginUsername').focus();
        showToast('🔑 Masukkan username dan password Admin (admin / admin123)', false);
    }
}

function checkSession() {
    var role = sessionStorage.getItem('role');
    var currentPage = window.location.pathname.split('/').pop();
    
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

window.handleLogin = handleLogin;
window.quickLogin = quickLogin;
window.logoutUser = logoutUser;
window.checkSession = checkSession;
window.showLoading = showLoading;

console.log('✅ Login Module loaded with Supabase');