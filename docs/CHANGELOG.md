# CHANGELOG.md

Semua perubahan signifikan dicatat di sini. Format: `YYYY-MM-DD — deskripsi`.

## 2026-09-02 — UI member Promo & Partner: judul tunggal, card lebih kecil, foto partner di promo card
- Halaman `member.partners.index`: menghilangkan judul berulang (eyebrow + h1 sama "Promo & Partner"), kini hanya ada 1 judul utama.
- Card Promo & Partner diperkecil (padding, font, gambar logo lebih ringkas).
- Promo card kini menampilkan foto/logo partner di sisi kanan, seragam dengan partner card.
- Urutan promo & partner tetap di-sort berdasarkan `sort_number` ASC (null di akhir).
- Fix test `VendorFlowTest`: tambahkan `MemberScan` agar 2 test pencatatan transaksi sesuai aturan 48-jam scan window (77 test PASS).

## 2026-08-22 — Home banners: slot kurasi admin (promo/agenda)
- Home member disederhanakan: kartu digital + foto member + **maksimal 3 banner kurasi admin** (list promo otomatis dihapus dari Home).
- Tabel `home_banners` (type promo|agenda, promo_id/agenda_id FK nullable, sort_order, is_active) + model `HomeBanner` + factory + seeder (3 banner demo: 2 promo + 1 agenda).
- Admin: CRUD `admin.banners.*` (index/create/store/edit/update/destroy/toggle) + halaman `Admin/Banners` + drawer `HomeBannerDrawer` + nav "Home Banners"; validasi **max 3 aktif**; target yang tidak valid di-filter.
- Member Home membaca `banners` (bukan `promos`); layout adaptif 1/2/3 kartu (2 sejajar + 1 lebar di bawah).
- **Testing:** 74 test PASS (436 assertions); build PASS.

## 2026-08-22 — Revisi klien: UI English, navigasi baru, pembayaran offline oleh admin
- **UI seluruhnya bahasa Inggris** (member, vendor, admin, auth, layouts, komponen; flash message & notifikasi PHP juga diterjemahkan).
- **Navbar member** → HOME, HISTORY, PARTNER, NOTIF, ACCOUNT. Menu Promo & Pembayaran dihapus; Komunitas tidak lagi tampil untuk member (route/controller/halaman sisi member dihapus, sisi admin dipertahankan).
- **Home** di-redesign: kartu digital + foto member, kolom kanan = maksimal **3 promo** terbaru (`limit(3)`); section "Promo Terbaru" & agenda komunitas dihapus. Mobile: 3 kartu promo bertumpuk.
- **PARTNER** = gabungan Promo + Partner dalam satu halaman (`member.partners.index` kini mengembalikan `promos` + `partners`; `member.promos.index` dihapus, detail `member.promos.show` dipertahankan).
- **HISTORY** = gabungan Payments + Usage (`member.history.index` kini mengembalikan `payments`, `transactions`, `total_benefit`, `membership`; `member.payments.index` dihapus).
- **Pembayaran offline:** member tidak lagi membuat/upload pembayaran. Admin mencatat via route baru `admin.payments.create/store` (createPending + approve sekali transaksi → membership diperpanjang + notifikasi). Halaman `Admin/Payments/Create` ditambahkan + tombol "Record Payment".
- **Files dihapus:** `Member/PaymentController`, `Member/CommunityController`, `StorePaymentRequest`, `UpdatePaymentProofRequest`, `Pages/Member/{Payments,Community}/*`, `Pages/Member/Promos/Index.jsx`.
- Notifikasi approve/reject payment `action_url` → `member.history.index`.
- **Testing:** 66 test PASS (366 assertions); build PASS. Test member-payment-submit diganti `test_admin_can_record_offline_payment_for_member`; smoke test member/admin route list disesuaikan.

## 2026-08-20 — Bugfix: SQLite compatibility + route smoke test
- `Admin\PromoController` & `Admin\PaymentController` memakai `orderByRaw("FIELD(status, ...)")` — fungsi MySQL, tidak ada di SQLite → `no such function: FIELD`. Ganti `CASE status WHEN ... THEN n` (ANSI SQL, kompatibel MySQL + SQLite).
- `Admin\PaymentController` masih memakai `$request->string('status')->default('pending')` — `Stringable::default` tidak ada di Laravel ini → 500. Ganti `->toString() ?: 'pending'`.
- Tambah `tests/Feature/AllRoutesSmokeTest.php` (3 test): memeriksa **semua** route GET per role (Member 11, Vendor 9, Admin 19) → semuanya 200.
- Total: 67 test PASS (366 assertions).

