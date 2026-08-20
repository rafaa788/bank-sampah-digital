// laporan.js - LENGKAP DENGAN FUNGSI DOWNLOAD
// =====================================================
// LAPORAN ADMIN EXCEL LENGKAP - DENGAN REKAP PER NAMA SAMPAH
// =====================================================

// ==================== FUNGSI UTILITY ====================
function getFilterTextForReport() {
    var parts = [];
    if (currentFilterBSU && currentFilterBSU !== 'all') parts.push('BSU: ' + currentFilterBSU);
    if (currentFilterRW && currentFilterRW !== 'all') parts.push('RW: ' + currentFilterRW);
    if (currentFilterRT && currentFilterRT !== 'all') parts.push('RT: ' + currentFilterRT);
    if (parts.length === 0) return 'Semua Data';
    return parts.join(' | ');
}

var currentFilterBSU = 'all';
var currentFilterRW = 'all';
var currentFilterRT = 'all';

// ==================== FUNGSI FILTER ====================
function filterDataByFilters(data, bsu, rw, rt) {
    var result = data.slice();
    if (bsu && bsu !== 'all') {
        result = result.filter(function(item) { return item.bsuId === bsu || item.bsu === bsu; });
    }
    if (rw && rw !== 'all') {
        result = result.filter(function(item) { return item.rw === rw; });
    }
    if (rt && rt !== 'all') {
        result = result.filter(function(item) { return item.rt === rt; });
    }
    return result;
}

// ==================== FORMAT TANGGAL ====================
var namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatTanggalIndo(date) {
    if (typeof date === 'string') {
        date = new Date(date + 'T00:00:00');
    }
    if (!(date instanceof Date) || isNaN(date)) {
        date = new Date();
    }
    var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return days[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
}

function formatRupiah(angka) {
    if (angka === undefined || angka === null || isNaN(angka)) return '0';
    var str = Math.round(angka).toString();
    var result = '';
    var count = 0;
    for (var i = str.length - 1; i >= 0; i--) {
        result = str[i] + result;
        count++;
        if (count % 3 === 0 && i > 0) {
            result = '.' + result;
        }
    }
    return result;
}

function escapeHtml(text) {
    if (!text) return '';
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// ==================== GENERATE REKAP PER NASABAH ADMIN ====================
function generateRekapPerNasabahAdmin(data) {
    var nasabahMap = {};
    
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var bsu = item.bsu || 'Tanpa BSU';
        var nasabah = item.namaNasabah || '-';
        
        if (nasabah === '-' || nasabah === 'undefined' || nasabah === 'null') continue;
        
        var key = bsu + '|' + nasabah;
        if (!nasabahMap[key]) {
            nasabahMap[key] = {
                bsu: bsu,
                namaNasabah: nasabah,
                totalBerat: 0,
                totalNilai: 0,
                totalTransaksi: 0,
                detail: [],
                rw: item.rw || '-',
                rt: item.rt || '-',
                fotoTimbang: null,
                fotoHasil: null,
                fotoBukti: null
            };
        }
        var berat = parseFloat(item.berat) || 0;
        var harga = parseFloat(item.hargaPerKg) || getHargaByNamaSampah(item.nama);
        var nilai = berat * harga;
        nasabahMap[key].totalBerat += berat;
        nasabahMap[key].totalNilai += nilai;
        nasabahMap[key].totalTransaksi++;
        
        if (item.foto_timbang) nasabahMap[key].fotoTimbang = item.foto_timbang;
        if (item.foto_hasil) nasabahMap[key].fotoHasil = item.foto_hasil;
        if (item.foto_bukti) nasabahMap[key].fotoBukti = item.foto_bukti;
        
        nasabahMap[key].detail.push({
            nama: item.nama || 'Tidak Diketahui',
            berat: berat,
            harga: harga,
            nilai: nilai,
            tanggal: item.tanggal || new Date().toISOString(),
            rw: item.rw || '-',
            rt: item.rt || '-',
            fotoTimbang: item.foto_timbang || null,
            fotoHasil: item.foto_hasil || null,
            fotoBukti: item.foto_bukti || null
        });
    }
    
    var result = Object.values(nasabahMap);
    result.sort(function(a, b) {
        if (a.bsu !== b.bsu) return a.bsu.localeCompare(b.bsu);
        return b.totalNilai - a.totalNilai;
    });
    
    return result;
}

// ==================== GENERATE REKAP PER NAMA SAMPAH ====================
function generateRekapPerSampah(data) {
    var sampahMap = {};
    
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var namaSampah = item.nama || 'Tidak Diketahui';
        
        if (!sampahMap[namaSampah]) {
            sampahMap[namaSampah] = {
                nama: namaSampah,
                totalBerat: 0,
                totalNilai: 0,
                totalTransaksi: 0,
                bsu: item.bsu || '-',
                jenis: item.jenis || 'nonorganik',
                hargaPerKg: item.hargaPerKg || 0
            };
        }
        var berat = parseFloat(item.berat) || 0;
        var harga = parseFloat(item.hargaPerKg) || getHargaByNamaSampah(item.nama);
        var nilai = berat * harga;
        sampahMap[namaSampah].totalBerat += berat;
        sampahMap[namaSampah].totalNilai += nilai;
        sampahMap[namaSampah].totalTransaksi++;
        if (item.hargaPerKg) sampahMap[namaSampah].hargaPerKg = item.hargaPerKg;
    }
    
    var result = Object.values(sampahMap);
    result.sort(function(a, b) {
        return b.totalNilai - a.totalNilai;
    });
    
    return result;
}

// ==================== GENERATE LAPORAN ====================
function generateLaporanMingguanAdmin(data, bsu, rw, rt) {
    var filtered = filterDataByFilters(data || daftarSampah, bsu || currentFilterBSU, rw || currentFilterRW, rt || currentFilterRT);
    var today = new Date();
    var weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    var totalOrganik = 0, totalNonorganik = 0, totalNilai = 0;
    for (var i = 0; i < filtered.length; i++) {
        var item = filtered[i];
        if (item.jenis === 'organik') totalOrganik += item.berat;
        else totalNonorganik += item.berat;
        totalNilai += (item.berat * item.hargaPerKg);
    }
    var totalBerat = totalOrganik + totalNonorganik;
    
    return {
        title: 'Laporan Mingguan Bank Sampah Digital',
        periode: formatTanggalIndo(weekStart) + ' s/d ' + formatTanggalIndo(today),
        data: filtered,
        totalOrganik: totalOrganik,
        totalNonorganik: totalNonorganik,
        totalBerat: totalBerat,
        totalNilai: totalNilai,
        jumlahItem: filtered.length,
        filterInfo: getFilterTextForReport(),
        jenis: 'mingguan'
    };
}

function generateLaporanBulananAdmin(data, bsu, rw, rt) {
    var filtered = filterDataByFilters(data || daftarSampah, bsu || currentFilterBSU, rw || currentFilterRW, rt || currentFilterRT);
    var today = new Date();
    var totalOrganik = 0, totalNonorganik = 0, totalNilai = 0;
    for (var i = 0; i < filtered.length; i++) {
        var item = filtered[i];
        if (item.jenis === 'organik') totalOrganik += item.berat;
        else totalNonorganik += item.berat;
        totalNilai += (item.berat * item.hargaPerKg);
    }
    var totalBerat = totalOrganik + totalNonorganik;
    
    return {
        title: 'Laporan Bulanan Bank Sampah Digital',
        periode: namaBulan[today.getMonth()] + ' ' + today.getFullYear(),
        data: filtered,
        totalOrganik: totalOrganik,
        totalNonorganik: totalNonorganik,
        totalBerat: totalBerat,
        totalNilai: totalNilai,
        jumlahItem: filtered.length,
        filterInfo: getFilterTextForReport(),
        jenis: 'bulanan'
    };
}

