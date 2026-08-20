// data-harga.js
// =====================================================
// DATA HARGA SAMPAH - VERSI LENGKAP
// =====================================================

var hargaSampahDetail = {
    // ===== PLASTIK =====
    "Pet A - Botol TANPA tutup dan label + Galon Le Mineral": 3500,
    "Pet B - Masih berlabel dan tutup": 2000,
    "Botol Warna BENING (MIZONE, SPRITE, MINYAK KAYU PUTIH)": 1000,
    "Botol Plastik Campuran Semua Warna dan Bentuk": 1500,
    "Botol Warna MILKU dan NUTRIBOOST": 500,
    "Gelas A - Gelas plastik kemasan bening TANPA SABLON DAN LABEL": 3000,
    "Gelas B - Warna jernih DENGAN SABLON DAN LABEL": 1500,
    "Gelas Warna (Mountea, Tea Gelas, Ale2)": 2000,
    "Emberan - Semua plastik lunak YANG BUKAN HITAM": 1500,
    "Kresek / Assoy": 500,
    "Plastik Bening Polos PP/PE": 1000,
    "Sedotan Plastik Aqua": 1200,
    "Sedotan Plastik Putih Susu": 1200,
    "Sedotan Plastik Warna Campur": 800,
    "Sedotan Plastik Hitam": 1000,
    "Tutup Botol Plastik / HDPE": 2500,
    "Tutup Galon Aqua Plastik / LDPE": 3000,
    "Tutup Galon Isi Ulang": 2500,
    "Galon AQUA / OASIS UTUH": 2500,
    "Galon AQUA / OASIS PECAH BELAH": 1000,
    "Paralon / PVC": 1200,
    "PP Crystal Bening Transparan / Toples Nastar": 2000,
    "Slopan (kantong minyak goreng, kemasan sunlight)": 300,
    "Kaset CD / VCD": 2000,
    "Kemasan / Tetrapak / Mika": 100,
    "Boncos (karung bekas, tali rapiah plastik)": 500,
    "Naso (Jerigen/Cuka, Botol Minuman Susu)": 2500,
    "Impact - Plastik keras tidak lunak (Yakult, Helm, Body Motor)": 800,
    "HDPE (Botol shampo, pewangi pakaian, pembersih lantai)": 1900,
    "Emberan Hitam - Semua plastik lunak hitam": 1000,
    "PP Inject - Plastik keras fleksible, kuat, tidak jernih": 2500,
    "Nilek / Selang air, kabel utuh / kulit kabel": 2000,

    // ===== LOGAM =====
    "Alumunium": 10000,
    "Besi A (besi cor-coran, padat, tebal)": 4000,
    "Besi Campur / Baja Ringan, sepeda rusak, paku": 2500,
    "Rongsok Campur (alumunium panci, softdrink, siku)": 6000,
    "Kaleng": 2000,
    "Kawat / Seng": 1500,
    "Tembaga Merah / kupas berisi padat tebal": 65000,
    "Tembaga Bakar": 55000,
    "Babet - Bekas onderdil, sperpart, besi berlapis chrome": 5000,
    "Kuningan / logam campuran berwarna kuningan kemerahan": 30000,
    "Kabin / Enamel / Besi lapis cat / Crom Warna / CPU komputer": 2000,

    // ===== KERTAS =====
    "Kertas Koran B / Lecek tidak utuh": 100,
    "Kertas Putih / HVS bertinta hitam": 1500,
    "Kertas Semen": 1400,
    "Kertas Warna / HVS warna, tinta warna, Crayon": 800,
    "Kertas Campur / Semua kertas KECUALI KERTAS NASI": 800,
    "Kardus": 1600,
    "Duplex": 800,
    "Kornes (Gulungan Kain)": 800
};

// =============================================
// FUNGSI GET HARGA
// =============================================

function getHargaByNamaSampah(namaSampah) {
    if (!namaSampah) return 2000;
    
    // Cek exact match
    if (hargaSampahDetail[namaSampah]) {
        return hargaSampahDetail[namaSampah];
    }
    
    // Cek partial match
    var namaLower = namaSampah.toLowerCase();
    for (var key in hargaSampahDetail) {
        if (namaLower.includes(key.toLowerCase()) || key.toLowerCase().includes(namaLower)) {
            return hargaSampahDetail[key];
        }
    }
    
    // Default berdasarkan keyword
    var plastikKeywords = ["botol", "plastik", "gelas", "kresek", "sedotan", "tutup", "galon", 
                           "paralon", "ember", "hdpe", "pp", "tetrapak", "slopan", "kaset", 
                           "boncos", "naso", "impact", "nilek", "pp inject"];
    var logamKeywords = ["alumunium", "besi", "tembaga", "kuningan", "kaleng", "kawat", "seng", 
                         "rongsok", "babet", "kabin", "logam"];
    var kertasKeywords = ["kertas", "koran", "hvs", "kardus", "duplex", "semen", "kornes"];
    
    for (var i = 0; i < plastikKeywords.length; i++) {
        if (namaLower.includes(plastikKeywords[i])) return 2000;
    }
    for (var i = 0; i < logamKeywords.length; i++) {
        if (namaLower.includes(logamKeywords[i])) return 5000;
    }
    for (var i = 0; i < kertasKeywords.length; i++) {
        if (namaLower.includes(kertasKeywords[i])) return 1000;
    }
    
    return 2000;
}

function getKategoriByNamaSampah(namaSampah) {
    if (!namaSampah) return 'plastik';
    
    var namaLower = namaSampah.toLowerCase();
    var plastikKeywords = ["botol", "plastik", "gelas", "kresek", "sedotan", "tutup", "galon", 
                           "paralon", "ember", "hdpe", "pp", "tetrapak", "slopan", "kaset", 
                           "boncos", "naso", "impact", "nilek", "pp inject"];
    var logamKeywords = ["alumunium", "besi", "tembaga", "kuningan", "kaleng", "kawat", "seng", 
                         "rongsok", "babet", "kabin", "logam"];
    var kertasKeywords = ["kertas", "koran", "hvs", "kardus", "duplex", "semen", "kornes"];
    
    for (var i = 0; i < plastikKeywords.length; i++) {
        if (namaLower.includes(plastikKeywords[i])) return 'plastik';
    }
    for (var i = 0; i < logamKeywords.length; i++) {
        if (namaLower.includes(logamKeywords[i])) return 'logam';
    }
    for (var i = 0; i < kertasKeywords.length; i++) {
        if (namaLower.includes(kertasKeywords[i])) return 'kertas';
    }
    
    return 'plastik';
}

// =============================================
// EXPORT KE GLOBAL
// =============================================
window.hargaSampahDetail = hargaSampahDetail;
window.getHargaByNamaSampah = getHargaByNamaSampah;
window.getKategoriByNamaSampah = getKategoriByNamaSampah;

console.log('✅ Data Harga loaded:', Object.keys(hargaSampahDetail).length, 'items');
console.log('📋 Rincian: Plastik ' + presetSampah.plastik.length + ' item, Logam ' + presetSampah.logam.length + ' item, Kertas ' + presetSampah.kertas.length + ' item');