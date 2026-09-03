# SENTRA — Digital Membership & Community Management

## Ringkasan Proyek
Platform digital untuk manajemen membership dan komunitas. Member memiliki **kartu digital (QR)** untuk mengakses benefit dari partner/vendor terverifikasi. Admin memverifikasi pembayaran, promo, dan memonitor transaksi. Vendor mencatat transaksi benefit member.

**Brand:** SENTRA — "Satu kartu. Satu komunitas."

## Stack
- **Backend:** Laravel 13.17 (PHP 8.5), SQLite (dev)
- **Frontend:** Inertia.js + React (JSX), Tailwind CSS, Vite 8
- **Animasi:** GSAP 3 (ScrollTrigger, tilt 3D kartu)
- **QR:** `qrcode` (generate) + `@yudiel/react-qr-scanner` (scan vendor)
- **Auth:** Laravel Breeze (React) + role-based redirect via `User::homeRoute()`

## Role & Akses
| Role | Prefix URL | Dashboard | Kemampuan inti |
|------|-----------|-----------|----------------|
| `member` | `/member` | Home (kartu digital) | Lihat kartu + foto member, promo/partner (menu PARTNER), riwayat pembayaran & penggunaan (menu HISTORY), notifikasi, akun |
| `vendor` | `/vendor` | Statistik partner | Verify kartu (QR), ajukan promo, catat transaksi, laporan |
| `admin` | `/admin` | Statistik platform | CRUD member/partner, review promo, **catat pembayaran member (offline)**, konten komunitas, broadcast notifikasi, laporan |

## Catatan Revisi (2026-08-22)
- **UI seluruhnya bahasa Inggris.**
- Navbar member: **HOME, HISTORY, PARTNER, NOTIF, ACCOUNT** (menu Promo & Pembayaran dihapus, Komunitas tidak lagi tampil untuk member).
- Home: kartu digital + foto member + **maksimal 3 promo banner kurasi admin** serta agenda aktif dari Events & Activities — layout adaptif 1/2/3 kartu.
- Home juga dapat menampilkan satu popup promo terkonfigurasi admin setelah jeda 3 detik setiap halaman Home dibuka.
- PARTNER = tab Promo + Partner dalam satu halaman, dengan filter kategori yang berlaku untuk keduanya.
- HISTORY = tab Payments + Usage dalam satu halaman.
- **Pembayaran offline:** member tidak membayar di sistem; admin mencatat via `admin.payments.store` (langsung approved → membership diperpanjang).
- **Demografi member:** admin dapat mengisi jenis kelamin, tanggal lahir, dan agama saat membuat atau mengedit member; data ini dipakai pada Member Statistics.
- **Admin Home Banners:** Featured banners hanya untuk promo; field Banner type di form Create/Edit dihapus. Agenda tetap tampil otomatis dari Events & Activities.
- **Admin Events & Activities:** label UI menggunakan bahasa Inggris; Content type tidak ditampilkan pada form Create/Edit, detail event memuat attendance serta contribution payments, dan kehadiran member dicatat dengan scan QR kartu.

## Akun Demo (password: `password`)
- Admin: `admin@sentra.test`
- Member aktif: `member@sentra.test`, `sari@sentra.test`
- Member inactive: `agus@sentra.test`
- Vendor: `kfc@sentra.test`, `gramedia@sentra.test`, `rudy@sentra.test`, `transmart@sentra.test`, `gymfit@sentra.test`

## Plan Membership
| Durasi | Harga |
|--------|-------|
| 1 Bulan | Rp150.000 |
| 3 Bulan | Rp400.000 |
| 6 Bulan | Rp750.000 |
| 12 Bulan | Rp1.350.000 |

## Menjalankan
```bash
composer install && npm install
npm run build
cp .env.example .env && php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

## Testing
```bash
php artisan test   # 64 tests — PHPUnit (bukan Pest)
```

## Dokumen Terkait
- [ARCHITECTURE.md](ARCHITECTURE.md) — struktur & pola kode
- [BUSINESS_RULES.md](BUSINESS_RULES.md) — aturan bisnis (PENTING)
- [DATABASE.md](DATABASE.md) — skema database
- [API_REFERENCE.md](API_REFERENCE.md) — daftar route
- [SECURITY.md](SECURITY.md) — hasil audit OWASP
- [CHANGELOG.md](CHANGELOG.md) — riwayat perubahan
