// supabase-client.js
// =============================================
// KONFIGURASI SUPABASE
// =============================================

const SUPABASE_URL = 'https://hqhzglfmalajunclaulr.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_z8PfmkvjRziYDYZ9wWwMIA_CcVWJ4bM';

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
        return [];
    }
}

async function getBSUById(id) {
    if (!id) return null;
    try {
        const { data, error } = await supabase
            .from('bsu')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    } catch (e) {
        console.log('⚠️ BSU not found:', id);
        return null;
    }
}

async function getBSUByUsername(username) {
    if (!username) return null;
    try {
        const { data, error } = await supabase
            .from('bsu')
            .select('*')
            .eq('username', username)
            .single();
        if (error) throw error;
        return data;
    } catch (e) {
        return null;
    }
}

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
        return [];
    }
}

async function getNasabahById(id) {
    if (!id) return null;
    try {
        const { data, error } = await supabase
            .from('nasabah')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    } catch (e) {
        return null;
    }
}

async function getNasabahByUsername(username) {
    if (!username) return null;
    try {
        const { data, error } = await supabase
            .from('nasabah')
            .select('*')
            .eq('username', username)
            .single();
        if (error) throw error;
        return data;
    } catch (e) {
        return null;
    }
}

async function getNasabahByBSU(bsuId) {
    if (!bsuId) return [];
    try {
        const { data, error } = await supabase
            .from('nasabah')
            .select('*')
            .eq('bsu_id', bsuId)
            .order('nama');
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('❌ Error getNasabahByBSU:', e.message);
        return [];
    }
}

