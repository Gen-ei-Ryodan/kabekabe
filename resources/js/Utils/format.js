export function formatRupiah(value, withSymbol = true) {
    const n = Number(value || 0);

    const formatted = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);

    return withSymbol ? `Rp${formatted}` : formatted;
}

/**
 * Format tanggal dalam Bahasa Indonesia.
 * Cukup tampilkan Hari/Tanggal, tidak perlu menampilkan jam.
 */
export function formatDate(value, withDay = false) {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        ...(withDay ? { weekday: 'short' } : {}),
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

export function formatDayDate(value) {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

export function formatMonth(value) {
    if (!value) return '-';

    const date = new Date(`${value}-01T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
}

export function formatDateEn(value) {
    return formatDate(value);
}

export function daysUntil(value) {
    if (!value) return null;

    const diff = new Date(value) - new Date();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function truncate(value, length = 120) {
    if (!value) return '';

    return value.length > length ? `${value.slice(0, length)}…` : value;
}