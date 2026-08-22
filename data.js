// data.js
// =====================================================
// DATA GLOBAL APLIKASI - REALTIME
// =====================================================

window.daftarNasabah = window.daftarNasabah || [];
window.daftarSampah = window.daftarSampah || [];

// =============================================
// SYNC DATA DARI SUPABASE
// =============================================

async function syncAllData() {
    await syncNasabahFromSupabase();
    await syncTransaksiFromSupabase();
    console.log('✅ All data synced from Supabase');
    return true;
}

async function syncNasabahFromSupabase() {
    try {
        if (window.db && window.db.getNasabah) {
            const data = await window.db.getNasabah();
            if (data && data.length > 0) {
                window.daftarNasabah = data;
                console.log('📥 Synced nasabah:', data.length);
                return data;
            }
        }
    } catch (e) {
        console.log('⚠️ Gagal sync nasabah:', e.message);
    }
    return window.daftarNasabah || [];
}

async function syncTransaksiFromSupabase() {
    try {
        if (window.db && window.db.getTransaksi) {
            const data = await window.db.getTransaksi();
            if (data && data.length > 0) {
                window.daftarSampah = data;
                console.log('📥 Synced transaksi:', data.length);
                return data;
            }
        }
    } catch (e) {
        console.log('⚠️ Gagal sync transaksi:', e.message);
    }
    return window.daftarSampah || [];
}

// =============================================
// FUNGSI GET BSU BY ID - TANPA REKURSI
// =============================================

function getBSUById(id) {
    if (!id) return null;
    
    // 1. Cek di window.dataBSU (data lokal)
    if (window.dataBSU && Array.isArray(window.dataBSU)) {
        for (var i = 0; i < window.dataBSU.length; i++) {
            if (window.dataBSU[i].id === id) {
                return window.dataBSU[i];
            }
        }
    }
    
    // 2. Cek di db (async, tapi kita return null dulu)
    // Ini akan dipanggil async di tempat lain
    return null;
}

// =============================================
// FUNGSI CRUD - REALTIME
// =============================================

async function tambahTransaksi(data) {
    console.log('📝 Menyimpan transaksi...', data);
    
    var newId = data.id || 'trans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    
    // Cari BSU dari data lokal
    var bsu = null;
    if (window.dataBSU && Array.isArray(window.dataBSU)) {
        for (var i = 0; i < window.dataBSU.length; i++) {
            if (window.dataBSU[i].id === data.bsuId || window.dataBSU[i].id === data.bsu_id) {
                bsu = window.dataBSU[i];
                break;
            }
        }
    }
    
    var ketuaBSU = bsu ? bsu.ketua : (data.ketua || 'Ketua BSU');
    
    var transaksi = {
        id: newId,
        nama: data.nama || 'Sampah',
        jenis: data.jenis || 'nonorganik',
        berat: parseFloat(data.berat) || 0,
        harga_per_kg: data.hargaPerKg || data.harga_per_kg || 2000,
        bsu: data.bsu || (bsu ? bsu.nama : 'BSU'),
        bsu_id: data.bsuId || data.bsu_id || 'bsu_mede1',
        rw: data.rw || (bsu ? bsu.rw : 'RW01'),
        rt: data.rt || (bsu ? bsu.rt : 'RT01'),
        ketua: ketuaBSU,
        nama_nasabah: data.namaNasabah || data.nama_nasabah || 'Unknown',
        nasabah_id: data.nasabahId || data.nasabah_id || 'nasabah_unknown',
        status: data.status || 'menunggu',
        tanggal: data.tanggal || new Date().toISOString().split('T')[0],
        created_at: data.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        foto_timbang: data.foto_timbang || null,
        foto_hasil: data.foto_hasil || null,
        foto_bukti: data.foto_bukti || null
    };
    
    console.log('📦 Transaksi object:', transaksi);
    
    // Simpan ke Supabase
    try {
        if (window.db && window.db.createTransaksi) {
            console.log('💾 Menyimpan ke Supabase...');
            const saved = await window.db.createTransaksi(transaksi);
            console.log('✅ Transaksi tersimpan di Supabase:', saved);
            
            // Update cache lokal
            if (!window.daftarSampah) window.daftarSampah = [];
            var existingIndex = window.daftarSampah.findIndex(function(item) {
                return item.id === saved.id;
            });
            if (existingIndex > -1) {
                window.daftarSampah[existingIndex] = saved;
            } else {
                window.daftarSampah.unshift(saved);
            }
            
            // Panggil callback realtime
            if (window._onTransaksiChange) {
                window._onTransaksiChange({ eventType: 'INSERT', new: saved });
            }
            
            return saved;
        }
    } catch (e) {
        console.error('❌ Gagal simpan ke Supabase:', e.message);
        console.log('💾 Menyimpan ke lokal sebagai fallback...');
    }
    
    // Fallback ke lokal
    if (!window.daftarSampah) window.daftarSampah = [];
    var existingIndex = window.daftarSampah.findIndex(function(item) {
        return item.id === transaksi.id;
    });
    if (existingIndex > -1) {
        window.daftarSampah[existingIndex] = transaksi;
    } else {
        window.daftarSampah.unshift(transaksi);
    }
    
    console.log('✅ Transaksi tersimpan di lokal (fallback)');
    return transaksi;
}