## 2026-08-20 — Bugfix: halaman login kosong (CSP nonce mismatch)
- Root cause ganda:
  1. `Vite::useCspNonce()` di Laravel ini **selalu generate nonce baru** (tidak cache) → header CSP, `@routes`, dan `@vite` pakai nonce berbeda → semua script diblokir.
  2. Directive `@routes` memanggil `generate(Vite::cspNonce())` — tapi `generate($group, $nonce, $json)`: nonce malah ter-parse sebagai **group**, sehingga `$nonce` null → script tag Ziggy tanpa nonce → `route is not defined`.
- Fix:
  - `SecurityHeaders`: set 1 nonce sekali via `Vite::useCspNonce($nonce)` (Str::random 40).
  - Directive `@routes`: baca readonly `Vite::cspNonce()` DAN panggil `generate(null, Vite::cspNonce())` saat group kosong.
  - Tambah `https://fonts.bunny.net` ke `style-src` & `font-src` (sebelumnya font diblokir).
- Terverifikasi: semua `<script>` + header CSP memakai nonce yang sama; fonts allowed. 64 test PASS.

## 2026-08-20 — Bugfix: ParseError `@routes` + 419 CSRF pada test
- Fix ParseError `app.blade.php:15` → `@routes` tanpa argumen menghasilkan `generate(, Vite::useCspNonce())`. Directive kini menangani `$group` kosong (`generate(Vite::useCspNonce())`).
- Fix 419 CSRF pada semua POST saat `php artisan test`: `bootstrap/cache/config.php` meng-hardcode `app.env=local` sehingga `APP_ENV=testing` dari phpunit.xml diabaikan → `runningUnitTests()` false → CSRF aktif. Solusi: `php artisan config:clear` (jangan `config:cache` saat develop/test).
- Verifikasi: 64 test PASS (327 assertions), build PASS, `/login` 200, `/` 302.

## 2026-08-20 — Complete Feature Build
### Backend
- Scaffold Laravel 13 + Breeze (React/Inertia, JSX); fix peer-dep npm (pin `@vitejs/plugin-react ^6`, `vite ^8`).
- Migrasi lengkap (users, memberships, membership_plans, payments, partners, promos, transactions, app_notifications, community_infos) + factories + seeder (25 member, 5 partner, 4 plan, demo account).
- Model Laravel 13 style (`#[Fillable]`, `#[Hidden]`, `#[Appends('logo_url'|'image_url')]`).
- 6 Service, 17 FormRequest, 6 Policy, controller per role (Member 8, Vendor 5, Admin 9).
- Middleware `EnsureRole` (alias `role:`), `SecurityHeaders` (CSP nonce + hardening).
- Fix: `MembershipService` relation cache (setRelation) pada ensure/extend/deactivate.
- Fix: `@routes` Ziggy mendapat CSP nonce via override Blade directive di AppServiceProvider (tanpa ini route() JS diblokir CSP).
- Fix: Report controllers — `Stringable::default()` tidak ada di Laravel 13, ganti null-coalescing.
- Harden: `member.payments.proof` hanya untuk payment pending; payment tidak bisa double approve/reject.

### Frontend
- Design system SENTRA: tokens (ink/paper/gold/ember/sage/slate), font (Space Grotesk/Inter/JetBrains Mono), utility classes.
- Komponen: AppLogo, MemberCard (GSAP 3D tilt + QR), StatusChip, StatCard, Reveal (ScrollTrigger), Pagination, EmptyState, QrCode, FlashMessages.
- Layout: Member/Vendor/Admin/Guest.
- Halaman: Member (11), Vendor (9), Admin (18) — lengkap; Auth restyle.
- `app.jsx`: register GSAP+ScrollTrigger, appName dari shared props, progress gold.

### Testing
- 64 test PHPUnit: RoleAccess (9), MemberFlow (9), VendorFlow (10), AdminFlow (14), Breeze Auth suite (22).
- `php artisan test` → 64 passed, 327 assertions.

### Security
- Audit OWASP Top 10 (lihat SECURITY.md): 0 vulnerabilitas composer/npm, CSP nonce terverifikasi.

## Catatan
- Belum inisialisasi git (bukan repo). Commit/push menyusul setelah repo dibuat.
- Scheduler `expireOverduePayments` belum terjadwal di routes/console.