function generateLaporanTahunanAdmin(data, bsu, rw, rt) {
    var filtered = filterDataByFilters(data || daftarSampah, bsu || currentFilterBSU, rw || currentFilterRW, rt || currentFilterRT);
    var today = new Date();
    var totalOrganik = 0, totalNonorganik = 0, totalNilai = 0;
    for (var i = 0; i < filtered.length; i++) {
        var item = filtered[i];
        if (item.jenis === 'organik') totalOrganik += item.berat;
        else totalNonorganik += item.berat;
        totalNilai += (item.berat * item.hargaPerKg);
    }
    var totalBerat = totalOrganik + totalNonorganik;
    
    return {
        title: 'Laporan Tahunan Bank Sampah Digital',
        periode: 'Tahun ' + today.getFullYear(),
        data: filtered,
        totalOrganik: totalOrganik,
        totalNonorganik: totalNonorganik,
        totalBerat: totalBerat,
        totalNilai: totalNilai,
        jumlahItem: filtered.length,
        filterInfo: getFilterTextForReport(),
        jenis: 'tahunan'
    };
}

// ==================== GENERATE HTML EXCEL ADMIN ====================
function generateAdminExcelHTML(rekapData, allData, filterBSU, filterRW, filterRT, periode) {
    var tglCetak = formatTanggalIndo(new Date());
    var admin = sessionStorage.getItem('adminName') || 'Admin';
    var periodeText = periode || 'Laporan';
    
    // Generate rekap per sampah
    var rekapSampah = generateRekapPerSampah(allData);
    
    var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ';
    html += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
    html += 'xmlns="http://www.w3.org/TR/REC-html40">';
    html += '<head><meta charset="UTF-8">';
    html += '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>';
    html += '<x:ExcelWorksheet><x:Name>Laporan_Admin</x:Name><x:WorksheetOptions>';
    html += '<x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>';
    html += '</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
    html += '<style>';
    html += 'body { font-family: "Calibri", Arial, sans-serif; padding: 10px; }';
    html += '.main-title { background: #1a237e; color: white; padding: 12px; text-align: center; font-size: 16px; font-weight: bold; }';
    html += '.sub-title { background: #e8eaf6; padding: 8px; text-align: center; font-size: 11px; }';
    html += '.section-title { background: #283593; color: white; padding: 6px 10px; font-size: 12px; font-weight: bold; margin-top: 12px; }';
    html += '.bsu-header { background: #4caf7a; color: white; padding: 6px 10px; font-size: 12px; font-weight: bold; margin-top: 10px; }';
    html += '.nasabah-title { background: #e8f5e9; padding: 5px 10px; font-size: 11px; font-weight: bold; color: #1a5e2a; margin-top: 8px; border-left: 4px solid #2e7d32; }';
    html += 'table { border-collapse: collapse; width: 100%; margin: 4px 0; }';
    html += 'th { background: #283593; color: white; padding: 5px 6px; border: 1px solid #999; font-weight: bold; text-align: center; font-size: 9px; }';
    html += 'td { padding: 4px 6px; border: 1px solid #ddd; text-align: center; font-size: 9px; vertical-align: middle; }';
    html += '.total-row { background: #e8f5e9; font-weight: bold; }';
    html += '.sub-total-row { background: #c5cae9; font-weight: bold; }';
    html += '.sampah-cell { text-align: left; font-weight: 600; }';
    html += '.nasabah-name { text-align: left; font-weight: bold; color: #1a237e; }';
    html += '.foto-cell { text-align: center; vertical-align: middle; }';
    html += '.foto-img { max-width: 80px; max-height: 80px; border-radius: 4px; border: 1px solid #ccc; }';
    html += '.grand-total { background: #1a237e; color: white; padding: 10px; text-align: center; font-size: 13px; font-weight: bold; margin-top: 12px; }';
    html += '.footer { text-align: center; font-size: 8px; color: #999; padding: 10px; border-top: 1px solid #ddd; margin-top: 10px; }';
    html += '.summary-box { background: #e8eaf6; padding: 8px 10px; border-radius: 4px; margin: 6px 0; }';
    html += '.summary-box td { border: none; padding: 2px 5px; font-size: 10px; }';
    html += '.foto-label { font-size: 7px; color: #666; display: block; }';
    html += '.sampah-rekap-title { background: #4caf50; color: white; padding: 6px 10px; font-size: 12px; font-weight: bold; margin-top: 10px; }';
    html += '</style>';
    html += '</head><body>';
    
    // HEADER
    html += '<div class="main-title"> LAPORAN ADMIN - BANK SAMPAH DIGITAL</div>';
    html += '<div class="sub-title">';
    html += 'BSI Mandiri - Desa Gunung Putri | ';
    html += 'Periode: ' + tglCetak;
    if (filterBSU && filterBSU !== 'all') html += ' | BSU: ' + filterBSU;
    if (filterRW && filterRW !== 'all') html += ' | RW: ' + filterRW;
    if (filterRT && filterRT !== 'all') html += ' | RT: ' + filterRT;
    html += ' | Dicetak oleh: ' + admin;
    html += ' | ' + periodeText;
    html += '</div>';
    
    // ===== SUMMARY =====
    html += '<div class="section-title"> RINGKASAN DATA</div>';
    html += '<div class="summary-box">';
    html += '<table style="width:100%;border:none;">';
    var totalBeratAll = 0, totalNilaiAll = 0;
    for (var i = 0; i < allData.length; i++) {
        totalBeratAll += allData[i].berat;
        var harga = allData[i].hargaPerKg || getHargaByNamaSampah(allData[i].nama);
        totalNilaiAll += allData[i].berat * harga;
    }
    html += '<tr><td style="border:none;text-align:left;font-weight:bold;width:15%;">Total Transaksi:</td><td style="border:none;text-align:left;">' + allData.length + '</td>';
    html += '<td style="border:none;text-align:left;font-weight:bold;width:15%;">Total Nasabah:</td><td style="border:none;text-align:left;">' + rekapData.length + '</td>';
    html += '<td style="border:none;text-align:left;font-weight:bold;width:15%;">Total Berat:</td><td style="border:none;text-align:left;">' + totalBeratAll.toFixed(2) + ' kg</td>';
    html += '<td style="border:none;text-align:left;font-weight:bold;width:15%;">Total Nilai:</td><td style="border:none;text-align:left;">' + formatRupiah(totalNilaiAll) + '</td></tr>';
    html += '</table></div>';
    
    // ===== REKAP PER NAMA SAMPAH =====
    html += '<div class="section-title"> REKAP PER NAMA SAMPAH</div>';
    html += '<table>';
    html += '<tr>';
    html += '<th style="width:5%;">No</th>';
    html += '<th style="width:30%;">Nama Sampah</th>';
    html += '<th style="width:10%;">Jenis</th>';
    html += '<th style="width:12%;">Total Berat (kg)</th>';
    html += '<th style="width:10%;">Total Transaksi</th>';
    html += '<th style="width:10%;">Harga/kg</th>';
    html += '<th style="width:18%;">Total Nilai</th>';
    html += '</tr>';
    
    var grandTotalSampahBerat = 0;
    var grandTotalSampahNilai = 0;
    var grandTotalSampahTransaksi = 0;
    
    for (var i = 0; i < rekapSampah.length; i++) {
        var s = rekapSampah[i];
        var bgColor = (i % 2 === 0) ? '#ffffff' : '#f9f9f9';
        var jenisLabel = (s.jenis === 'organik') ? ' Organik' : ' Nonorganik';
        
        html += '<tr style="background:' + bgColor + ';">';
        html += '<td>' + (i + 1) + '</td>';
        html += '<td class="sampah-cell">' + escapeHtml(s.nama) + '</td>';
        html += '<td>' + jenisLabel + '</td>';
        html += '<td>' + s.totalBerat.toFixed(2) + '</td>';
        html += '<td>' + s.totalTransaksi + '</td>';
        html += '<td>' + formatRupiah(s.hargaPerKg) + '</td>';
        html += '<td style="font-weight:bold;color:#1a237e;">' + formatRupiah(s.totalNilai) + '</td>';
        html += '</tr>';
        
        grandTotalSampahBerat += s.totalBerat;
        grandTotalSampahNilai += s.totalNilai;
        grandTotalSampahTransaksi += s.totalTransaksi;
    }
    
    html += '<tr class="total-row">';
    html += '<td colspan="2" style="text-align:right;">GRAND TOTAL</td>';
    html += '<td></td>';
    html += '<td>' + grandTotalSampahBerat.toFixed(2) + ' kg</td>';
    html += '<td>' + grandTotalSampahTransaksi + '</td>';
    html += '<td></td>';
    html += '<td>' + formatRupiah(grandTotalSampahNilai) + '</td>';
    html += '</tr>';
    html += '</table><br>';
    
    // ===== DATA PER BSU =====
    var bsuGroups = {};
    for (var i = 0; i < rekapData.length; i++) {
        var item = rekapData[i];
        if (!bsuGroups[item.bsu]) bsuGroups[item.bsu] = [];
        bsuGroups[item.bsu].push(item);
    }
    
    var grandTotalAll = 0;
    var grandTotalBerat = 0;
    var grandTotalTransaksi = 0;
    
    for (var bsu in bsuGroups) {
        var items = bsuGroups[bsu];
        
        html += '<div class="bsu-header"> ' + bsu + '</div>';
        
        // Ringkasan per nasabah
        html += '<table>';
        html += '<tr>';
        html += '<th style="width:5%;">No</th>';
        html += '<th style="width:18%;">Nama Nasabah</th>';
        html += '<th style="width:10%;">RW/RT</th>';
        html += '<th style="width:12%;">Total Berat</th>';
        html += '<th style="width:10%;">Transaksi</th>';
        html += '<th style="width:15%;">Total Tabungan</th>';
        html += '<th style="width:10%;"> Timbang</th>';
        html += '<th style="width:10%;"> Hasil</th>';
        html += '<th style="width:10%;"> Bukti</th>';
        html += '</tr>';
        
        var grandTotal = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            
            html += '<tr>';
            html += '<td>' + (i + 1) + '</td>';
            html += '<td class="nasabah-name">' + escapeHtml(item.namaNasabah) + '</td>';
            html += '<td>' + (item.rw || '-') + ' - ' + (item.rt || '-') + '</td>';
            html += '<td>' + item.totalBerat.toFixed(2) + '</td>';
            html += '<td>' + item.totalTransaksi + '</td>';
            html += '<td style="font-weight:bold;color:#1a237e;">' + formatRupiah(item.totalNilai) + '</td>';
            
            html += '<td class="foto-cell">';
            if (item.fotoTimbang) {
                html += '📷 Ada';
            } else {
                html += '-';
            }
            html += '</td>';
            
            html += '<td class="foto-cell">';
            if (item.fotoHasil) {
                html += '📸 Ada';
            } else {
                html += '-';
            }
            html += '</td>';
            
            html += '<td class="foto-cell">';
            if (item.fotoBukti) {
                html += '📋 Ada';
            } else {
                html += '-';
            }
            html += '</td>';
            
            html += '</tr>';
            grandTotal += item.totalNilai;
            grandTotalAll += item.totalNilai;
            grandTotalBerat += item.totalBerat;
            grandTotalTransaksi += item.totalTransaksi;
        }
        
        html += '<tr class="sub-total-row">';
        html += '<td colspan="5" style="text-align:right;">TOTAL ' + bsu + '</td>';
        html += '<td>' + formatRupiah(grandTotal) + '</td>';
        html += '<td colspan="3"></td>';
        html += '</tr>';
        html += '</table>';
        
        // Detail per nasabah
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            html += '<div class="nasabah-title"> Detail Transaksi: ' + escapeHtml(item.namaNasabah) + ' (' + (item.rw || '-') + ' - ' + (item.rt || '-') + ')</div>';
            html += '<table>';
            html += '<tr>';
            html += '<th style="width:5%;">No</th>';
            html += '<th style="width:12%;">Tanggal</th>';
            html += '<th style="width:18%;">Nama Sampah</th>';
            html += '<th style="width:8%;">Jenis</th>';
            html += '<th style="width:8%;">Berat</th>';
            html += '<th style="width:10%;">Harga/kg</th>';
            html += '<th style="width:12%;">Nilai</th>';
            html += '<th style="width:9%;"> Timbang</th>';
            html += '<th style="width:9%;"> Hasil</th>';
            html += '<th style="width:9%;"> Bukti</th>';
            html += '</tr>';
            
            for (var j = 0; j < item.detail.length; j++) {
                var d = item.detail[j];
                var jenis = (d.nama && d.nama.toLowerCase().includes('organik')) ? 'Organik' : 'Nonorganik';
                var bgColor = (j % 2 === 0) ? '#ffffff' : '#f9f9f9';
                
                html += '<tr style="background:' + bgColor + ';">';
                html += '<td>' + (j + 1) + '</td>';
                html += '<td>' + (d.tanggal ? formatTanggalIndo(d.tanggal) : '-') + '</td>';
                html += '<td class="sampah-cell">' + escapeHtml(d.nama) + '</td>';
                html += '<td>' + jenis + '</td>';
                html += '<td>' + d.berat.toFixed(2) + '</td>';
                html += '<td>' + formatRupiah(d.harga) + '</td>';
                html += '<td style="font-weight:bold;color:#1a237e;">' + formatRupiah(d.nilai) + '</td>';
                
                html += '<td class="foto-cell">';
                if (d.fotoTimbang) {
                    html += '📷';
                } else {
                    html += '-';
                }
                html += '</td>';
                
                html += '<td class="foto-cell">';
                if (d.fotoHasil) {
                    html += '📸';
                } else {
                    html += '-';
                }
                html += '</td>';
                
                html += '<td class="foto-cell">';
                if (d.fotoBukti) {
                    html += '📋';
                } else {
                    html += '-';
                }
                html += '</td>';
                
                html += '</tr>';
            }
            
            html += '<tr class="sub-total-row">';
            html += '<td colspan="6" style="text-align:right;">Sub Total ' + escapeHtml(item.namaNasabah) + '</td>';
            html += '<td>' + formatRupiah(item.totalNilai) + '</td>';
            html += '<td colspan="3"></td>';
            html += '</tr>';
            html += '</table><br>';
        }
    }
    
    // ===== GRAND TOTAL =====
    html += '<div class="grand-total">';
    html += ' GRAND TOTAL KESELURUHAN<br>';
    html += formatRupiah(grandTotalAll) + ' | Total Berat: ' + grandTotalBerat.toFixed(2) + ' kg | Total Transaksi: ' + grandTotalTransaksi;
    html += '</div>';
    
    // ===== FOOTER =====
    html += '<div class="footer">';
    html += 'Dicetak: ' + tglCetak + '<br>';
    html += 'Dicetak oleh: ' + admin + '<br>';
    html += 'Bank Sampah Digital - Kelola Sampah, Selamatkan Bumi';
    html += '</div>';
    
    html += '</body></html>';
    return html;
}

