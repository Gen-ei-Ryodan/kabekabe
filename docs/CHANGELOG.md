# CHANGELOG.md

Semua perubahan signifikan dicatat di sini. Format: `YYYY-MM-DD — deskripsi`.

## 2026-09-03 — Member Billing Management
- Halaman baru **Billing** di menu Account member (`member.billing.index`).
- Menampilkan status membership (active/inactive), current plan, masa berlaku, dan sisa hari.
- Menampilkan daftar semua plan yang tersedia (harga + durasi).
- Navbar member ditambahkan menu **Billing** (sebelum Profile).
- Menambahkan `BillingController` dan `Billing.jsx`.
- **Pembayaran tetap offline:** member tidak bisa payment langsung; petunjuk menghubungi admin untuk renew/extend.

## 2026-09-03 — Admin Events & Activities
- Label menu dan halaman Agenda Kegiatan diterjemahkan menjadi **Events & Activities**.
- Field **Content type** dihapus dari form Create/Edit; event baru menggunakan tipe agenda secara internal.
- Detail event diperbaiki dengan relasi `CommunityInfo::payments()` agar tidak lagi memunculkan `RelationNotFoundException`.

## 2026-09-03 — Demografi Member di form Admin
- Form Create dan Edit Member kini mendukung jenis kelamin, tanggal lahir, dan agama.
- Nilai divalidasi sesuai pilihan demografi yang digunakan oleh laporan Member Statistics.

## 2026-09-03 — Filter index Admin Member dan Partner
- Admin Members menambahkan filter search, nama, Member ID, status, rentang tanggal valid, dan rentang tanggal join.
- Admin Partners menambahkan filter search, kategori, dan status.
- Query filter dipertahankan saat pagination dan drawer dibuka.

## 2026-09-03 — Pemisahan section promo dan agenda di Home member
- Banner Home member kini ditampilkan dalam section **Promos** dan **Agenda** yang terpisah.
- Popup promo tetap dirender sebagai modal terpisah dan tidak dihitung sebagai banner.
- Home member menampilkan maksimal 3 promo dan 1 agenda secara terpisah.
- Card agenda portrait menempatkan tanggal dan informasi di kiri, dengan foto di kanan.

## 2026-09-03 — Popup promo pembuka Home member
- Tambah konfigurasi singleton `home_popups` untuk satu promo popup dengan gambar opsional dan status aktif.
- Admin Home Banners memiliki menu **Opening popup** untuk memilih promo, mengunggah gambar, dan mengaktifkan popup.
- Home member menampilkan modal promo terpusat setelah 3 detik setiap halaman Home dibuka; popup hanya dikirim jika promo masih visible.

## 2026-09-03 — Redesain kartu member digital
- `MemberCard` kini menggunakan `bglogin.png` sebagai latar belakang kartu.
- Foto member di kanan atas berbentuk kotak besar, tetap dapat diklik untuk membuka tampilan besar (lightbox).
- QR Code di kiri bawah dengan label "Scan here".
- Status membership (`Active` / `Inactive`) ditampilkan dengan chip kontras tinggi (sage/ember solid dengan teks putih).
- Layout informasi: nama di atas status, nomor member di kiri status, joined di kiri valid until.
- Jika membership non-active, kartu diberi overlay gelap + ikon X besar di tengah sebagai penanda tidak dapat digunakan.
- Build PASS.

## 2026-09-03 — Admin dashboard: Total Promo stat menampilkan jumlah aktif
- `ReportingService::adminDashboard()` menambahkan `active_promos` (promo approved & `is_active = true`).
- Halaman `Admin/Dashboard.jsx`: stat card "Total Promo" kini menampilkan sub-label `${active_promos} Active` (sebelumnya `${pending_promos} pending review`).

## 2026-09-03 — Agenda Kegiatan (refactor Community menu)
- Menu admin **Community** diubah menjadi **Agenda Kegiatan**.
- Tipe `community_infos` dibatasi hanya **event** dan **agenda**; tipe `announcement` dan `news` dihapus dari UI dan konstanta model.
- Tambah kolom `fee` di `community_infos` untuk nominal urunan kegiatan.
- Tambah tabel `event_non_members` untuk mencatat peserta non-member.
- Halaman admin agenda mendukung:
  - CRUD agenda/kegiatan dengan `fee`.
  - Detail agenda (`admin.community.show`) dengan tab Attendance, Member Billing, Non-Member Participants.
  - Pencatatan kehadiran member via **scan QR / member code** dan **dropdown manual**.
  - Pencatatan kehadiran non-member via form manual.
  - Pembuatan tagihan "Urunan Kegiatan" untuk member participant (Payment dengan `event_id`).
