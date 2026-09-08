# Deployment

Deployment production dilakukan dari branch `main` ke `membership.solusisurabaya.com`.

## 1. Verifikasi lokal

```bash
git status --short --branch
git diff --check
php artisan test
npm run build
```

Pastikan hanya perubahan yang memang ingin dikirim yang ada di working tree.

## 2. Push ke main

```bash
git add <file-yang-diubah>
git commit -m "deskripsi perubahan"
git push origin main
```

## 3. Deploy ke hosting

```bash
ssh alurelab
cd /home/alurelab/repositories/kabekabe
bash deploy.sh
```

`deploy.sh` melakukan langkah berikut:

1. Pull commit terbaru dari `origin/main`.
2. Install dependency PHP production dengan Composer.
3. Menjalankan `php artisan migrate --force`.
4. Install dependency frontend dan menjalankan `npm run build`.
5. Membuat `storage:link` jika link belum tersedia.
6. Cache config, route, dan view Laravel.
7. Menyalin hasil build ke `/home/alurelab/membership.solusisurabaya.com/build`.
8. Menyalin file storage publik dan aset gambar ke document root domain.

## 4. Verifikasi setelah deploy

```bash
ssh alurelab 'cd /home/alurelab/repositories/kabekabe && git status --short --branch'
curl -I https://membership.solusisurabaya.com
```

Untuk aset publik, cek URL langsung jika diperlukan:

```bash
curl -I https://membership.solusisurabaya.com/bglogin.png
curl -I https://membership.solusisurabaya.com/bgmobile.jpeg
curl -I https://membership.solusisurabaya.com/images/logoafter.png
```

## Keamanan database

Deployment hanya menjalankan migration baru dengan `--force`. Jangan menjalankan:

- `php artisan migrate:fresh`
- `php artisan db:wipe`
- `php artisan migrate:refresh`
- perintah reset atau truncate database

Perintah tersebut dapat menghapus data production.