// ==================== GENERATE PDF HTML ADMIN ====================
function generateAdminPDFHTML(rekapData, allData, filterBSU, filterRW, filterRT, periode) {
    var tglCetak = formatTanggalIndo(new Date());
    var admin = sessionStorage.getItem('adminName') || 'Admin';
    
    var totalBeratAll = 0, totalNilaiAll = 0;
    for (var i = 0; i < allData.length; i++) {
        totalBeratAll += allData[i].berat;
        var harga = allData[i].hargaPerKg || getHargaByNamaSampah(allData[i].nama);
        totalNilaiAll += allData[i].berat * harga;
    }
    
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
    html += '<title>Laporan Admin - Bank Sampah Digital</title>';
    html += '<style>';
    html += 'body { font-family: "Times New Roman", Arial, sans-serif; padding: 15px; font-size: 10px; }';
    html += '.header { text-align: center; margin-bottom: 15px; border-bottom: 3px solid #1a237e; padding-bottom: 10px; }';
    html += '.header h1 { color: #1a237e; margin-bottom: 3px; font-size: 18px; }';
    html += '.header .subtitle { color: #666; font-size: 11px; }';
    html += '.header .info { font-size: 10px; color: #888; margin-top: 3px; }';
    html += '.section-title { background: #1a237e; color: white; padding: 4px 8px; margin: 10px 0 6px; border-radius: 4px; font-size: 11px; }';
    html += '.bsu-title { background: #4caf7a; color: white; padding: 4px 8px; margin: 8px 0 5px; border-radius: 4px; font-size: 11px; }';
    html += '.nasabah-title { background: #e8f5e9; padding: 3px 8px; margin: 6px 0 4px; border-left: 4px solid #2e7d32; font-weight: bold; font-size: 10px; color: #1a5e2a; }';
    html += '.summary-box { background: #e8eaf6; padding: 6px 10px; border-radius: 4px; margin: 6px 0; }';
    html += '.summary-box table { width: 100%; border: none; }';
    html += '.summary-box td { border: none; padding: 2px 5px; font-size: 9px; }';
    html += 'table { width: 100%; border-collapse: collapse; margin: 4px 0; }';
    html += 'th { background: #283593; color: white; padding: 3px 5px; text-align: center; border: 1px solid #ddd; font-size: 8px; }';
    html += 'td { padding: 3px 5px; border: 1px solid #ddd; text-align: center; font-size: 8px; }';
    html += '.total-row { background: #e8f5e9; font-weight: bold; }';
    html += '.sub-total-row { background: #c5cae9; font-weight: bold; }';
    html += '.sampah-cell { text-align: left; font-weight: 600; }';
    html += '.nasabah-name { text-align: left; font-weight: bold; color: #1a237e; }';
    html += '.footer { margin-top: 15px; text-align: center; font-size: 8px; color: #999; border-top: 1px solid #ddd; padding-top: 8px; }';
    html += '.signature { margin-top: 15px; display: flex; justify-content: space-around; }';
    html += '.signature-box { text-align: center; }';
    html += '.signature-line { margin-top: 20px; width: 120px; border-top: 1px solid #000; margin: 0 auto; }';
    html += '.signature-box p { margin-top: 3px; font-size: 8px; }';
    html += '.page-break { page-break-after: always; }';
    html += '.grand-total { background: #1a237e; color: white; padding: 8px; text-align: center; border-radius: 4px; margin-top: 10px; font-size: 12px; }';
    html += '.no-print { display: block; } @media print { .no-print { display: none; } }';
    html += '</style>';
    html += '</head><body>';
    
    // HEADER
    html += '<div class="header">';
    html += '<h1>BANK SAMPAH DIGITAL</h1>';
    html += '<div class="subtitle">BSI Mandiri - Desa Gunung Putri</div>';
    html += '<div class="info"><strong>LAPORAN ' + periode + ' - ADMIN</strong></div>';
    html += '<div class="info">Periode: ' + tglCetak + ' | Dicetak oleh: ' + admin;
    if (filterBSU && filterBSU !== 'all') html += ' | BSU: ' + filterBSU;
    if (filterRW && filterRW !== 'all') html += ' | RW: ' + filterRW;
    if (filterRT && filterRT !== 'all') html += ' | RT: ' + filterRT;
    html += '</div>';
    html += '</div>';
    
    // SUMMARY
    html += '<div class="section-title"> RINGKASAN DATA</div>';
    html += '<div class="summary-box">';
    html += '<table><tr><td><strong>Total Transaksi:</strong></td><td>' + allData.length + '</td>';
    html += '<td><strong>Total Nasabah:</strong></td><td>' + rekapData.length + '</td>';
    html += '<td><strong>Total Berat:</strong></td><td>' + totalBeratAll.toFixed(2) + ' kg</td>';
    html += '<td><strong>Total Nilai:</strong></td><td>' + formatRupiah(totalNilaiAll) + '</td></tr></table>';
    html += '</div>';
    
    // REKAP PER NAMA SAMPAH
    var rekapSampah = generateRekapPerSampah(allData);
    html += '<div class="section-title"> REKAP PER NAMA SAMPAH</div>';
    html += '<table>';
    html += '<tr><th>No</th><th>Nama Sampah</th><th>Jenis</th><th>Total Berat (kg)</th><th>Transaksi</th><th>Total Nilai</th></tr>';
    
    for (var i = 0; i < Math.min(rekapSampah.length, 20); i++) {
        var s = rekapSampah[i];
        html += '<tr><td>' + (i + 1) + '</td>';
        html += '<td class="sampah-cell">' + escapeHtml(s.nama) + '</td>';
        html += '<td>' + (s.jenis === 'organik' ? 'Organik' : 'Nonorganik') + '</td>';
        html += '<td>' + s.totalBerat.toFixed(2) + '</td>';
        html += '<td>' + s.totalTransaksi + '</td>';
        html += '<td>' + formatRupiah(s.totalNilai) + '</td></tr>';
    }
    html += '</table><br>';
    
    // DATA PER BSU
    var bsuGroups = {};
    for (var i = 0; i < rekapData.length; i++) {
        var item = rekapData[i];
        if (!bsuGroups[item.bsu]) bsuGroups[item.bsu] = [];
        bsuGroups[item.bsu].push(item);
    }
    
    var grandTotalAll = 0;
    var grandTotalBerat = 0;
    var grandTotalTransaksi = 0;
    
    for (var bsu in bsuGroups) {
        var items = bsuGroups[bsu];
        
        html += '<div class="bsu-title"> ' + bsu + '</div>';
        
        html += '<table>';
        html += '<tr><th>No</th><th>Nama Nasabah</th><th>RW/RT</th><th>Berat (kg)</th><th>Transaksi</th><th>Tabungan</th></tr>';
        
        var grandTotal = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            
            html += '<tr>' +
                '<td>' + (i + 1) + '</td>' +
                '<td class="nasabah-name">' + escapeHtml(item.namaNasabah) + '</td>' +
                '<td>' + (item.rw || '-') + ' - ' + (item.rt || '-') + '</td>' +
                '<td>' + item.totalBerat.toFixed(2) + '</td>' +
                '<td>' + item.totalTransaksi + '</td>' +
                '<td>' + formatRupiah(item.totalNilai) + '</td>' +
                '</tr>';
            grandTotal += item.totalNilai;
            grandTotalAll += item.totalNilai;
            grandTotalBerat += item.totalBerat;
            grandTotalTransaksi += item.totalTransaksi;
        }
        
        html += '<tr class="sub-total-row">' +
            '<td colspan="5" style="text-align:right;">TOTAL ' + bsu + '</td>' +
            '<td>' + formatRupiah(grandTotal) + '</td>' +
            '</tr>';
        html += '</table>';
        
        // Detail per nasabah
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            html += '<div class="nasabah-title"> Detail: ' + escapeHtml(item.namaNasabah) + ' (' + (item.rw || '-') + ' - ' + (item.rt || '-') + ')</div>';
            html += '<table>';
            html += '<tr><th>No</th><th>Tanggal</th><th>Nama Sampah</th><th>Berat</th><th>Harga</th><th>Nilai</th></tr>';
            
            for (var j = 0; j < item.detail.length; j++) {
                var d = item.detail[j];
                
                html += '<tr>' +
                    '<td>' + (j + 1) + '</td>' +
                    '<td>' + (d.tanggal ? formatTanggalIndo(d.tanggal) : '-') + '</td>' +
                    '<td class="sampah-cell">' + escapeHtml(d.nama) + '</td>' +
                    '<td>' + d.berat.toFixed(2) + '</td>' +
                    '<td>' + formatRupiah(d.harga) + '</td>' +
                    '<td>' + formatRupiah(d.nilai) + '</td>' +
                    '</tr>';
            }
            
            html += '<tr class="sub-total-row">' +
                '<td colspan="5" style="text-align:right;">Sub Total ' + escapeHtml(item.namaNasabah) + '</td>' +
                '<td>' + formatRupiah(item.totalNilai) + '</td>' +
                '</tr>';
            html += '</table>';
        }
        
        html += '<div class="page-break"></div>';
    }
    
    // GRAND TOTAL
    html += '<div class="grand-total">';
    html += ' GRAND TOTAL KESELURUHAN<br>';
    html += formatRupiah(grandTotalAll) + ' | Total Berat: ' + grandTotalBerat.toFixed(2) + ' kg | Total Transaksi: ' + grandTotalTransaksi;
    html += '</div>';
    
    html += '<div class="footer">';
    html += '<p>Dicetak pada: ' + tglCetak + '</p>';
    html += '<p>Dicetak oleh: ' + admin + '</p>';
    html += '<p>Bank Sampah Digital - Kelola Sampah, Selamatkan Bumi</p>';
    html += '</div>';
    
    html += '<div class="signature">';
    html += '<div class="signature-box"><div class="signature-line"></div><p>Kepala Bank Sampah</p></div>';
    html += '<div class="signature-box"><div class="signature-line"></div><p>Ketua BSU</p></div>';
    html += '</div>';
    
    html += '<div class="no-print" style="text-align:center;margin-top:10px;">';
    html += '<button onclick="window.print()" style="padding:6px 20px;background:#1a237e;color:white;border:none;border-radius:4px;font-size:12px;cursor:pointer;">🖨️ Cetak / Simpan PDF</button>';
    html += '</div>';
    
    html += '</body></html>';
    return html;
}

