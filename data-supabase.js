// data-supabase.js
// =====================================================
// SEMUA DATA DARI SUPABASE - TANPA DATA LOKAL
// =====================================================

// =============================================
// CACHE DATA (akan diisi dari Supabase)
// =============================================
window.daftarNasabah = [];
window.daftarSampah = [];
window.hargaSampahDetail = {};
window.presetSampah = { plastik: [], logam: [], kertas: [] };
window.dataBSU = [];

// =============================================
// SYNC SEMUA DATA DARI SUPABASE
// =============================================

async function syncAllData() {
    console.log('🔄 Syncing all data from Supabase...');
    try {
        await Promise.all([
            syncNasabah(),
            syncTransaksi(),
            syncHargaSampah(),
            syncBSU()
        ]);
        console.log('✅ All data synced from Supabase');
        console.log('📋 Nasabah:', window.daftarNasabah.length);
        console.log('📋 Transaksi:', window.daftarSampah.length);
        console.log('📋 Harga:', Object.keys(window.hargaSampahDetail).length);
        console.log('📋 BSU:', window.dataBSU.length);
        return true;
    } catch (e) {
        console.error('❌ Error syncing data:', e.message);
        return false;
    }
}

// =============================================
// SYNC NASABAH
// =============================================

async function syncNasabah() {
    try {
        if (window.db && window.db.getNasabah) {
            const data = await window.db.getNasabah();
            if (data) {
                window.daftarNasabah = data;
                console.log('📥 Synced nasabah:', data.length);
                return data;
            }
        }
    } catch (e) {
        console.error('❌ Gagal sync nasabah:', e.message);
    }
    return window.daftarNasabah || [];
}

// =============================================
// SYNC TRANSAKSI
// =============================================

async function syncTransaksi() {
    try {
        if (window.db && window.db.getTransaksi) {
            const data = await window.db.getTransaksi();
            if (data) {
                window.daftarSampah = data;
                console.log('📥 Synced transaksi:', data.length);
                return data;
            }
        }
    } catch (e) {
        console.error('❌ Gagal sync transaksi:', e.message);
    }
    return window.daftarSampah || [];
}

// =============================================
// SYNC HARGA SAMPAH
// =============================================

async function syncHargaSampah() {
    try {
        if (window.db && window.db.getHargaSampah) {
            const data = await window.db.getHargaSampah();
            if (Array.isArray(data)) {
                // Selalu bangun ulang cache dari hasil terbaru.
                // Jangan biarkan cache kosong/stale membuat form kehilangan pilihan.
                window.hargaSampahDetail = {};
                window.presetSampah = { plastik: [], logam: [], kertas: [] };
                
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    window.hargaSampahDetail[item.nama] = item.harga_per_kg;
                    
                    var jenis = item.jenis || 'plastik';
                    if (!window.presetSampah[jenis]) {
                        window.presetSampah[jenis] = [];
                    }
                    if (window.presetSampah[jenis].indexOf(item.nama) === -1) {
                        window.presetSampah[jenis].push(item.nama);
                    }
                }
                console.log('📥 Synced harga sampah:', data.length);
                console.log('📋 Plastik:', window.presetSampah.plastik?.length || 0);
                console.log('📋 Logam:', window.presetSampah.logam?.length || 0);
                console.log('📋 Kertas:', window.presetSampah.kertas?.length || 0);
                return data;
            }
        }
    } catch (e) {
        console.error('❌ Gagal sync harga:', e.message);
    }
    return null;
}

// =============================================
// SYNC BSU
// =============================================

async function syncBSU() {
    try {
        if (window.db && window.db.getBSU) {
            const data = await window.db.getBSU();
            if (data) {
                window.dataBSU = data;
                console.log('📥 Synced BSU:', data.length);
                return data;
            }
        }
    } catch (e) {
        console.error('❌ Gagal sync BSU:', e.message);
    }
    return window.dataBSU || [];
}

// =============================================
// FUNGSI GET - LANGSUNG DARI CACHE
// =============================================

function getBSUById(id) {
    if (!id) return null;
    var data = window.dataBSU || [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].id === id) return data[i];
    }
    return null;
}

function getBSUByUsername(username) {
    if (!username) return null;
    var data = window.dataBSU || [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].username && data[i].username.toLowerCase() === username.toLowerCase()) {
            return data[i];
        }
    }
    return null;
}

function getNasabahById(id) {
    if (!id) return null;
    var data = window.daftarNasabah || [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].id === id) return data[i];
    }
    return null;
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

function getNasabahByBSU(bsuId) {
    if (!bsuId) return [];
    var result = [];
    var data = window.daftarNasabah || [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].bsu_id === bsuId) {
            result.push(data[i]);
        }
    }
    return result;
}

function getTransaksiByStatus(status) {
    var data = window.daftarSampah || [];
    return data.filter(function(item) { return item.status === status; });
}

