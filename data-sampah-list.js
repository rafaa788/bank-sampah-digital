// data-sampah-list.js
// =====================================================
// DAFTAR NAMA SAMPAH PER KATEGORI - VERSI LENGKAP
// =====================================================

var presetSampah = {
    plastik: [
        "Pet A - Botol TANPA tutup dan label + Galon Le Mineral",
        "Pet B - Masih berlabel dan tutup",
        "Botol Warna BENING (MIZONE, SPRITE, MINYAK KAYU PUTIH)",
        "Botol Plastik Campuran Semua Warna dan Bentuk",
        "Botol Warna MILKU dan NUTRIBOOST",
        "Gelas A - Gelas plastik kemasan bening TANPA SABLON DAN LABEL",
        "Gelas B - Warna jernih DENGAN SABLON DAN LABEL",
        "Gelas Warna (Mountea, Tea Gelas, Ale2)",
        "Emberan - Semua plastik lunak YANG BUKAN HITAM",
        "Kresek / Assoy",
        "Plastik Bening Polos PP/PE",
        "Sedotan Plastik Aqua",
        "Sedotan Plastik Putih Susu",
        "Sedotan Plastik Warna Campur",
        "Sedotan Plastik Hitam",
        "Tutup Botol Plastik / HDPE",
        "Tutup Galon Aqua Plastik / LDPE",
        "Tutup Galon Isi Ulang",
        "Galon AQUA / OASIS UTUH",
        "Galon AQUA / OASIS PECAH BELAH",
        "Paralon / PVC",
        "PP Crystal Bening Transparan / Toples Nastar",
        "Slopan (kantong minyak goreng, kemasan sunlight)",
        "Kaset CD / VCD",
        "Kemasan / Tetrapak / Mika",
        "Boncos (karung bekas, tali rapiah plastik)",
        "Naso (Jerigen/Cuka, Botol Minuman Susu)",
        "Impact - Plastik keras tidak lunak (Yakult, Helm, Body Motor)",
        "HDPE (Botol shampo, pewangi pakaian, pembersih lantai)",
        "Emberan Hitam - Semua plastik lunak hitam",
        "PP Inject - Plastik keras fleksible, kuat, tidak jernih",
        "Nilek / Selang air, kabel utuh / kulit kabel"
    ],
    logam: [
        "Alumunium",
        "Besi A (besi cor-coran, padat, tebal)",
        "Besi Campur / Baja Ringan, sepeda rusak, paku",
        "Rongsok Campur (alumunium panci, softdrink, siku)",
        "Kaleng",
        "Kawat / Seng",
        "Tembaga Merah / kupas berisi padat tebal",
        "Tembaga Bakar",
        "Babet - Bekas onderdil, sperpart, besi berlapis chrome",
        "Kuningan / logam campuran berwarna kuningan kemerahan",
        "Kabin / Enamel / Besi lapis cat / Crom Warna / CPU komputer"
    ],
    kertas: [
        "Kertas Koran B / Lecek tidak utuh",
        "Kertas Putih / HVS bertinta hitam",
        "Kertas Semen",
        "Kertas Warna / HVS warna, tinta warna, Crayon",
        "Kertas Campur / Semua kertas KECUALI KERTAS NASI",
        "Kardus",
        "Duplex",
        "Kornes (Gulungan Kain)"
    ]
};

window.presetSampah = presetSampah;
console.log('✅ Data Sampah List loaded:', 
    presetSampah.plastik.length + ' Plastik, ' + 
    presetSampah.logam.length + ' Logam, ' + 
    presetSampah.kertas.length + ' Kertas');