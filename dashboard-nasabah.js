// dashboard-nasabah.js
// =====================================================
// DASHBOARD NASABAH - LENGKAP DENGAN FITUR TAMBAHAN
// =====================================================

var nasabahAktif = null;
var filterRiwayat = 'all';

function renderNasabah() {
    var nasabahId = sessionStorage.getItem('nasabahId');
    if (!nasabahId) {
        showToast('Sesi tidak valid, silakan login ulang', true);
        return;
    }
    
    nasabahAktif = getNasabahById(nasabahId);
    if (!nasabahAktif) {
        showToast('Data nasabah tidak ditemukan! Silakan daftar ulang.', true);
        return;
    }
    
    // Set nama dan greeting
    var namaEl = document.getElementById('nasabahNama');
    if (namaEl) namaEl.textContent = 'Halo, ' + nasabahAktif.nama + '!';
    
    var hour = new Date().getHours();
    var greeting = 'Selamat ';
    if (hour < 12) greeting += 'Pagi';
    else if (hour < 18) greeting += 'Siang';
    else greeting += 'Malam';
    var greetingEl = document.getElementById('nasabahGreeting');
    if (greetingEl) greetingEl.textContent = greeting;
    
    // Set saldo
    var saldo = hitungSaldoNasabah(nasabahAktif.id);
    var saldoEl = document.getElementById('nasabahSaldo');
    if (saldoEl) saldoEl.textContent = 'Rp ' + formatRupiah(saldo);
    
    // Set avatar
    var avatarEl = document.getElementById('nasabahAvatar');
    if (avatarEl) {
        avatarEl.textContent = nasabahAktif.nama.charAt(0);
    }
    
    // Render riwayat transaksi
    renderRiwayatTransaksi();
    
    // Render statistik pribadi
    renderStatistikNasabah();
    
    // Render profil
    renderProfilNasabah();
    
    // Tampilkan info BSU
    var bsu = getBSUById(nasabahAktif.bsuId);
    var infoEl = document.getElementById('nasabahBsuInfo');
    if (infoEl && bsu) {
        infoEl.textContent = '📍 ' + bsu.nama + ' (RW ' + bsu.rw + ' - RT ' + bsu.rt + ')';
    }
}

// =============================================
// STATISTIK NASABAH
// =============================================

function renderStatistikNasabah() {
    if (!nasabahAktif) return;
    
    var transaksi = getTransaksiByNasabah(nasabahAktif.id);
    var totalDiverifikasi = 0;
    var totalBerat = 0;
    var totalNilai = 0;
    
    for (var i = 0; i < transaksi.length; i++) {
        var item = transaksi[i];
        if (item.status === 'diverifikasi') {
            totalDiverifikasi++;
            totalBerat += item.berat;
            totalNilai += item.berat * item.hargaPerKg;
        }
    }
    
    document.getElementById('statTotalTransaksi').textContent = totalDiverifikasi;
    document.getElementById('statTotalBerat').textContent = totalBerat.toFixed(1) + ' kg';
    document.getElementById('statTotalNilai').textContent = 'Rp ' + formatRupiah(totalNilai);
}

// =============================================
// RIWAYAT TRANSAKSI LENGKAP
// =============================================

