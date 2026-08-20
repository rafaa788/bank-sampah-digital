// supabase-client.js
// =============================================
// KONFIGURASI SUPABASE - LENGKAP
// =============================================



// supabase-client.js
// =============================================
// KONFIGURASI SUPABASE
// =============================================


const SUPABASE_URL = 'https://hqhzglfmalajunclaulr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaHpnbGZtYWxhanVuY2xhdWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMTcxODgsImV4cCI6MjEwMjc5MzE4OH0.YP2HC0GrcKlKgZ72-iUJZbQMQSJhsMOPmOfVzZeU940';

// Create Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---- TABEL: bsu ----
async function getBSU() {
    try {
        const { data, error } = await supabase
            .from('bsu')
            .select('*')
            .order('nama');
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('❌ Error getBSU:', e.message);
        return window.dataBSU || [];
    }
}

// ✅ TAMBAHKAN FUNGSI INI (MISSING)
async function createBSU(bsu) {
    try {
        const { data, error } = await supabase
            .from('bsu')
            .insert([bsu])
            .select();
        if (error) throw error;
        return data ? data[0] : null;
    } catch (e) {
        console.error('❌ Error createBSU:', e.message);
        throw e;
    }
}

// ✅ TAMBAHKAN FUNGSI INI (MISSING)
async function updateBSU(id, data) {
    try {
        const { data: result, error } = await supabase
            .from('bsu')
            .update(data)
            .eq('id', id)
            .select();
        if (error) throw error;
        return result ? result[0] : null;
    } catch (e) {
        console.error('❌ Error updateBSU:', e.message);
        throw e;
    }
}

// ✅ TAMBAHKAN FUNGSI INI (MISSING)
async function deleteBSU(id) {
    try {
        const { error } = await supabase
            .from('bsu')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error('❌ Error deleteBSU:', e.message);
        throw e;
    }
}

async function getBSUById(id) {
    try {
        const { data, error } = await supabase
            .from('bsu')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    } catch (e) {
        var bsuList = window.dataBSU || [];
        for (var i = 0; i < bsuList.length; i++) {
            if (bsuList[i].id === id) return bsuList[i];
        }
        return null;
    }
}

async function getBSUByUsername(username) {
    try {
        const { data, error } = await supabase
            .from('bsu')
            .select('*')
            .eq('username', username)
            .single();
        if (error) throw error;
        return data;
    } catch (e) {
        var bsuList = window.dataBSU || [];
        for (var i = 0; i < bsuList.length; i++) {
            if (bsuList[i].username === username) return bsuList[i];
        }
        return null;
    }
}

// ---- TABEL: nasabah ----
async function getNasabah() {
    try {
        const { data, error } = await supabase
            .from('nasabah')
            .select('*')
            .order('nama');
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('❌ Error getNasabah:', e.message);
        return window.daftarNasabah || [];
    }
}

async function getNasabahById(id) {
    try {
        const { data, error } = await supabase
            .from('nasabah')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    } catch (e) {
        var nasabahList = window.daftarNasabah || [];
        for (var i = 0; i < nasabahList.length; i++) {
            if (nasabahList[i].id === id) return nasabahList[i];
        }
        return null;
    }
}

async function getNasabahByBSU(bsuId) {
    try {
        const { data, error } = await supabase
            .from('nasabah')
            .select('*')
            .eq('bsu_id', bsuId)
            .order('nama');
        if (error) throw error;
        return data || [];
    } catch (e) {
        var result = [];
        var nasabahList = window.daftarNasabah || [];
        for (var i = 0; i < nasabahList.length; i++) {
            if (nasabahList[i].bsu_id === bsuId || nasabahList[i].bsuId === bsuId) {
                result.push(nasabahList[i]);
            }
        }
        return result;
    }
}

async function getNasabahByUsername(username) {
    try {
        const { data, error } = await supabase
            .from('nasabah')
            .select('*')
            .eq('username', username)
            .single();
        if (error) throw error;
        return data;
    } catch (e) {
        var nasabahList = window.daftarNasabah || [];
        for (var i = 0; i < nasabahList.length; i++) {
            if (nasabahList[i].username === username) return nasabahList[i];
        }
        return null;
    }
}

