// utils.js
// =============================================
// FUNGSI UTILITY
// =============================================

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

function formatTanggalIndo(dateStr) {
    if (!dateStr) return '-';
    var date = new Date(dateStr);
    if (isNaN(date)) return '-';
    var days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    var months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return days[date.getDay()] + ', ' + date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
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

function showToast(message, isError) {
    var toast = document.getElementById('toast');
    if (!toast) {
        var div = document.createElement('div');
        div.id = 'toast';
        div.className = 'toast';
        document.body.appendChild(div);
        toast = div;
    }
    
    toast.textContent = message;
    toast.className = 'toast';
    if (isError) toast.classList.add('error');
    else toast.classList.add('success');
    toast.classList.add('show');
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(function() {
        toast.classList.remove('show');
    }, 3500);
}

function downloadExcel(html, filename) {
    try {
        var blob = new Blob(['\uFEFF' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
        var link = document.createElement('a');
        var url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename || 'laporan.xls';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(function() { URL.revokeObjectURL(url); }, 1000);
        return true;
    } catch(e) {
        console.error('Download error:', e);
        return false;
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
        return true;
    } catch(e) {
        console.error('Download error:', e);
        return false;
    }
}

// Re-export functions from laporan.js
function generateRekapPerNasabahAdmin(data) {
    if (typeof window.generateRekapPerNasabahAdmin === 'function') {
        return window.generateRekapPerNasabahAdmin(data);
    }
    // Fallback simple rekap
    var map = {};
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var key = item.nasabah_id || item.nasabah || 'Unknown';
        if (!map[key]) {
            map[key] = {
                namaNasabah: key,
                totalBerat: 0,
                totalNilai: 0,
                totalTransaksi: 0,
                detail: []
            };
        }
        map[key].totalBerat += item.berat;
        map[key].totalNilai += item.berat * item.harga_per_kg;
        map[key].totalTransaksi++;
        map[key].detail.push(item);
    }
    return Object.values(map);
}

function generateAdminExcelHTML(rekapData, allData, filterBSU, filterRW, filterRT, periode) {
    if (typeof window.generateAdminExcelHTML === 'function') {
        return window.generateAdminExcelHTML(rekapData, allData, filterBSU, filterRW, filterRT, periode);
    }
    // Fallback simple HTML
    var html = '<html><head><meta charset="UTF-8"></head><body>';
    html += '<h1>Laporan Bank Sampah</h1>';
    html += '<p>Periode: ' + (periode || 'Laporan') + '</p>';
    html += '<p>Total Data: ' + allData.length + '</p>';
    html += '<table border="1"><tr><th>No</th><th>Nasabah</th><th>Berat</th><th>Nilai</th></tr>';
    for (var i = 0; i < allData.length; i++) {
        var item = allData[i];
        html += '<tr><td>' + (i + 1) + '</td><td>' + (item.namaNasabah || '-') + '</td><td>' + item.berat + '</td><td>' + (item.berat * item.harga_per_kg) + '</td></tr>';
    }
    html += '</table></body></html>';
    return html;
}

function generateAdminPDFHTML(rekapData, allData, filterBSU, filterRW, filterRT, periode) {
    // Reuse Excel HTML for PDF
    return generateAdminExcelHTML(rekapData, allData, filterBSU, filterRW, filterRT, periode);
}

function generateAdminWordHTML(rekapData, allData, filterBSU, filterRW, filterRT, periode) {
    return generateAdminExcelHTML(rekapData, allData, filterBSU, filterRW, filterRT, periode);
}

// Export ke global
window.formatRupiah = formatRupiah;
window.formatTanggalIndo = formatTanggalIndo;
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.downloadExcel = downloadExcel;
window.downloadWord = downloadWord;
window.generateRekapPerNasabahAdmin = generateRekapPerNasabahAdmin;
window.generateAdminExcelHTML = generateAdminExcelHTML;
window.generateAdminPDFHTML = generateAdminPDFHTML;
window.generateAdminWordHTML = generateAdminWordHTML;

console.log('✅ Utils loaded');