const BACK_SOURCE_KEY = 'kbkb:back-source';

/**
 * Catat asal navigasi (mis. 'promo' atau 'agenda') sebelum membuka halaman detail,
 * agar tombol Kembali bisa menggunakan history.back() dan kembali ke halaman asal.
 */
export function rememberBackSource(source) {
    try {
        sessionStorage.setItem(BACK_SOURCE_KEY, source);
    } catch {
        /* sessionStorage tidak tersedia — abaikan */
    }
}

/**
 * Handler onClick untuk tombol kembali:
 * jika halaman dibuka dari halaman dalam aplikasi dengan sumber yang sama,
 * gunakan history.back(); selain itu biarkan link default (fallback href).
 */
export function handleBackNavigation(event, source) {
    let stored = null;

    try {
        stored = sessionStorage.getItem(BACK_SOURCE_KEY);
        if (stored === source) {
            sessionStorage.removeItem(BACK_SOURCE_KEY);
        }
    } catch {
        /* sessionStorage tidak tersedia — pakai fallback */
    }

    if (stored === source) {
        event.preventDefault();
        window.history.back();
    }
}
