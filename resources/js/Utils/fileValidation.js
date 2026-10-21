export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MAX_FILE_SIZE_MESSAGE = 'Ukuran file maksimal 5 MB';

export function isTooLarge(file) {
    return Boolean(file) && file.size > MAX_FILE_SIZE;
}

/**
 * Guard untuk input type="file": file yang melebihi 5 MB ditolak
 * (alert + reset input) dan tidak pernah diset ke state.
 * `pick(file)` hanya dipanggil bila file valid atau kosong.
 */
export function pickFile(event, pick) {
    const file = event.target.files?.[0] ?? null;

    if (isTooLarge(file)) {
        window.alert(MAX_FILE_SIZE_MESSAGE);
        event.target.value = '';
        return;
    }

    pick(file);
}
