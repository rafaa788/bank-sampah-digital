// data.js
// =====================================================
// DATA GLOBAL APLIKASI - DENGAN SUPABASE
// =====================================================

// Cache data lokal
window.daftarNasabah = window.daftarNasabah || [];
window.daftarSampah = window.daftarSampah || [];

// =============================================
// SYNC DATA DARI SUPABASE
// =============================================

async function syncAllData() {
    await syncNasabahFromSupabase();
    await syncTransaksiFromSupabase();
    console.log('✅ All data synced from Supabase');
}

async function syncNasabahFromSupabase() {
    try {
        if (window.db && window.db.getNasabah) {
            const data = await window.db.getNasabah();
            if (data && data.length > 0) {
                window.daftarNasabah = data;
                console.log('📥 Synced nasabah from Supabase:', data.length);
                return data;
            }
        }
    } catch (e) {
        console.log('⚠️ Gagal sync nasabah, pakai data lokal');
    }
    return window.daftarNasabah || [];
}

async function syncTransaksiFromSupabase() {
    try {
        if (window.db && window.db.getTransaksi) {
            const data = await window.db.getTransaksi();
            if (data && data.length > 0) {
                window.daftarSampah = data;
                console.log('📥 Synced transaksi from Supabase:', data.length);
                return data;
            }
        }
    } catch (e) {
        console.log('⚠️ Gagal sync transaksi, pakai data lokal');
    }
    return window.daftarSampah || [];
}

// =============================================
// FUNGSI CRUD - DENGAN SUPABASE
// =============================================

async function tambahTransaksi(data) {
    var newId = 'trans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    
    var bsu = getBSUById(data.bsuId);
    var ketuaBSU = bsu ? bsu.ketua : 'Ketua BSU';
    
    var transaksi = {
        id: newId,
        nama: data.nama,
        jenis: data.jenis || 'nonorganik',
        berat: parseFloat(data.berat),
        harga_per_kg: data.hargaPerKg || 2000,
        bsu: data.bsu || 'BSU',
        bsu_id: data.bsuId || 'bsu_mede1',
        rw: data.rw || 'RW01',
        rt: data.rt || 'RT01',
        ketua: ketuaBSU,
        nama_nasabah: data.namaNasabah || 'Unknown',
        nasabah_id: data.nasabahId || 'nasabah_sarah',
        status: data.status || 'menunggu',
        tanggal: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        foto_timbang: data.foto_timbang || null,
        foto_hasil: data.foto_hasil || null,
        foto_bukti: data.foto_bukti || null
    };
    
    // Simpan ke Supabase
    try {
        if (window.db && window.db.createTransaksi) {
            const saved = await window.db.createTransaksi(transaksi);
            console.log('✅ Transaksi tersimpan di Supabase:', saved);
            
            // Update cache lokal
            if (!window.daftarSampah) window.daftarSampah = [];
            window.daftarSampah.push(saved);
            return saved;
        }
    } catch (e) {
        console.warn('⚠️ Gagal simpan ke Supabase, pakai lokal:', e.message);
    }
    
    // Fallback ke lokal
    if (!window.daftarSampah) window.daftarSampah = [];
    window.daftarSampah.push(transaksi);
    return transaksi;
}

async function updateStatusTransaksi(id, status) {
    // Update Supabase
    try {
        if (window.db && window.db.updateTransaksi) {
            const updated = await window.db.updateTransaksi(id, { 
                status: status,
                updated_at: new Date().toISOString()
            });
            console.log('✅ Status transaksi diupdate di Supabase');
            
            // Update cache lokal
            var data = window.daftarSampah || [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].id === id) {
                    data[i].status = status;
                    data[i].updated_at = new Date().toISOString();
                    break;
                }
            }
            return updated;
        }
    } catch (e) {
        console.warn('⚠️ Gagal update ke Supabase, pakai lokal:', e.message);
    }
    
    // Fallback ke lokal
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
// FUNGSI QUERY - DENGAN CACHE
// =============================================

function getTransaksiByStatus(status) {
    var data = window.daftarSampah || [];
    return data.filter(function(item) {
        return item.status === status;
    });
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
        if (data[i].bsu_id === bsuId || data[i].bsuId === bsuId) result.push(data[i]);
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

function getBSUById(id) {
    if (typeof window.getBSUById === 'function') {
        return window.getBSUById(id);
    }
    var data = window.dataBSU || [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].id === id) return data[i];
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

console.log('✅ Data module loaded with Supabase support');