async function updateStatusTransaksi(id, status) {
    console.log('📝 Update status transaksi:', id, '->', status);
    
    try {
        if (window.db && window.db.updateTransaksi) {
            const updated = await window.db.updateTransaksi(id, { 
                status: status,
                updated_at: new Date().toISOString()
            });
            console.log('✅ Status transaksi diupdate di Supabase');
            
            var data = window.daftarSampah || [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].id === id) {
                    data[i].status = status;
                    data[i].updated_at = new Date().toISOString();
                    break;
                }
            }
            
            if (window._onTransaksiChange) {
                window._onTransaksiChange({ eventType: 'UPDATE', new: updated });
            }
            
            return updated;
        }
    } catch (e) {
        console.warn('⚠️ Gagal update ke Supabase:', e.message);
    }
    
    var data = window.daftarSampah || [];
    var updated = null;
    for (var i = 0; i < data.length; i++) {
        if (data[i].id === id) {
            data[i].status = status;
            updated = data[i];
            break;
        }
    }
    return updated;
}

// =============================================
// FUNGSI QUERY
// =============================================

function getTransaksiByStatus(status) {
    var data = window.daftarSampah || [];
    return data.filter(function(item) { return item.status === status; });
}

function getTransaksiByBSU(bsuId) {
    var data = window.daftarSampah || [];
    return data.filter(function(item) {
        return item.bsu_id === bsuId || item.bsuId === bsuId;
    });
}

function getTransaksiByNasabah(nasabahId) {
    var data = window.daftarSampah || [];
    return data.filter(function(item) {
        return item.nasabah_id === nasabahId || item.nasabahId === nasabahId;
    });
}

function getNasabahById(id) {
    var data = window.daftarNasabah || [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].id === id) return data[i];
    }
    return null;
}

function getNasabahByBSU(bsuId) {
    var result = [];
    var data = window.daftarNasabah || [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].bsu_id === bsuId || data[i].bsuId === bsuId) {
            result.push(data[i]);
        }
    }
    return result;
}

function getNasabahByUsername(username) {
    if (!username) return null;
    var data = window.daftarNasabah || [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].username && data[i].username.toLowerCase() === username.toLowerCase()) {
            return data[i];
        }
    }
    return null;
}

function hitungSaldoNasabah(nasabahId) {
    var total = 0;
    var data = window.daftarSampah || [];
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if ((item.nasabah_id === nasabahId || item.nasabahId === nasabahId) && 
            item.status === 'diverifikasi') {
            var harga = item.harga_per_kg || item.hargaPerKg || 0;
            total += parseFloat(item.berat || 0) * parseFloat(harga);
        }
    }
    return total;
}

function hitungPoinNasabah(nasabahId) {
    var total = 0;
    var data = window.daftarSampah || [];
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if ((item.nasabah_id === nasabahId || item.nasabahId === nasabahId) && 
            item.status === 'diverifikasi') {
            total += Math.floor(parseFloat(item.berat || 0) * 10);
        }
    }
    return total;
}

// =============================================
// DEBUG HELPER
// =============================================

function cekDataNasabah() {
    console.log('📋 DATA NASABAH TERDAFTAR:');
    var data = window.daftarNasabah || [];
    console.table(data);
    console.log('Total:', data.length, 'nasabah');
    return data;
}

function cekDataTransaksi() {
    console.log('📋 DATA TRANSAKSI:');
    var data = window.daftarSampah || [];
    console.table(data);
    console.log('Total:', data.length, 'transaksi');
    return data;
}

// =============================================
// EXPORT KE GLOBAL
// =============================================
window.syncAllData = syncAllData;
window.syncNasabahFromSupabase = syncNasabahFromSupabase;
window.syncTransaksiFromSupabase = syncTransaksiFromSupabase;
window.getTransaksiByStatus = getTransaksiByStatus;
window.getTransaksiByBSU = getTransaksiByBSU;
window.getTransaksiByNasabah = getTransaksiByNasabah;
window.getNasabahById = getNasabahById;
window.getNasabahByBSU = getNasabahByBSU;
window.getNasabahByUsername = getNasabahByUsername;
window.getBSUById = getBSUById;
window.tambahTransaksi = tambahTransaksi;
window.updateStatusTransaksi = updateStatusTransaksi;
window.hitungSaldoNasabah = hitungSaldoNasabah;
window.hitungPoinNasabah = hitungPoinNasabah;
window.cekDataNasabah = cekDataNasabah;
window.cekDataTransaksi = cekDataTransaksi;

console.log('✅ Data module loaded');
console.log('📋 Data BSU tersedia:', window.dataBSU ? window.dataBSU.length : 0);
console.log('📋 Data Nasabah tersedia:', window.daftarNasabah ? window.daftarNasabah.length : 0);
console.log('📋 Data Transaksi tersedia:', window.daftarSampah ? window.daftarSampah.length : 0);
console.log('💡 Ketik cekDataNasabah() atau cekDataTransaksi() di console untuk debug');