async function createNasabah(nasabah) {
    try {
        const { data, error } = await supabase
            .from('nasabah')
            .insert([nasabah])
            .select();
        if (error) throw error;
        return data ? data[0] : null;
    } catch (e) {
        console.error('❌ Error createNasabah:', e.message);
        throw e;
    }
}

async function updateNasabah(id, data) {
    try {
        const { data: result, error } = await supabase
            .from('nasabah')
            .update(data)
            .eq('id', id)
            .select();
        if (error) throw error;
        return result ? result[0] : null;
    } catch (e) {
        console.error('❌ Error updateNasabah:', e.message);
        throw e;
    }
}

async function deleteNasabah(id) {
    try {
        const { error } = await supabase
            .from('nasabah')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error('❌ Error deleteNasabah:', e.message);
        throw e;
    }
}

// ---- TABEL: transaksi ----
async function getTransaksi() {
    try {
        const { data, error } = await supabase
            .from('transaksi')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('❌ Error getTransaksi:', e.message);
        return window.daftarSampah || [];
    }
}

async function getTransaksiByStatus(status) {
    try {
        const { data, error } = await supabase
            .from('transaksi')
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (e) {
        var data = window.daftarSampah || [];
        return data.filter(function(item) { return item.status === status; });
    }
}

async function getTransaksiByBSU(bsuId) {
    try {
        const { data, error } = await supabase
            .from('transaksi')
            .select('*')
            .eq('bsu_id', bsuId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (e) {
        var data = window.daftarSampah || [];
        return data.filter(function(item) { 
            return item.bsu_id === bsuId || item.bsuId === bsuId; 
        });
    }
}

async function getTransaksiByNasabah(nasabahId) {
    try {
        const { data, error } = await supabase
            .from('transaksi')
            .select('*')
            .eq('nasabah_id', nasabahId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (e) {
        var data = window.daftarSampah || [];
        return data.filter(function(item) { 
            return item.nasabah_id === nasabahId || item.nasabahId === nasabahId; 
        });
    }
}

async function createTransaksi(transaksi) {
    try {
        const { data, error } = await supabase
            .from('transaksi')
            .insert([transaksi])
            .select();
        if (error) throw error;
        return data ? data[0] : null;
    } catch (e) {
        console.error('❌ Error createTransaksi:', e.message);
        throw e;
    }
}

async function updateTransaksi(id, data) {
    try {
        const { data: result, error } = await supabase
            .from('transaksi')
            .update(data)
            .eq('id', id)
            .select();
        if (error) throw error;
        return result ? result[0] : null;
    } catch (e) {
        console.error('❌ Error updateTransaksi:', e.message);
        throw e;
    }
}

async function deleteTransaksi(id) {
    try {
        const { error } = await supabase
            .from('transaksi')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (e) {
        console.error('❌ Error deleteTransaksi:', e.message);
        throw e;
    }
}

// ---- TABEL: harga_sampah ----
async function getHargaSampah() {
    try {
        const { data, error } = await supabase
            .from('harga_sampah')
            .select('*')
            .order('nama');
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('❌ Error getHargaSampah:', e.message);
        return [];
    }
}

async function getHargaByNama(nama) {
    try {
        const { data, error } = await supabase
            .from('harga_sampah')
            .select('*')
            .eq('nama', nama)
            .single();
        if (error) throw error;
        return data;
    } catch (e) {
        if (window.hargaSampahDetail && window.hargaSampahDetail[nama]) {
            return { nama: nama, harga_per_kg: window.hargaSampahDetail[nama] };
        }
        return null;
    }
}

async function updateHargaSampah(nama, harga) {
    try {
        const { data, error } = await supabase
            .from('harga_sampah')
            .update({ 
                harga_per_kg: harga, 
                updated_at: new Date().toISOString() 
            })
            .eq('nama', nama)
            .select();
        if (error) throw error;
        return data ? data[0] : null;
    } catch (e) {
        console.error('❌ Error updateHargaSampah:', e.message);
        throw e;
    }
}

// ---- UPLOAD FOTO ----
async function uploadFoto(file, path) {
    try {
        const { data, error } = await supabase
            .storage
            .from('foto-sampah')
            .upload(path, file);
        if (error) throw error;
        return data;
    } catch (e) {
        console.error('❌ Error uploadFoto:', e.message);
        throw e;
    }
}

async function getFotoUrl(path) {
    try {
        const { data } = supabase
            .storage
            .from('foto-sampah')
            .getPublicUrl(path);
        return data.publicUrl;
    } catch (e) {
        console.error('❌ Error getFotoUrl:', e.message);
        return null;
    }
}

// ---- SEED DATA ----
async function seedInitialData() {
    try {
        const { count, error } = await supabase
            .from('bsu')
            .select('*', { count: 'exact', head: true });
        
        if (error) {
            console.warn('⚠️ Gagal cek data BSU:', error.message);
            return;
        }
        
        if (count > 0) {
            console.log('✅ Data sudah ada, skip seed');
            return;
        }

        console.log('📦 Seeding data awal...');

        const bsuList = window.dataBSU || [];
        for (const bsu of bsuList) {
            try {
                await createBSU({
                    id: bsu.id,
                    nama: bsu.nama,
                    rw: bsu.rw,
                    rt: bsu.rt,
                    ketua: bsu.ketua,
                    username: bsu.username,
                    password: bsu.password
                });
            } catch (e) {
                console.warn('⚠️ Gagal insert BSU:', bsu.nama, e.message);
            }
        }

        try {
            await supabase
                .from('admin')
                .insert([{
                    id: 'admin_1',
                    nama: 'Administrator',
                    username: 'admin',
                    password: 'admin123',
                    role: 'admin'
                }]);
        } catch (e) {
            console.warn('⚠️ Gagal insert admin:', e.message);
        }

        console.log('✅ Seed data completed!');
    } catch (error) {
        console.error('❌ Error seeding data:', error);
    }
}

// ---- SEED HARGA SAMPAH ----
async function seedHargaSampahToSupabase() {
    try {
        const { data: existing, error: checkError } = await supabase
            .from('harga_sampah')
            .select('*', { count: 'exact', head: true });
        
        if (checkError) {
            console.warn('⚠️ Gagal cek data harga:', checkError.message);
            return;
        }
        
        if (existing && existing.length > 0) {
            console.log('✅ Data harga sudah ada di Supabase, skip seed');
            return;
        }

        console.log('📦 Seeding harga sampah ke Supabase...');
        
        var preset = window.presetSampah || { plastik: [], logam: [], kertas: [] };
        var allSampah = [];
        
        for (var jenis in preset) {
            var list = preset[jenis] || [];
            for (var i = 0; i < list.length; i++) {
                var nama = list[i];
                var harga = 2000;
                if (window.hargaSampahDetail && window.hargaSampahDetail[nama]) {
                    harga = window.hargaSampahDetail[nama];
                }
                allSampah.push({
                    nama: nama,
                    jenis: jenis,
                    harga_per_kg: harga
                });
            }
        }
        
        var batchSize = 50;
        for (var i = 0; i < allSampah.length; i += batchSize) {
            var batch = allSampah.slice(i, i + batchSize);
            try {
                const { data, error } = await supabase
                    .from('harga_sampah')
                    .insert(batch)
                    .select();
                if (error) throw error;
                console.log('✅ Inserted batch', i/batchSize + 1, ':', batch.length, 'items');
            } catch (e) {
                console.warn('⚠️ Gagal insert batch:', e.message);
            }
        }
        
        console.log('✅ Seed harga sampah completed! Total:', allSampah.length);
        
    } catch (error) {
        console.error('❌ Error seed harga:', error.message);
    }
}

// ---- EXPORT ----
window.db = {
    supabase,
    getBSU,
    getBSUById,
    getBSUByUsername,
    createBSU,          // ✅ SEKARANG TERSEDIA
    updateBSU,          // ✅ SEKARANG TERSEDIA
    deleteBSU,          // ✅ SEKARANG TERSEDIA
    getNasabah,
    getNasabahById,
    getNasabahByBSU,
    getNasabahByUsername,
    createNasabah,
    updateNasabah,
    deleteNasabah,
    getTransaksi,
    getTransaksiByStatus,
    getTransaksiByBSU,
    getTransaksiByNasabah,
    createTransaksi,
    updateTransaksi,
    deleteTransaksi,
    getHargaSampah,
    getHargaByNama,
    updateHargaSampah,
    uploadFoto,
    getFotoUrl,
    seedInitialData,
    seedHargaSampahToSupabase
};

console.log('✅ Supabase Client loaded');
console.log('🔗 Connected to:', SUPABASE_URL);