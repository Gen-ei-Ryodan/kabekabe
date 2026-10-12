/**
 * Label kategori partner sesuai bahasa aktif.
 *
 * Nilai `category` disimpan di database sebagai teks (mis. "Olahraga").
 * Dipetakan ke kamus `category.<nilai>`; jika tidak ada di kamus,
 * tampilkan nilai aslinya (mis. "FNB", "Retail", "Salon" berlaku sama
 * di bahasa Indonesia maupun Inggris).
 *
 * @param {(key: string) => string} t fungsi translate dari useTranslation()
 * @param {string} category
 * @returns {string}
 */
export function categoryLabel(t, category) {
    if (!category) return category;

    // Normalisasi 'FNB' menjadi 'F&B'
    const normalizedCategory = category.replace('FNB', 'F&B');

    const key = `category.${normalizedCategory}`;
    const label = t(key);

    // t() mengembalikan key-nya sendiri bila tidak ditemukan di kamus.
    return label === key ? normalizedCategory : label;
}