function renderRiwayatTransaksi() {
    var container = document.getElementById('nasabahRiwayatList');
    if (!container || !nasabahAktif) return;
    
    var transaksi = getTransaksiByNasabah(nasabahAktif.id);
    
    // Filter
    if (filterRiwayat !== 'all') {
        transaksi = transaksi.filter(function(t) {
            return t.status === filterRiwayat;
        });
    }
    
    if (transaksi.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-inbox"></i><p>Belum ada transaksi</p><p style="font-size:10px;color:#94a3b8;margin-top:4px;">💡 Mulai nabung sampah di BSU terdekat</p></div>';
        return;
    }
    
    transaksi.sort(function(a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
    });
    
    var html = '';
    for (var i = 0; i < transaksi.length; i++) {
        var item = transaksi[i];
        var nilai = item.berat * item.hargaPerKg;
        var statusClass = item.status === 'diverifikasi' ? 'badge-success' : 
                         (item.status === 'ditolak' ? 'badge-danger' : 'badge-pending');
        var statusLabel = item.status === 'diverifikasi' ? 'Diverifikasi' :
                         (item.status === 'ditolak' ? 'Ditolak' : 'Menunggu');
        var statusIcon = item.status === 'diverifikasi' ? 'fa-check-circle' :
                        (item.status === 'ditolak' ? 'fa-xmark-circle' : 'fa-clock');
        
        html += '<div class="list-item" style="flex-direction:column;align-items:stretch;cursor:pointer;" onclick="showDetailTransaksi(\'' + item.id + '\')">';
        html += '  <div style="display:flex;justify-content:space-between;align-items:center;">';
        html += '    <div class="list-left">';
        html += '      <div class="list-icon" style="background:' + (item.status === 'diverifikasi' ? '#dcfce7' : (item.status === 'ditolak' ? '#fecaca' : '#fef9c3')) + ';">';
        html += '        <i class="fa-solid ' + statusIcon + '" style="color:' + (item.status === 'diverifikasi' ? '#16a34a' : (item.status === 'ditolak' ? '#dc2626' : '#a16207')) + ';"></i>';
        html += '      </div>';
        html += '      <div>';
        html += '        <div style="font-size:11px;font-weight:600;">' + (item.nama || 'Sampah').substring(0, 30) + '</div>';
        html += '        <div style="font-size:9px;color:#64748b;">' + (item.tanggal || '-') + ' | ' + item.berat + ' kg | Rp ' + formatRupiah(item.hargaPerKg) + '/kg</div>';
        html += '        <div style="font-size:8px;color:#94a3b8;">Ketua: ' + (item.ketua || '-') + '</div>';
        html += '      </div>';
        html += '    </div>';
        html += '    <div style="text-align:right;">';
        html += '      <div style="font-size:11px;font-weight:700;color:' + (item.status === 'diverifikasi' ? '#16a34a' : '#94a3b8') + ';">+ Rp ' + formatRupiah(nilai) + '</div>';
        html += '      <span class="badge ' + statusClass + '">' + statusLabel + '</span>';
        html += '    </div>';
        html += '  </div>';
        
        // Tampilkan foto jika ada
        if (item.foto_timbang || item.foto_hasil || item.foto_bukti) {
            html += '  <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap;">';
            if (item.foto_timbang) {
                html += '    <span style="font-size:8px;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:4px;">📷 Timbang</span>';
            }
            if (item.foto_hasil) {
                html += '    <span style="font-size:8px;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:4px;">📸 Hasil</span>';
            }
            if (item.foto_bukti) {
                html += '    <span style="font-size:8px;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:4px;">📋 Bukti</span>';
            }
            html += '  </div>';
        }
        
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// =============================================
// DETAIL TRANSAKSI (Modal)
// =============================================

function showDetailTransaksi(id) {
    var transaksi = window.daftarSampah || [];
    var item = null;
    for (var i = 0; i < transaksi.length; i++) {
        if (transaksi[i].id === id) {
            item = transaksi[i];
            break;
        }
    }
    
    if (!item) {
        showToast('Data transaksi tidak ditemukan!', true);
        return;
    }
    
    var nilai = item.berat * item.hargaPerKg;
    var statusLabel = item.status === 'diverifikasi' ? 'Diverifikasi' :
                     (item.status === 'ditolak' ? 'Ditolak' : 'Menunggu');
    var statusColor = item.status === 'diverifikasi' ? '#16a34a' :
                     (item.status === 'ditolak' ? '#dc2626' : '#a16207');
    
    var html = `
        <div id="modalDetailTransaksi" class="modal-overlay" style="display:flex;" onclick="if(event.target===this) this.style.display='none'">
            <div class="modal-content" style="max-width:400px;">
                <div class="modal-header">
                    <h3><i class="fa-solid fa-receipt"></i> Detail Transaksi</h3>
                    <button class="modal-close" onclick="document.getElementById('modalDetailTransaksi').style.display='none'">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align:center;margin-bottom:12px;">
                        <div style="font-size:24px;font-weight:700;color:${statusColor};">Rp ${formatRupiah(nilai)}</div>
                        <span class="badge badge-${item.status}">${statusLabel}</span>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:11px;">
                        <div><strong>Nama Sampah</strong></div>
                        <div>${item.nama || '-'}</div>
                        <div><strong>Jenis</strong></div>
                        <div>${item.jenis || 'nonorganik'}</div>
                        <div><strong>Berat</strong></div>
                        <div>${item.berat} kg</div>
                        <div><strong>Harga/kg</strong></div>
                        <div>Rp ${formatRupiah(item.hargaPerKg)}</div>
                        <div><strong>Tanggal</strong></div>
                        <div>${item.tanggal || '-'}</div>
                        <div><strong>BSU</strong></div>
                        <div>${item.bsu || '-'}</div>
                        <div><strong>Ketua</strong></div>
                        <div>${item.ketua || '-'}</div>
                        <div><strong>RW/RT</strong></div>
                        <div>${item.rw || '-'} - ${item.rt || '-'}</div>
                    </div>
                    
                    <!-- Foto -->
                    <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
                        ${item.foto_timbang ? `<img src="${item.foto_timbang}" style="max-width:100px;max-height:100px;border-radius:8px;border:1px solid #e2e8f0;object-fit:cover;">` : ''}
                        ${item.foto_hasil ? `<img src="${item.foto_hasil}" style="max-width:100px;max-height:100px;border-radius:8px;border:1px solid #e2e8f0;object-fit:cover;">` : ''}
                        ${item.foto_bukti ? `<img src="${item.foto_bukti}" style="max-width:100px;max-height:100px;border-radius:8px;border:1px solid #e2e8f0;object-fit:cover;">` : ''}
                    </div>
                    ${(!item.foto_timbang && !item.foto_hasil && !item.foto_bukti) ? '<div style="font-size:9px;color:#94a3b8;text-align:center;margin-top:4px;">Tidak ada foto</div>' : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('modalDetailTransaksi').style.display='none'">Tutup</button>
                    <button class="btn-primary" onclick="cetakBuktiTransaksi('${item.id}')">
                        <i class="fa-solid fa-print"></i> Cetak
                    </button>
                </div>
            </div>
        </div>
    `;
    
    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild);
}

// =============================================
// CETAK BUKTI TRANSAKSI
// =============================================

function cetakBuktiTransaksi(id) {
    var transaksi = window.daftarSampah || [];
    var item = null;
    for (var i = 0; i < transaksi.length; i++) {
        if (transaksi[i].id === id) {
            item = transaksi[i];
            break;
        }
    }
    
    if (!item) {
        showToast('Data transaksi tidak ditemukan!', true);
        return;
    }
    
    var nilai = item.berat * item.hargaPerKg;
    var html = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"><title>Bukti Transaksi</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 10px; }
            .header h1 { color: #0d9488; margin: 0; font-size: 18px; }
            .header p { margin: 4px 0; color: #64748b; font-size: 12px; }
            .content { margin: 15px 0; }
            .row { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed #e2e8f0; font-size: 12px; }
            .total { font-size: 16px; font-weight: bold; color: #0d9488; text-align: center; margin-top: 10px; padding: 8px; background: #f0fdf4; border-radius: 8px; }
            .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
            .status { text-align: center; margin: 10px 0; }
            .status .badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; }
            .badge-diverifikasi { background: #dcfce7; color: #15803d; }
            .badge-menunggu { background: #fef9c3; color: #a16207; }
            .badge-ditolak { background: #fecaca; color: #dc2626; }
        </style>
        </head>
        <body>
            <div class="header">
                <h1>🏦 BANK SAMPAH DIGITAL</h1>
                <p>BSI Mandiri - Desa Gunung Putri</p>
                <p style="font-size:10px;">Bukti Transaksi</p>
            </div>
            <div class="content">
                <div class="row"><span>ID Transaksi</span><span>${item.id.substring(0, 20)}...</span></div>
                <div class="row"><span>Nama Nasabah</span><span>${item.namaNasabah || '-'}</span></div>
                <div class="row"><span>Nama Sampah</span><span>${item.nama || '-'}</span></div>
                <div class="row"><span>Jenis</span><span>${item.jenis || 'nonorganik'}</span></div>
                <div class="row"><span>Berat</span><span>${item.berat} kg</span></div>
                <div class="row"><span>Harga / Kg</span><span>Rp ${formatRupiah(item.hargaPerKg)}</span></div>
                <div class="row"><span>BSU</span><span>${item.bsu || '-'}</span></div>
                <div class="row"><span>RW/RT</span><span>${item.rw || '-'} - ${item.rt || '-'}</span></div>
                <div class="row"><span>Tanggal</span><span>${item.tanggal || '-'}</span></div>
                <div class="row"><span>Ketua</span><span>${item.ketua || '-'}</span></div>
                <div class="total">Total: Rp ${formatRupiah(nilai)}</div>
                <div class="status">
                    <span class="badge badge-${item.status}">${item.status === 'diverifikasi' ? '✅ Diverifikasi' : item.status === 'ditolak' ? '❌ Ditolak' : '⏳ Menunggu'}</span>
                </div>
            </div>
            <div class="footer">
                <p>Dicetak: ${new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
                <p>Terima kasih telah menabung sampah! 🌍</p>
            </div>
            <script>
                window.onload = function() { window.print(); }
            <\/script>
        </body>
        </html>
    `;
    
    var printWindow = window.open('', '_blank', 'width=600,height=600');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
    } else {
        showToast('Popup diblokir! Silakan izinkan popup.', true);
    }
}

// =============================================
// FITUR LAYANAN NASABAH
// =============================================

function nasabahService(service) {
    if (service === 'lokasi') {
        showLokasiBSU();
        return;
    }
    if (service === 'harga') {
        showHargaSampah();
        return;
    }
    if (service === 'nabung') {
        showToast('♻️ Fitur Nabung Sampah - Silakan bawa sampah ke BSU terdekat', false);
        return;
    }
    if (service === 'jemput') {
        bukaModalJemputSampah();
        return;
    }
    if (service === 'profil') {
        showProfilNasabah();
        return;
    }
    if (service === 'riwayat') {
        document.getElementById('nasabahRiwayat').scrollIntoView();
        return;
    }
    showToast('Fitur sedang dikembangkan', false);
}

// =============================================
// MODAL JEMPUT SAMPAH
// =============================================

function bukaModalJemputSampah() {
    var html = `
        <div id="modalJemput" class="modal-overlay" style="display:flex;" onclick="if(event.target===this) this.style.display='none'">
            <div class="modal-content" style="max-width:400px;">
                <div class="modal-header">
                    <h3><i class="fa-solid fa-truck-pickup"></i> Jemput Sampah</h3>
                    <button class="modal-close" onclick="document.getElementById('modalJemput').style.display='none'">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align:center;padding:10px 0;">
                        <i class="fa-solid fa-truck" style="font-size:40px;color:#0d9488;"></i>
                        <p style="margin-top:8px;font-size:13px;color:#1e293b;">Layanan jemput sampah akan segera hadir!</p>
                        <p style="font-size:11px;color:#94a3b8;">Untuk saat ini, silakan bawa sampah langsung ke BSU terdekat.</p>
                    </div>
                    <div style="background:#f1f5f9;padding:10px;border-radius:8px;margin-top:8px;">
                        <div style="font-size:10px;color:#475569;">
                            <strong>📍 BSU Anda:</strong> ${getBSUById(nasabahAktif.bsuId)?.nama || '-'}<br>
                            <strong>Alamat:</strong> RW ${nasabahAktif.rw} - RT ${nasabahAktif.rt}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="document.getElementById('modalJemput').style.display='none'">Tutup</button>
                </div>
            </div>
        </div>
    `;
    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild);
}

// =============================================
// PROFIL NASABAH
// =============================================

function renderProfilNasabah() {
    if (!nasabahAktif) return;
    
    var bsu = getBSUById(nasabahAktif.bsuId);
    var transaksi = getTransaksiByNasabah(nasabahAktif.id);
    var totalDiverifikasi = 0;
    var totalBerat = 0;
    var totalNilai = 0;
    
    for (var i = 0; i < transaksi.length; i++) {
        if (transaksi[i].status === 'diverifikasi') {
            totalDiverifikasi++;
            totalBerat += transaksi[i].berat;
            totalNilai += transaksi[i].berat * transaksi[i].hargaPerKg;
        }
    }
    
    document.getElementById('profilNama').textContent = nasabahAktif.nama;
    document.getElementById('profilBSU').textContent = bsu ? bsu.nama : '-';
    document.getElementById('profilRWRT').textContent = nasabahAktif.rw + ' - ' + nasabahAktif.rt;
    document.getElementById('profilAlamat').textContent = nasabahAktif.alamat || '-';
    document.getElementById('profilNoHP').textContent = nasabahAktif.noHp || '-';
    document.getElementById('profilTotalSetoran').textContent = totalDiverifikasi + ' transaksi | Rp ' + formatRupiah(totalNilai) + ' | ' + totalBerat.toFixed(1) + ' kg';
}

function showProfilNasabah() {
    // Scroll ke profil atau tampilkan modal
    var profilTab = document.getElementById('nasabah-profil');
    if (profilTab) {
        profilTab.scrollIntoView({ behavior: 'smooth' });
    } else {
        // Tampilkan modal profil
        var html = `
            <div id="modalProfil" class="modal-overlay" style="display:flex;" onclick="if(event.target===this) this.style.display='none'">
                <div class="modal-content" style="max-width:400px;">
                    <div class="modal-header">
                        <h3><i class="fa-solid fa-user"></i> Profil Nasabah</h3>
                        <button class="modal-close" onclick="document.getElementById('modalProfil').style.display='none'">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="text-align:center;margin-bottom:12px;">
                            <div style="width:60px;height:60px;border-radius:50%;background:#0d9488;color:white;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto;">
                                ${nasabahAktif.nama.charAt(0)}
                            </div>
                            <div style="font-size:16px;font-weight:700;margin-top:8px;">${nasabahAktif.nama}</div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px;">
                            <div><strong>BSU</strong></div>
                            <div>${getBSUById(nasabahAktif.bsuId)?.nama || '-'}</div>
                            <div><strong>RW/RT</strong></div>
                            <div>${nasabahAktif.rw} - ${nasabahAktif.rt}</div>
                            <div><strong>Alamat</strong></div>
                            <div>${nasabahAktif.alamat || '-'}</div>
                            <div><strong>No. HP</strong></div>
                            <div>${nasabahAktif.noHp || '-'}</div>
                            <div><strong>Username</strong></div>
                            <div>${nasabahAktif.username || '-'}</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="document.getElementById('modalProfil').style.display='none'">Tutup</button>
                    </div>
                </div>
            </div>
        `;
        var div = document.createElement('div');
        div.innerHTML = html;
        document.body.appendChild(div.firstElementChild);
    }
}

// =============================================
// FILTER RIWAYAT
// =============================================

function filterRiwayatTransaksi() {
    var select = document.getElementById('filterRiwayat');
    if (select) {
        filterRiwayat = select.value;
        renderRiwayatTransaksi();
    }
}

// =============================================
// EXPORT RIWAYAT
// =============================================

function exportRiwayatNasabah() {
    if (!nasabahAktif) return;
    
    var transaksi = getTransaksiByNasabah(nasabahAktif.id);
    var diverifikasi = transaksi.filter(function(t) {
        return t.status === 'diverifikasi';
    });
    
    if (diverifikasi.length === 0) {
        showToast('Tidak ada transaksi yang diverifikasi!', true);
        return;
    }
    
    var html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" 
              xmlns:x="urn:schemas-microsoft-com:office:excel" 
              xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; padding: 10px; }
            .title { font-size: 16px; font-weight: bold; text-align: center; }
            .subtitle { text-align: center; color: #666; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #0d9488; color: white; padding: 6px; border: 1px solid #ddd; font-size: 10px; }
            td { padding: 4px 6px; border: 1px solid #ddd; font-size: 10px; text-align: center; }
            .total { background: #f0fdf4; font-weight: bold; }
        </style>
        </head>
        <body>
            <div class="title">🏦 BANK SAMPAH DIGITAL</div>
            <div class="subtitle">Riwayat Transaksi - ${nasabahAktif.nama}</div>
            <div class="subtitle">Periode: ${new Date().toLocaleDateString('id-ID')}</div>
            <table>
                <tr>
                    <th>No</th>
                    <th>Tanggal</th>
                    <th>Nama Sampah</th>
                    <th>Berat (kg)</th>
                    <th>Harga/kg</th>
                    <th>Total</th>
                    <th>Status</th>
                </tr>
    `;
    
    var grandTotal = 0;
    for (var i = 0; i < diverifikasi.length; i++) {
        var item = diverifikasi[i];
        var nilai = item.berat * item.hargaPerKg;
        grandTotal += nilai;
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${item.tanggal || '-'}</td>
                <td>${item.nama || '-'}</td>
                <td>${item.berat.toFixed(1)}</td>
                <td>${formatRupiah(item.hargaPerKg)}</td>
                <td>${formatRupiah(nilai)}</td>
                <td>✅ Diverifikasi</td>
            </tr>
        `;
    }
    
    html += `
                <tr class="total">
                    <td colspan="5" style="text-align:right;">GRAND TOTAL</td>
                    <td>${formatRupiah(grandTotal)}</td>
                    <td></td>
                </tr>
            </table>
            <div style="text-align:center;font-size:10px;color:#94a3b8;margin-top:10px;">
                Total Transaksi: ${diverifikasi.length} | Total Berat: ${diverifikasi.reduce((sum, t) => sum + t.berat, 0).toFixed(1)} kg
            </div>
            <div style="text-align:center;font-size:10px;color:#94a3b8;margin-top:5px;">
                Dicetak: ${new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            </div>
        </body>
        </html>
    `;
    
    downloadExcel(html, 'Riwayat_Transaksi_' + nasabahAktif.nama + '.xls');
    showToast('Riwayat transaksi berhasil diekspor!', false);
}

// =============================================
// EXPORT KE GLOBAL
// =============================================
window.renderNasabah = renderNasabah;
window.nasabahService = nasabahService;
window.filterRiwayatTransaksi = filterRiwayatTransaksi;
window.exportRiwayatNasabah = exportRiwayatNasabah;
window.showDetailTransaksi = showDetailTransaksi;
window.cetakBuktiTransaksi = cetakBuktiTransaksi;

console.log('✅ Dashboard Nasabah loaded ');