async function createNasabah(nasabah) {
    try {
        console.log('💾 createNasabah called with:', nasabah);
        const { data, error } = await supabase
            .from('nasabah')
            .insert([nasabah])
            .select();
        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }
        console.log('✅ Nasabah created:', data);
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

// ---- TABEL: transaksi ----
async function getTransaksi() {
    try {
        const { data, error } = await supabase
            .from('transaksi')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        console.log('📥 getTransaksi returned:', data?.length || 0, 'records');
        return data || [];
    } catch (e) {
        console.error('❌ Error getTransaksi:', e.message);
        return [];
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
        console.error('❌ Error getTransaksiByStatus:', e.message);
        return [];
    }
}

async function getTransaksiByBSU(bsuId) {
    if (!bsuId) return [];
    try {
        const { data, error } = await supabase
            .from('transaksi')
            .select('*')
            .eq('bsu_id', bsuId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('❌ Error getTransaksiByBSU:', e.message);
        return [];
    }
}

async function getTransaksiByNasabah(nasabahId) {
    if (!nasabahId) return [];
    try {
        const { data, error } = await supabase
            .from('transaksi')
            .select('*')
            .eq('nasabah_id', nasabahId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error('❌ Error getTransaksiByNasabah:', e.message);
        return [];
    }
}

async function createTransaksi(transaksi) {
    try {
        console.log('💾 createTransaksi called with:', transaksi);
        
        // Pastikan semua field yang diperlukan ada
        const dataToInsert = {
            id: transaksi.id || 'trans_' + Date.now(),
            nama: transaksi.nama || 'Sampah',
            jenis: transaksi.jenis || 'nonorganik',
            berat: parseFloat(transaksi.berat) || 0,
            harga_per_kg: parseFloat(transaksi.harga_per_kg) || 0,
            bsu: transaksi.bsu || 'BSU',
            bsu_id: transaksi.bsu_id || 'bsu_mede1',
            rw: transaksi.rw || 'RW01',
            rt: transaksi.rt || 'RT01',
            ketua: transaksi.ketua || 'Ketua BSU',
            nama_nasabah: transaksi.nama_nasabah || 'Unknown',
            nasabah_id: transaksi.nasabah_id || 'nasabah_unknown',
            status: transaksi.status || 'menunggu',
            tanggal: transaksi.tanggal || new Date().toISOString().split('T')[0],
            foto_timbang: transaksi.foto_timbang || null,
            foto_hasil: transaksi.foto_hasil || null,
            foto_bukti: transaksi.foto_bukti || null,
            created_at: transaksi.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log('📦 Data to insert:', dataToInsert);
        
        const { data, error } = await supabase
            .from('transaksi')
            .insert([dataToInsert])
            .select();
            
        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }
        
        console.log('✅ Transaksi created:', data);
        return data ? data[0] : null;
    } catch (e) {
        console.error('❌ Error createTransaksi:', e.message);
        throw e;
    }
}

async function updateTransaksi(id, data) {
    try {
        console.log('🔄 updateTransaksi:', id, data);
        const { data: result, error } = await supabase
            .from('transaksi')
            .update(data)
            .eq('id', id)
            .select();
        if (error) throw error;
        console.log('✅ Transaksi updated:', result);
        return result ? result[0] : null;
    } catch (e) {
        console.error('❌ Error updateTransaksi:', e.message);
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

// ---- REAL-TIME SUBSCRIPTIONS ----
async function subscribeToTransaksi(callback) {
    const channel = supabase
        .channel('transaksi-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'transaksi'
            },
            (payload) => {
                console.log('🔄 Transaksi berubah:', payload.eventType, payload.new);
                if (callback) callback(payload);
                if (window._onTransaksiChange) {
                    window._onTransaksiChange(payload);
                }
            }
        )
        .subscribe();
    return channel;
}

async function subscribeToNasabah(callback) {
    const channel = supabase
        .channel('nasabah-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'nasabah'
            },
            (payload) => {
                console.log('🔄 Nasabah berubah:', payload.eventType);
                if (callback) callback(payload);
                if (window._onNasabahChange) {
                    window._onNasabahChange(payload);
                }
            }
        )
        .subscribe();
    return channel;
}

async function subscribeToHargaSampah(callback) {
    const channel = supabase
        .channel('harga-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'harga_sampah'
            },
            (payload) => {
                console.log('🔄 Harga sampah berubah:', payload.eventType);
                if (callback) callback(payload);
                if (window._onHargaChange) {
                    window._onHargaChange(payload);
                }
            }
        )
        .subscribe();
    return channel;
}

async function subscribeToBSU(callback) {
    const channel = supabase
        .channel('bsu-changes')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'bsu'
            },
            (payload) => {
                console.log('🔄 BSU berubah:', payload.eventType);
                if (callback) callback(payload);
                if (window._onBSUChange) {
                    window._onBSUChange(payload);
                }
            }
        )
        .subscribe();
    return channel;
}

async function setupAllRealtime(callbacks) {
    const channels = [];
    channels.push(await subscribeToTransaksi(callbacks?.onTransaksiChange));
    channels.push(await subscribeToNasabah(callbacks?.onNasabahChange));
    channels.push(await subscribeToHargaSampah(callbacks?.onHargaChange));
    channels.push(await subscribeToBSU(callbacks?.onBSUChange));
    console.log('📡 All real-time subscriptions active!');
    return channels;
}

async function removeAllChannels(channels) {
    if (!channels) return;
    for (const channel of channels) {
        await supabase.removeChannel(channel);
    }
    console.log('📡 All channels removed');
}

// ---- EXPORT ----
window.db = {
    supabase,
    getBSU,
    getBSUById,
    getBSUByUsername,
    createBSU,
    getNasabah,
    getNasabahById,
    getNasabahByUsername,
    getNasabahByBSU,
    createNasabah,
    updateNasabah,
    getTransaksi,
    getTransaksiByStatus,
    getTransaksiByBSU,
    getTransaksiByNasabah,
    createTransaksi,
    updateTransaksi,
    getHargaSampah,
    updateHargaSampah,
    setupAllRealtime,
    removeAllChannels
};

console.log('✅ Supabase Client loaded');
console.log('🔗 Connected to:', SUPABASE_URL);