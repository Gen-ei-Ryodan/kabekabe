# SENTRA — Digital Membership & Community Management

Satu kartu. Satu komunitas.

Platform digital untuk manajemen membership & komunitas: kartu digital QR, benefit partner terverifikasi, verifikasi pembayaran manual, pencatatan transaksi, dan monitoring admin.

## Stack
Laravel 13 · Inertia.js · React · Tailwind CSS · GSAP · SQLite · PHPUnit

## Setup

```bash
composer install
npm install
npm run build
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

Akses di `http://localhost:8000`.

## Akun Demo (password: `password`)
- Admin: `admin@sentra.test`
- Member: `member@sentra.test` · `sari@sentra.test` (aktif), `agus@sentra.test` (inactive)
- Vendor: `kfc@sentra.test` · `gramedia@sentra.test` · `rudy@sentra.test` · `transmart@sentra.test` · `gymfit@sentra.test`

## Testing

```bash
php artisan test    # 64 tests · PHPUnit
```

## Dokumentasi

Lihat folder [`docs/`](docs/PROJECT_CONTEXT.md) untuk arsitektur, business rules, database, API reference, dan hasil audit keamanan.