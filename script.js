let currentSelectedRole = 'nasabah';

function switchRole(role) {
  currentSelectedRole = role;
  
  // Ubah tampilan tombol aktif
  const buttons = document.querySelectorAll('.role-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  event.currentTarget.classList.add('active');
}

function login() {
  // Sembunyikan layar login
  document.getElementById('login-screen').classList.remove('active');
  
  // Tampilkan layar berdasarkan peran yang dipilih
  if (currentSelectedRole === 'nasabah') {
    document.getElementById('nasabah-screen').classList.add('active');
  } else if (currentSelectedRole === 'pengelola') {
    document.getElementById('pengelola-screen').classList.add('active');
  } else if (currentSelectedRole === 'admin') {
    document.getElementById('admin-screen').classList.add('active');
  }

  // Tampilkan Bottom Navigation Bar
  document.getElementById('bottom-nav').style.display = 'flex';
}

function logout() {
  // Sembunyikan semua layar dashboard
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Sembunyikan Bottom Nav & Tampilkan Login
  document.getElementById('bottom-nav').style.display = 'none';
  document.getElementById('login-screen').classList.add('active');
}