// ==================== GENERATE WORD HTML ADMIN ====================
function generateAdminWordHTML(rekapData, allData, filterBSU, filterRW, filterRT, periode) {
    var tglCetak = formatTanggalIndo(new Date());
    var admin = sessionStorage.getItem('adminName') || 'Admin';
    
    var totalBeratAll = 0, totalNilaiAll = 0;
    for (var i = 0; i < allData.length; i++) {
        totalBeratAll += allData[i].berat;
        var harga = allData[i].hargaPerKg || getHargaByNamaSampah(allData[i].nama);
        totalNilaiAll += allData[i].berat * harga;
    }
    
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">';
    html += '<title>Laporan Admin - Bank Sampah Digital</title>';
    html += '<style>';
    html += 'body { font-family: "Times New Roman", Arial, sans-serif; padding: 15px; font-size: 11px; }';
    html += '.header { text-align: center; margin-bottom: 15px; border-bottom: 3px solid #1a237e; padding-bottom: 10px; }';
    html += '.header h1 { color: #1a237e; margin-bottom: 3px; font-size: 18px; }';
    html += '.header .subtitle { color: #666; font-size: 12px; }';
    html += '.header .info { font-size: 10px; color: #888; margin-top: 3px; }';
    html += '.section-title { background: #1a237e; color: white; padding: 4px 8px; margin: 10px 0 6px; border-radius: 4px; font-size: 12px; }';
    html += '.bsu-title { background: #4caf7a; color: white; padding: 4px 8px; margin: 8px 0 5px; border-radius: 4px; font-size: 12px; }';
    html += '.nasabah-title { background: #e8f5e9; padding: 3px 8px; margin: 6px 0 4px; border-left: 4px solid #2e7d32; font-weight: bold; font-size: 11px; color: #1a5e2a; }';
    html += '.summary-box { background: #e8eaf6; padding: 6px 10px; border-radius: 4px; margin: 6px 0; }';
    html += '.summary-box table { width: 100%; border: none; }';
    html += '.summary-box td { border: none; padding: 2px 5px; font-size: 10px; }';
    html += 'table { width: 100%; border-collapse: collapse; margin: 4px 0; }';
    html += 'th { background: #283593; color: white; padding: 4px 6px; text-align: center; border: 1px solid #ddd; font-size: 9px; }';
    html += 'td { padding: 3px 6px; border: 1px solid #ddd; text-align: center; font-size: 9px; }';
    html += '.total-row { background: #e8f5e9; font-weight: bold; }';
    html += '.sub-total-row { background: #c5cae9; font-weight: bold; }';
    html += '.sampah-cell { text-align: left; font-weight: 600; }';
    html += '.nasabah-name { text-align: left; font-weight: bold; color: #1a237e; }';
    html += '.footer { margin-top: 15px; text-align: center; font-size: 9px; color: #999; border-top: 1px solid #ddd; padding-top: 8px; }';
    html += '.signature { margin-top: 15px; display: flex; justify-content: space-around; }';
    html += '.signature-box { text-align: center; }';
    html += '.signature-line { margin-top: 20px; width: 120px; border-top: 1px solid #000; margin: 0 auto; }';
    html += '.signature-box p { margin-top: 3px; font-size: 9px; }';
    html += '.page-break { page-break-after: always; }';
    html += '.grand-total { background: #1a237e; color: white; padding: 8px; text-align: center; border-radius: 4px; margin-top: 10px; font-size: 13px; }';
    html += '</style>';
    html += '</head><body>';
    
    // HEADER
    html += '<div class="header">';
    html += '<h1>BANK SAMPAH DIGITAL</h1>';
    html += '<div class="subtitle">BSI Mandiri - Desa Gunung Putri</div>';
    html += '<div class="info"><strong>LAPORAN ' + periode + ' - ADMIN</strong></div>';
    html += '<div class="info">Periode: ' + tglCetak + ' | Dicetak oleh: ' + admin;
    if (filterBSU && filterBSU !== 'all') html += ' | BSU: ' + filterBSU;
    if (filterRW && filterRW !== 'all') html += ' | RW: ' + filterRW;
    if (filterRT && filterRT !== 'all') html += ' | RT: ' + filterRT;
    html += '</div>';
    html += '</div>';
    
    // SUMMARY
    html += '<div class="section-title"> RINGKASAN DATA</div>';
    html += '<div class="summary-box">';
    html += '<table><tr><td><strong>Total Transaksi:</strong></td><td>' + allData.length + '</td>';
    html += '<td><strong>Total Nasabah:</strong></td><td>' + rekapData.length + '</td>';
    html += '<td><strong>Total Berat:</strong></td><td>' + totalBeratAll.toFixed(2) + ' kg</td>';
    html += '<td><strong>Total Nilai:</strong></td><td>' + formatRupiah(totalNilaiAll) + '</td></tr></table>';
    html += '</div>';
    
    // DATA PER BSU
    var bsuGroups = {};
    for (var i = 0; i < rekapData.length; i++) {
        var item = rekapData[i];
        if (!bsuGroups[item.bsu]) bsuGroups[item.bsu] = [];
        bsuGroups[item.bsu].push(item);
    }
    
    var grandTotalAll = 0;
    var grandTotalBerat = 0;
    var grandTotalTransaksi = 0;
    
    for (var bsu in bsuGroups) {
        var items = bsuGroups[bsu];
        
        html += '<div class="bsu-title"> ' + bsu + '</div>';
        
        html += '<table>';
        html += '<tr><th>No</th><th>Nama Nasabah</th><th>RW/RT</th><th>Berat (kg)</th><th>Transaksi</th><th>Tabungan</th></tr>';
        
        var grandTotal = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            
            html += '<tr>' +
                '<td>' + (i + 1) + '</td>' +
                '<td class="nasabah-name">' + escapeHtml(item.namaNasabah) + '</td>' +
                '<td>' + (item.rw || '-') + ' - ' + (item.rt || '-') + '</td>' +
                '<td>' + item.totalBerat.toFixed(2) + '</td>' +
                '<td>' + item.totalTransaksi + '</td>' +
                '<td>' + formatRupiah(item.totalNilai) + '</td>' +
                '</tr>';
            grandTotal += item.totalNilai;
            grandTotalAll += item.totalNilai;
            grandTotalBerat += item.totalBerat;
            grandTotalTransaksi += item.totalTransaksi;
        }
        
        html += '<tr class="sub-total-row">' +
            '<td colspan="5" style="text-align:right;">TOTAL ' + bsu + '</td>' +
            '<td>' + formatRupiah(grandTotal) + '</td>' +
            '</tr>';
        html += '</table>';
        
        // Detail per nasabah
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            html += '<div class="nasabah-title"> Detail: ' + escapeHtml(item.namaNasabah) + ' (' + (item.rw || '-') + ' - ' + (item.rt || '-') + ')</div>';
            html += '<table>';
            html += '<tr><th>No</th><th>Tanggal</th><th>Nama Sampah</th><th>Berat</th><th>Harga</th><th>Nilai</th></tr>';
            
            for (var j = 0; j < item.detail.length; j++) {
                var d = item.detail[j];
                
                html += '<tr>' +
                    '<td>' + (j + 1) + '</td>' +
                    '<td>' + (d.tanggal ? formatTanggalIndo(d.tanggal) : '-') + '</td>' +
                    '<td class="sampah-cell">' + escapeHtml(d.nama) + '</td>' +
                    '<td>' + d.berat.toFixed(2) + '</td>' +
                    '<td>' + formatRupiah(d.harga) + '</td>' +
                    '<td>' + formatRupiah(d.nilai) + '</td>' +
                    '</tr>';
            }
            
            html += '<tr class="sub-total-row">' +
                '<td colspan="5" style="text-align:right;">Sub Total ' + escapeHtml(item.namaNasabah) + '</td>' +
                '<td>' + formatRupiah(item.totalNilai) + '</td>' +
                '</tr>';
            html += '</table>';
        }
        
        html += '<div class="page-break"></div>';
    }
    
    // GRAND TOTAL
    html += '<div class="grand-total">';
    html += ' GRAND TOTAL KESELURUHAN<br>';
    html += formatRupiah(grandTotalAll) + ' | Total Berat: ' + grandTotalBerat.toFixed(2) + ' kg | Total Transaksi: ' + grandTotalTransaksi;
    html += '</div>';
    
    html += '<div class="footer">';
    html += '<p>Dicetak pada: ' + tglCetak + '</p>';
    html += '<p>Dicetak oleh: ' + admin + '</p>';
    html += '<p>Bank Sampah Digital - Kelola Sampah, Selamatkan Bumi</p>';
    html += '</div>';
    
    html += '<div class="signature">';
    html += '<div class="signature-box"><div class="signature-line"></div><p>Kepala Bank Sampah</p></div>';
    html += '<div class="signature-box"><div class="signature-line"></div><p>Ketua BSU</p></div>';
    html += '</div>';
    
    html += '</body></html>';
    return html;
}

