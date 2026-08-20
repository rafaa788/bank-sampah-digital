// Manajemen Autentikasi dan Registrasi Khusus Nasabah
function registerNasabah(formData) {
    const { nama, email, password, bsuId, rw, rt } = formData;
    
    // Validasi 1 akun 1 nasabah
    let existingUser = localStorage.getItem('user_' + email);
    if (existingUser) {
        alert("Email atau Akun Nasabah sudah terdaftar!");
        return false;
    }

    const newNasabah = {
        role: 'nasabah',
        nama: nama,
        email: email,
        password: password,
        bsuId: bsuId,
        rw: rw,
        rt: rt,
        saldo: 0,
        createdAt: new Date().toISOString()
    };

    localStorage.setItem('user_' + email, JSON.stringify(newNasabah));
    alert("Pendaftaran Nasabah Berhasil! Silakan Login.");
    return true;
}

function handleLogin(email, password, roleSelected) {
    // Pengelola & Admin tidak memiliki opsi pendaftaran mandiri
    if (roleSelected === 'pengelola' || roleSelected === 'admin') {
        console.log("Verifikasi kredensial terdaftar untuk role:", roleSelected);
        // Pengecekan akun internal Pengelola/Admin
    } else if (roleSelected === 'nasabah') {
        let userData = JSON.parse(localStorage.getItem('user_' + email));
        if (!userData || userData.password !== password) {
            alert("Email/Password Nasabah salah.");
            return false;
        }
        localStorage.setItem('session_active', JSON.stringify(userData));
        window.location.href = 'nasabah-dashboard.html';
    }
}