- Update `DatabaseSeeder` agar hanya membuat data event/agenda.
- Testing: `php artisan test` → 79 test PASS (505 assertions); build PASS.

## 2026-09-02 — UI member Promo & Partner: judul tunggal, card lebih kecil, foto partner di promo card
- Halaman `member.partners.index`: menghilangkan judul berulang (eyebrow + h1 sama "Promo & Partner"), kini hanya ada 1 judul utama.
- Card Promo & Partner diperkecil (padding, font, gambar logo lebih ringkas).
- Promo card kini menampilkan foto/logo partner di sisi kanan, seragam dengan partner card.
- Urutan promo & partner tetap di-sort berdasarkan `sort_number` ASC (null di akhir).
- Fix test `VendorFlowTest`: tambahkan `MemberScan` agar 2 test pencatatan transaksi sesuai aturan 48-jam scan window.

## 2026-09-02 — Admin Partners index: list/table layout + filters + Reports refinement
- Tampilan **Admin Partners index** diubah dari **card grid** menjadi **list/table** seperti halaman Members. Kolom: Partner (logo + nama + deskripsi), Category, Vendor, Status, Actions.
- Filter di semua halaman index admin sudah lengkap:
  - **Members**: search + status.
  - **Partners**: search + status.
  - **Promos**: search + status.
  - **Payments**: search + status.
  - **Banners**: type + status.
  - **Community**: search + type + status.
  - **Transactions**: from/to + partner + member + search.
  - **Reports**: filter per tab.
- Admin Reports page (`admin.reports.index`) tetap 3 menu/tab: **Transaction Report**, **Member Statistics**, **Birthday Report**.
- Testing: `php artisan test` → 79 test PASS (505 assertions); build PASS.

## 2026-09-02 — Fix: Admin Reports (3 menus, monthly view, correct Birthday report)
- Admin Reports page (`admin.reports.index`) dibuat menjadi 3 menu/tab: **Transaction Report**, **Member Statistics**, **Birthday Report**.
- **Transaction Report**: Per Vendor dan Per Member kini ditampilkan per bulan (dari terendah ke tertinggi berdasarkan rentang tanggal filter), masing-masing di-sort dari transaksi/discount tertinggi ke terendah.
- **Member Statistics**: direstruktur menjadi **1 tabel** dengan bulan sebagai kolom header dan baris: Member Terdaftar, Aktif→Non Aktif, Non Aktif→Aktif, Agama (Katolik/Kristen/Buddha/Hindu/Islam/Lainnya), Pria, Wanita, Umur (<21, 21–30, 30–40, 40–50, >50), Jumlah Kehadiran Acara.
- **Birthday Report (Laporan HUT)**: diperbaiki agar benar-benar menampilkan daftar ulang tahun member, di-sort berdasarkan bulan dan tanggal (bukan kehadiran acara seperti sebelumnya).
- `User` model `#[Fillable]` ditambahkan `gender`, `religion`, `birth_date`, `city` untuk mendukung demografi member.
- `Admin/ReportController.php` direfactor: `by_partner`, `by_member`, `member_stats`, dan `birthdays` mengikuti struktur data baru; `summary` dan `transactions` tetap dipertahankan untuk backward compatibility test.
- Testing: `php artisan test` → 79 test PASS (505 assertions); build PASS.

## 2026-09-02 — Bugfix: jendela 48 jam scan vendor
- Halaman `vendor.transactions.create` kini membuat catatan `MemberScan` saat member pertama kali di-resolve (scan QR atau input Member ID), sehingga transaksi bisa disimpan dalam jendela 48 jam setelah scan.
- Pesan "Masa Input berakhir" hanya muncul setelah benar-benar melewati 48 jam; pesan error/UX diubah ke bahasa Inggris sesuai ketentuan UI.
- `MemberScan::SCAN_WINDOW_HOURS` dan `MemberScan::startFor()` digunakan bersama oleh `VerifyController` dan `TransactionController` untuk menghindari duplikasi logika scan window.
- Update `BUSINESS_RULES.md` tentang aturan 48 jam scan vendor.
- Testing: 16 test `VendorFlowTest` PASS.

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