// ==================== DOWNLOAD FUNCTIONS ====================
function downloadExcel(html, filename) {
    try {
        // Tambahkan BOM untuk UTF-8
        var blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename || 'laporan.xls';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
        showToast('✅ ' + filename + ' berhasil didownload!', false);
        return true;
    } catch(e) {
        // Fallback
        try {
            var encoded = encodeURIComponent(html);
            var dataUrl = 'data:application/vnd.ms-excel;charset=utf-8,' + encoded;
            var link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename || 'laporan.xls';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('✅ ' + filename + ' berhasil didownload!', false);
            return true;
        } catch(e2) {
            showToast('Gagal download: ' + e2.message, true);
            return false;
        }
    }
}

function downloadWord(html, filename) {
    try {
        var blob = new Blob(['\uFEFF' + html], { type: 'application/msword;charset=utf-8' });
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename || 'laporan.doc';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
        showToast('📝 ' + filename + ' berhasil diekspor!', false);
        return true;
    } catch(e) {
        showToast('Gagal ekspor Word: ' + e.message, true);
        return false;
    }
}

// ==================== EKSPOR LAPORAN ADMIN ====================

// --- EKSPOR LAPORAN FULL EXCEL ---
function exportAdminLaporanExcelFull() {
    var data = daftarSampah || [];
    var filterBSU = document.getElementById('filterBSU') ? document.getElementById('filterBSU').value : 'all';
    var filterRW = document.getElementById('filterRW') ? document.getElementById('filterRW').value : 'all';
    var filterRT = document.getElementById('filterRT') ? document.getElementById('filterRT').value : 'all';
    
    if (filterBSU !== 'all') {
        data = data.filter(function(item) { return item.bsuId === filterBSU || item.bsu === filterBSU; });
    }
    if (filterRW !== 'all') {
        data = data.filter(function(item) { return item.rw === filterRW; });
    }
    if (filterRT !== 'all') {
        data = data.filter(function(item) { return item.rt === filterRT; });
    }
    
    if (data.length === 0) {
        showToast('Tidak ada data untuk diekspor!', true);
        return;
    }
    
    var rekapData = generateRekapPerNasabahAdmin(data);
    var html = generateAdminExcelHTML(rekapData, data, filterBSU, filterRW, filterRT, 'Laporan Full');
    downloadExcel(html, 'Laporan_Admin_Bank_Sampah.xls');
}