function getTransaksiByBSU(bsuId) {
    var data = window.daftarSampah || [];
    return data.filter(function(item) { return item.bsu_id === bsuId; });
}

function getTransaksiByNasabah(nasabahId) {
    var data = window.daftarSampah || [];
    return data.filter(function(item) { return item.nasabah_id === nasabahId; });
}

function getHargaByNamaSampah(nama) {
    if (!nama) return 2000;
    if (window.hargaSampahDetail && window.hargaSampahDetail[nama]) {
        return window.hargaSampahDetail[nama];
    }
    // Cari partial match
    var namaLower = nama.toLowerCase();
    for (var key in window.hargaSampahDetail) {
        if (namaLower.includes(key.toLowerCase()) || key.toLowerCase().includes(namaLower)) {
            return window.hargaSampahDetail[key];
        }
    }
    return 2000;
}

function getKategoriByNamaSampah(nama) {
    if (!nama) return 'plastik';
    var namaLower = nama.toLowerCase();
    var plastik = ["botol", "plastik", "gelas", "kresek", "sedotan", "tutup", "galon", 
                   "paralon", "ember", "hdpe", "pp", "tetrapak", "slopan", "kaset", 
                   "boncos", "naso", "impact", "nilek"];
    var logam = ["alumunium", "besi", "tembaga", "kuningan", "kaleng", "kawat", "seng", 
                 "rongsok", "babet", "kabin"];
    var kertas = ["kertas", "koran", "hvs", "kardus", "duplex", "semen", "kornes"];
    
    for (var i = 0; i < plastik.length; i++) {
        if (namaLower.includes(plastik[i])) return 'plastik';
    }
    for (var i = 0; i < logam.length; i++) {
        if (namaLower.includes(logam[i])) return 'logam';
    }
    for (var i = 0; i < kertas.length; i++) {
        if (namaLower.includes(kertas[i])) return 'kertas';
    }
    return 'plastik';
}

function getUniqueRW() {
    var rws = [];
    var data = window.dataBSU || [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].rw && rws.indexOf(data[i].rw) === -1) {
            rws.push(data[i].rw);
        }
    }
    return rws.sort();
}

function getUniqueRT(rw) {
    var rts = [];
    var data = window.dataBSU || [];
    for (var i = 0; i < data.length; i++) {
        var bsu = data[i];
        if ((!rw || bsu.rw === rw) && bsu.rt && rts.indexOf(bsu.rt) === -1) {
            if (bsu.rt !== 'all') rts.push(bsu.rt);
        }
    }
    return rts.sort();
}

function hitungSaldoNasabah(nasabahId) {
    var total = 0;
    var data = window.daftarSampah || [];
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if (item.nasabah_id === nasabahId && item.status === 'diverifikasi') {
            total += parseFloat(item.berat || 0) * parseFloat(item.harga_per_kg || 0);
        }
    }
    return total;
}

function hitungPoinNasabah(nasabahId) {
    var total = 0;
    var data = window.daftarSampah || [];
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if (item.nasabah_id === nasabahId && item.status === 'diverifikasi') {
            total += Math.floor(parseFloat(item.berat || 0) * 10);
        }
    }
    return total;
}

// =============================================
// CRUD - SIMPAN KE SUPABASE
// =============================================

async function tambahTransaksi(data) {
    console.log('📝 Menyimpan transaksi ke Supabase...', data);
    
    var newId = data.id || 'trans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    
    var bsu = getBSUById(data.bsuId) || getBSUById(data.bsu_id);
    console.log('🔍 BSU ditemukan:', bsu ? bsu.nama : 'TIDAK DITEMUKAN');
    
    var ketuaBSU = bsu ? bsu.ketua : (data.ketua || 'Ketua BSU');
    
    var transaksi = {
        id: newId,
        nama: data.nama || 'Sampah',
        jenis: data.jenis || 'nonorganik',
        berat: parseFloat(data.berat) || 0,
        harga_per_kg: data.hargaPerKg || data.harga_per_kg || getHargaByNamaSampah(data.nama),
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
    
    try {
        if (window.db && window.db.createTransaksi) {
            console.log('💾 Menyimpan ke Supabase...');
            const saved = await window.db.createTransaksi(transaksi);
            if (saved) {
                console.log('✅ Transaksi tersimpan di Supabase:', saved);
                window.daftarSampah.unshift(saved);
                if (window._onTransaksiChange) {
                    window._onTransaksiChange({ eventType: 'INSERT', new: saved });
                }
                return saved;
            } else {
                console.error('❌ createTransaksi mengembalikan null');
                throw new Error('Gagal menyimpan ke Supabase');
            }
        } else {
            console.error('❌ window.db.createTransaksi tidak tersedia!');
            throw new Error('Database tidak tersedia');
        }
    } catch (e) {
        console.error('❌ Gagal simpan ke Supabase:', e.message);
        showToast('⚠️ Gagal menyimpan: ' + e.message, true);
        throw e;
    }
}

async function updateStatusTransaksi(id, status) {
    try {
        if (window.db && window.db.updateTransaksi) {
            const updated = await window.db.updateTransaksi(id, { 
                status: status,
                updated_at: new Date().toISOString()
            });
            if (updated) {
                var data = window.daftarSampah || [];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].id === id) {
                        data[i].status = status;
                        break;
                    }
                }
                if (window._onTransaksiChange) {
                    window._onTransaksiChange({ eventType: 'UPDATE', new: updated });
                }
                return updated;
            }
        }
        throw new Error('Database tidak tersedia');
    } catch (e) {
        console.error('❌ Gagal update status:', e.message);
        throw e;
    }
}

