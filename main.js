// main.js
// =====================================================
// FUNGSI DASAR & UTILITY
// =====================================================

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

function formatTanggalShort(dateStr) {
    if (!dateStr) return '-';
    var date = new Date(dateStr);
    if (isNaN(date)) return '-';
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
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

function showLoading(show) {
    var loading = document.getElementById('loadingIndicator');
    if (!loading) {
        var div = document.createElement('div');
        div.id = 'loadingIndicator';
        div.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:none;justify-content:center;align-items:center;z-index:9999;';
        div.innerHTML = '<div style="background:white;padding:20px 30px;border-radius:12px;text-align:center;"><i class="fa-solid fa-spinner fa-spin" style="font-size:28px;color:#0d9488;"></i><p style="margin-top:10px;font-size:13px;color:#1e293b;">Memproses...</p></div>';
        document.body.appendChild(div);
        loading = div;
    }
    loading.style.display = show ? 'flex' : 'none';
}

function getToday() {
    var today = new Date();
    return today.toISOString().split('T')[0];
}

function getWeekStart() {
    var today = new Date();
    var day = today.getDay();
    var diff = today.getDate() - day + (day === 0 ? -6 : 1);
    var weekStart = new Date(today);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
}

function getMonthStart() {
    var today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
}

function getYearStart() {
    var today = new Date();
    return new Date(today.getFullYear(), 0, 1);
}

// Export ke global
window.formatRupiah = formatRupiah;
window.formatTanggalIndo = formatTanggalIndo;
window.formatTanggalShort = formatTanggalShort;
window.escapeHtml = escapeHtml;
window.showToast = showToast;
window.showLoading = showLoading;
window.getToday = getToday;
window.getWeekStart = getWeekStart;
window.getMonthStart = getMonthStart;
window.getYearStart = getYearStart;

console.log('✅ Main Module loaded');