// --- MINGGUAN ---
function exportLaporanMingguanExcel() {
    var data = daftarSampah || [];
    var bsu = document.getElementById('filterBSU') ? document.getElementById('filterBSU').value : 'all';
    var rw = document.getElementById('filterRW') ? document.getElementById('filterRW').value : 'all';
    var rt = document.getElementById('filterRT') ? document.getElementById('filterRT').value : 'all';
    
    var filtered = filterDataByFilters(data, bsu, rw, rt);
    if (filtered.length === 0) { showToast('Tidak ada data untuk periode ini!', true); return; }
    
    var rekapData = generateRekapPerNasabahAdmin(filtered);
    var html = generateAdminExcelHTML(rekapData, filtered, bsu, rw, rt, 'Mingguan');
    downloadExcel(html, 'Laporan_Mingguan_Admin.xls');
}

function exportLaporanMingguanPDF() {
    var data = daftarSampah || [];
    var bsu = document.getElementById('filterBSU') ? document.getElementById('filterBSU').value : 'all';
    var rw = document.getElementById('filterRW') ? document.getElementById('filterRW').value : 'all';
    var rt = document.getElementById('filterRT') ? document.getElementById('filterRT').value : 'all';
    
    var filtered = filterDataByFilters(data, bsu, rw, rt);
    if (filtered.length === 0) { showToast('Tidak ada data untuk periode ini!', true); return; }
    
    var rekapData = generateRekapPerNasabahAdmin(filtered);
    var html = generateAdminPDFHTML(rekapData, filtered, bsu, rw, rt, 'Mingguan');
    var printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) { showToast('Popup diblokir! Silakan izinkan popup.', true); return; }
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { printWindow.focus(); printWindow.print(); }, 500);
    showToast('Laporan Mingguan PDF siap dicetak', false);
}

