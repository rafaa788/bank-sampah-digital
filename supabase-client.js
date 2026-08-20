// supabase-client.js
// =============================================
// KONFIGURASI SUPABASE - LENGKAP
// =============================================

// =============================================
// ⚠️ GANTI DENGAN CREDENTIALS SUPABASE ANDA ⚠️
// =============================================

const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// Create Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============================================
// FUNGSI DATABASE
// =============================================

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
        // Fallback ke data lokal
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
        // Fallback ke data lokal
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
        // Fallback ke data lokal
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
        // Fallback ke data lokal
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
        // Fallback ke data lokal
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
        // Fallback ke data lokal
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
        // Fallback ke data lokal
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
        // Fallback ke data lokal
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
        // Fallback ke data lokal
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
        // Cek apakah data BSU sudah ada
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

        // Insert BSU dari data-bsu.js
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

        // Insert Admin
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

// ---- EXPORT ----
window.db = {
    supabase,
    getBSU,
    getBSUById,
    getBSUByUsername,
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
    seedInitialData
};

console.log('✅ Supabase Client loaded');
console.log('🔗 Connected to:', SUPABASE_URL);