async function updateHargaSampah(nama, hargaBaru) {
    var harga = parseFloat(hargaBaru);
    if (isNaN(harga) || harga < 0) {
        showToast('Masukkan harga yang valid!', true);
        return null;
    }
    
    window.hargaSampahDetail[nama] = harga;
    
    try {
        if (window.db && window.db.updateHargaSampah) {
            const result = await window.db.updateHargaSampah(nama, harga);
            if (result) {
                showToast('Harga ' + nama + ' diupdate menjadi Rp ' + formatRupiah(harga), false);
                return result;
            }
        }
    } catch (e) {
        console.error('❌ Gagal update harga:', e.message);
    }
    
    return { nama: nama, harga_per_kg: harga };
}

// =============================================
// CREATE NASABAH OTOMATIS KE SUPABASE
// =============================================

async function createNasabahOtomatis(username, password, nama) {
    var newId = 'nasabah_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    var newNasabah = {
        id: newId,
        nama: nama || username.charAt(0).toUpperCase() + username.slice(1),
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
                window.daftarNasabah.push(saved);
                return saved;
            }
        }
    } catch (e) {
        console.error('❌ Gagal buat nasabah:', e.message);
    }
    
    window.daftarNasabah.push(newNasabah);
    return newNasabah;
}

// =============================================
// DEBUG FUNCTIONS
// =============================================

function cekDataNasabah() {
    console.log('📋 DATA NASABAH:');
    console.table(window.daftarNasabah);
    console.log('Total:', window.daftarNasabah.length);
    return window.daftarNasabah;
}

function cekDataTransaksi() {
    console.log('📋 DATA TRANSAKSI:');
    console.table(window.daftarSampah);
    console.log('Total:', window.daftarSampah.length);
    return window.daftarSampah;
}

function cekDataBSU() {
    console.log('📋 DATA BSU:');
    console.table(window.dataBSU);
    console.log('Total:', window.dataBSU.length);
    return window.dataBSU;
}

function cekDataHarga() {
    console.log('📋 DATA HARGA:');
    console.table(window.hargaSampahDetail);
    console.log('Total:', Object.keys(window.hargaSampahDetail).length);
    return window.hargaSampahDetail;
}

// =============================================
// EXPORT KE GLOBAL
// =============================================
window.syncAllData = syncAllData;
window.syncNasabah = syncNasabah;
window.syncTransaksi = syncTransaksi;
window.syncHargaSampah = syncHargaSampah;
window.syncBSU = syncBSU;
window.getBSUById = getBSUById;
window.getBSUByUsername = getBSUByUsername;
window.getNasabahById = getNasabahById;
window.getNasabahByUsername = getNasabahByUsername;
window.getNasabahByBSU = getNasabahByBSU;
window.getTransaksiByStatus = getTransaksiByStatus;
window.getTransaksiByBSU = getTransaksiByBSU;
window.getTransaksiByNasabah = getTransaksiByNasabah;
window.getHargaByNamaSampah = getHargaByNamaSampah;
window.getKategoriByNamaSampah = getKategoriByNamaSampah;
window.getUniqueRW = getUniqueRW;
window.getUniqueRT = getUniqueRT;
window.hitungSaldoNasabah = hitungSaldoNasabah;
window.hitungPoinNasabah = hitungPoinNasabah;
window.tambahTransaksi = tambahTransaksi;
window.updateStatusTransaksi = updateStatusTransaksi;
window.updateHargaSampah = updateHargaSampah;
window.createNasabahOtomatis = createNasabahOtomatis;
window.cekDataNasabah = cekDataNasabah;
window.cekDataTransaksi = cekDataTransaksi;
window.cekDataBSU = cekDataBSU;
window.cekDataHarga = cekDataHarga;

console.log('✅ Data Supabase loaded - NO LOCAL DATA');
console.log('💡 Ketik syncAllData() di console untuk sync manual');
console.log('💡 Ketik cekDataTransaksi() di console untuk lihat data');