function exportLaporanMingguanWord() {
    var data = daftarSampah || [];
    var bsu = document.getElementById('filterBSU') ? document.getElementById('filterBSU').value : 'all';
    var rw = document.getElementById('filterRW') ? document.getElementById('filterRW').value : 'all';
    var rt = document.getElementById('filterRT') ? document.getElementById('filterRT').value : 'all';
    
    var filtered = filterDataByFilters(data, bsu, rw, rt);
    if (filtered.length === 0) { showToast('Tidak ada data untuk periode ini!', true); return; }
    
    var rekapData = generateRekapPerNasabahAdmin(filtered);
    var html = generateAdminWordHTML(rekapData, filtered, bsu, rw, rt, 'Mingguan');
    downloadWord(html, 'Laporan_Mingguan_Admin.doc');
}

// --- BULANAN ---
function exportLaporanBulananExcel() {
    var data = daftarSampah || [];
    var bsu = document.getElementById('filterBSU') ? document.getElementById('filterBSU').value : 'all';
    var rw = document.getElementById('filterRW') ? document.getElementById('filterRW').value : 'all';
    var rt = document.getElementById('filterRT') ? document.getElementById('filterRT').value : 'all';
    
    var filtered = filterDataByFilters(data, bsu, rw, rt);
    if (filtered.length === 0) { showToast('Tidak ada data untuk periode ini!', true); return; }
    
    var rekapData = generateRekapPerNasabahAdmin(filtered);
    var html = generateAdminExcelHTML(rekapData, filtered, bsu, rw, rt, 'Bulanan');
    downloadExcel(html, 'Laporan_Bulanan_Admin.xls');
}

function exportLaporanBulananPDF() {
    var data = daftarSampah || [];
    var bsu = document.getElementById('filterBSU') ? document.getElementById('filterBSU').value : 'all';
    var rw = document.getElementById('filterRW') ? document.getElementById('filterRW').value : 'all';
    var rt = document.getElementById('filterRT') ? document.getElementById('filterRT').value : 'all';
    
    var filtered = filterDataByFilters(data, bsu, rw, rt);
    if (filtered.length === 0) { showToast('Tidak ada data untuk periode ini!', true); return; }
    
    var rekapData = generateRekapPerNasabahAdmin(filtered);
    var html = generateAdminPDFHTML(rekapData, filtered, bsu, rw, rt, 'Bulanan');
    var printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) { showToast('Popup diblokir! Silakan izinkan popup.', true); return; }
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { printWindow.focus(); printWindow.print(); }, 500);
    showToast('Laporan Bulanan PDF siap dicetak', false);
}

function exportLaporanBulananWord() {
    var data = daftarSampah || [];
    var bsu = document.getElementById('filterBSU') ? document.getElementById('filterBSU').value : 'all';
    var rw = document.getElementById('filterRW') ? document.getElementById('filterRW').value : 'all';
    var rt = document.getElementById('filterRT') ? document.getElementById('filterRT').value : 'all';
    
    var filtered = filterDataByFilters(data, bsu, rw, rt);
    if (filtered.length === 0) { showToast('Tidak ada data untuk periode ini!', true); return; }
    
    var rekapData = generateRekapPerNasabahAdmin(filtered);
    var html = generateAdminWordHTML(rekapData, filtered, bsu, rw, rt, 'Bulanan');
    downloadWord(html, 'Laporan_Bulanan_Admin.doc');
}

// --- TAHUNAN ---
function exportLaporanTahunanExcel() {
    var data = daftarSampah || [];
    var bsu = document.getElementById('filterBSU') ? document.getElementById('filterBSU').value : 'all';
    var rw = document.getElementById('filterRW') ? document.getElementById('filterRW').value : 'all';
    var rt = document.getElementById('filterRT') ? document.getElementById('filterRT').value : 'all';
    
    var filtered = filterDataByFilters(data, bsu, rw, rt);
    if (filtered.length === 0) { showToast('Tidak ada data untuk periode ini!', true); return; }
    
    var rekapData = generateRekapPerNasabahAdmin(filtered);
    var html = generateAdminExcelHTML(rekapData, filtered, bsu, rw, rt, 'Tahunan');
    downloadExcel(html, 'Laporan_Tahunan_Admin.xls');
}

