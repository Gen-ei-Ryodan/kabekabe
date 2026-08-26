export function formatRupiah(value, withSymbol = true) {
    const n = Number(value || 0);

    const formatted = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(n);

    return withSymbol ? `Rp${formatted}` : formatted;
}

export function formatDate(value, withTime = false) {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    }).format(date);
}

export function formatMonth(value) {
    if (!value) return '-';

    const date = new Date(`${value}-01T00:00:00`);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
}

export function formatDateEn(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).format(date);
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