function exportLaporanTahunanPDF() {
    var data = daftarSampah || [];
    var bsu = document.getElementById('filterBSU') ? document.getElementById('filterBSU').value : 'all';
    var rw = document.getElementById('filterRW') ? document.getElementById('filterRW').value : 'all';
    var rt = document.getElementById('filterRT') ? document.getElementById('filterRT').value : 'all';
    
    var filtered = filterDataByFilters(data, bsu, rw, rt);
    if (filtered.length === 0) { showToast('Tidak ada data untuk periode ini!', true); return; }
    
    var rekapData = generateRekapPerNasabahAdmin(filtered);
    var html = generateAdminPDFHTML(rekapData, filtered, bsu, rw, rt, 'Tahunan');
    var printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) { showToast('Popup diblokir! Silakan izinkan popup.', true); return; }
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(function() { printWindow.focus(); printWindow.print(); }, 500);
    showToast('Laporan Tahunan PDF siap dicetak', false);
}

function exportLaporanTahunanWord() {
    var data = daftarSampah || [];
    var bsu = document.getElementById('filterBSU') ? document.getElementById('filterBSU').value : 'all';
    var rw = document.getElementById('filterRW') ? document.getElementById('filterRW').value : 'all';
    var rt = document.getElementById('filterRT') ? document.getElementById('filterRT').value : 'all';
    
    var filtered = filterDataByFilters(data, bsu, rw, rt);
    if (filtered.length === 0) { showToast('Tidak ada data untuk periode ini!', true); return; }
    
    var rekapData = generateRekapPerNasabahAdmin(filtered);
    var html = generateAdminWordHTML(rekapData, filtered, bsu, rw, rt, 'Tahunan');
    downloadWord(html, 'Laporan_Tahunan_Admin.doc');
}

// ==================== REKAP NASABAH ADMIN ====================
function exportAdminNasabahRekap() {
    var data = daftarSampah || [];
    if (data.length === 0) { showToast('Tidak ada data untuk diekspor!', true); return; }
    
    var nasabahMap = {};
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var nama = item.namaNasabah || '-';
        if (nama === '-' || nama === 'undefined' || nama === 'null') continue;
        if (!nasabahMap[nama]) {
            nasabahMap[nama] = {
                nama: nama,
                totalBerat: 0,
                totalNilai: 0,
                totalTransaksi: 0,
                bsu: item.bsu || '-',
                rw: item.rw || '-',
                rt: item.rt || '-'
            };
        }
        var harga = item.hargaPerKg || getHargaByNamaSampah(item.nama);
        var nilai = item.berat * harga;
        nasabahMap[nama].totalBerat += item.berat;
        nasabahMap[nama].totalNilai += nilai;
        nasabahMap[nama].totalTransaksi++;
    }
    
    var rekapData = Object.values(nasabahMap);
    rekapData.sort(function(a, b) { return b.totalNilai - a.totalNilai; });
    
    var html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ';
    html += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
    html += 'xmlns="http://www.w3.org/TR/REC-html40">';
    html += '<head><meta charset="UTF-8">';
    html += '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>';
    html += '<x:ExcelWorksheet><x:Name>Rekap_Nasabah</x:Name><x:WorksheetOptions>';
    html += '<x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet>';
    html += '</x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
    html += '<style>';
    html += 'body { font-family: "Calibri", Arial, sans-serif; padding: 10px; }';
    html += '.main-title { background: #1a237e; color: white; padding: 10px; text-align: center; font-size: 14px; font-weight: bold; }';
    html += '.sub-title { background: #e8eaf6; padding: 6px; text-align: center; font-size: 10px; }';
    html += 'th { background: #283593; color: white; padding: 5px; border: 1px solid #ddd; font-size: 9px; }';
    html += 'td { padding: 4px 6px; border: 1px solid #ddd; text-align: center; font-size: 9px; vertical-align: middle; }';
    html += '.total-row { background: #e8f5e9; font-weight: bold; }';
    html += '.nasabah-name { text-align: left; font-weight: bold; color: #1a237e; }';
    html += '.grand-total { background: #1a237e; color: white; padding: 8px; text-align: center; margin-top: 8px; font-size: 12px; }';
    html += '.footer { text-align: center; font-size: 8px; color: #999; padding: 8px; border-top: 1px solid #ddd; margin-top: 8px; }';
    html += '</style>';
    html += '</head><body>';
    
    html += '<div class="main-title"> REKAP SEMUA NASABAH</div>';
    html += '<div class="sub-title">Bank Sampah Digital - BSI Mandiri | Periode: ' + formatTanggalIndo(new Date()) + '</div>';
    html += '<table>';
    html += '<tr><th>No</th><th>Nama Nasabah</th><th>BSU</th><th>RW/RT</th><th>Total Berat</th><th>Total Transaksi</th><th>Total Tabungan</th></tr>';
    
    var grandTotalNilai = 0, grandTotalBerat = 0, grandTotalTransaksi = 0;
    for (var i = 0; i < rekapData.length; i++) {
        var n = rekapData[i];
        html += '<tr><td>' + (i + 1) + '</td>';
        html += '<td class="nasabah-name">' + escapeHtml(n.nama) + '</td>';
        html += '<td>' + escapeHtml(n.bsu) + '</td>';
        html += '<td>' + n.rw + ' - ' + n.rt + '</td>';
        html += '<td>' + n.totalBerat.toFixed(2) + ' kg</td>';
        html += '<td>' + n.totalTransaksi + '</td>';
        html += '<td style="font-weight:bold;color:#1a237e;">' + formatRupiah(n.totalNilai) + '</td></tr>';
        grandTotalNilai += n.totalNilai;
        grandTotalBerat += n.totalBerat;
        grandTotalTransaksi += n.totalTransaksi;
    }
    
    html += '<tr class="total-row"><td colspan="6" style="text-align:right;">GRAND TOTAL</td><td>' + formatRupiah(grandTotalNilai) + '</td></tr>';
    html += '</table>';
    html += '<div class="grand-total">Total Berat: ' + grandTotalBerat.toFixed(2) + ' kg | Total Transaksi: ' + grandTotalTransaksi + '</div>';
    html += '<div class="footer">Dicetak: ' + formatTanggalIndo(new Date()) + ' | Bank Sampah Digital</div>';
    html += '</body></html>';
    
    downloadExcel(html, 'Rekap_Semua_Nasabah.xls');
}

// ==================== EXPORT KE GLOBAL ====================
window.exportAdminLaporanExcelFull = exportAdminLaporanExcelFull;
window.exportLaporanMingguanExcel = exportLaporanMingguanExcel;
window.exportLaporanMingguanPDF = exportLaporanMingguanPDF;
window.exportLaporanMingguanWord = exportLaporanMingguanWord;
window.exportLaporanBulananExcel = exportLaporanBulananExcel;
window.exportLaporanBulananPDF = exportLaporanBulananPDF;
window.exportLaporanBulananWord = exportLaporanBulananWord;
window.exportLaporanTahunanExcel = exportLaporanTahunanExcel;
window.exportLaporanTahunanPDF = exportLaporanTahunanPDF;
window.exportLaporanTahunanWord = exportLaporanTahunanWord;
window.exportAdminNasabahRekap = exportAdminNasabahRekap;
window.downloadExcel = downloadExcel;
window.downloadWord = downloadWord;
window.generateAdminExcelHTML = generateAdminExcelHTML;
window.generateAdminPDFHTML = generateAdminPDFHTML;
window.generateAdminWordHTML = generateAdminWordHTML;
window.generateRekapPerNasabahAdmin = generateRekapPerNasabahAdmin;
window.generateRekapPerSampah = generateRekapPerSampah;
window.filterDataByFilters = filterDataByFilters;

console.log('✅ Laporan Admin dengan semua fungsi download loaded!');