# REVISI KABE KABE — Checklist Implementasi

Repository: `/root/workspace/projects/kabekabe` (branch `main`)
Stack: Laravel + Inertia.js + React (Breeze)
Role: `admin`, `vendor`, `member`
Sumber requirement: `REVISI KABE KABE.docx` (di-copy ke `REVISI_KABE_KABE.docx`)

Konvensi: `[x]` selesai, `[~]` sebagian, `[ ]` belum, `[?]` butuh klarifikasi

---

## A. HALAMAN AWAL LOGIN
File: `resources/js/Pages/Auth/Login.jsx`
Target: kartu member berwarna hitam, layout ala kartu

- [ ] Ubah latar/card login menjadi kartu member berwarna hitam (dark theme)
- [ ] Field "Email" dengan label sesuai
- [ ] Field "Password" dengan label sesuai
- [ ] Tambahkan section "Member Application" di bawah form:
  - [ ] Teks: "New Member? Click here for registration" → link ke `register`

## B. DASHBOARD MEMBER
File: `resources/js/Pages/Member/Home.jsx`, `MemberCard.jsx`, `Member/HomeController.php`

- [x] Kartu member dark theme (ink gradient, gold border, glow, texture) — `MemberCard.jsx`
- [x] Foto dimasukkan ke dalam kartu, letaknya di kanan atas (top row) — `MemberCard.jsx`
- [x] Foto dapat diklik untuk lightbox (Modal 3:4) — `MemberCard.jsx`
- [x] Keterangan Active / Non Active dengan warna kontras (sage/ember) — `MemberCard.jsx`
- [x] QR Code di kiri bawah (footer right, gold tone) — `MemberCard.jsx`
- [x] Jika Non Active, kartu tidak dapat digunakan (overlay z-10, blur) — `MemberCard.jsx`
- [x] Chart vendor ranking di bawah kartu (top 5 ALL member by transaction count) — `VendorRanking` + `HomeController`
- [x] 1 pop-up promo saat akses Home (sekali per session via localStorage) — `PromoPopup` + `useEffect`
- [x] Section promo: card diperkecil, minimal 3 card per baris (grid-cols-3) — `BannerZone`
- [x] Section Agenda (card dengan tanggal kiri, deskripsi, foto kanan) — `AgendaBanner` (sudah ada)
- [ ] Verify visual di browser (pending)

## C. HISTORY
File: `resources/js/Pages/Member/History/Index.jsx`, `Member/HistoryController.php`

- [x] Tab Payment: tampilkan payment untuk tagihan kegiatan (`payment.event` relation)
- [x] Tab baru: Attendance — history kehadiran event
  - [x] Event dari `community_infos` (admin-created)
  - [x] QR scan → tabel `event_attendances`
  - [x] Tabel: `event_attendances` (`event_id`, `member_id`, `scanned_at`, `scan_token`, `scanned_by_vendor_id`)
  - [x] Model `EventAttendance` dengan relasi event, member, scannedBy
  - [x] Migration `2026_09_02_040000_create_event_attendances_table`
  - [x] Migration `2026_09_02_040001_add_event_id_to_payments_table`
  - [x] Runtime-verified: total_payment_made, event relation, attendances query
- [x] "Total Payment Made" di tab Payments header
- [ ] Scan QR flow dari vendor (Poin H) — pending

## D. PROMO & PARTNER
File: `Admin/Promos/Index.jsx`, `Admin/Partners/Index.jsx`, `Member/Partners/Index.jsx`, controllers

- [x] Judul jadi "Promo & Partner" (Admin Promos, Admin Partners, Member Partners)
- [x] Hilangkan judul berulang (1 judul saja, tanpa deskripsi)
- [x] Sort promo berdasarkan nomor — `COALESCE(sort_number, 999999) ASC` di controller
- [x] Sort partner berdasarkan nomor — `COALESCE(sort_number, 999999) ASC` di controller
- [x] Card diperkecil (gap, padding, font size)
- [x] Foto di sebelah kanan card (Member PartnerCard)
- [x] Badge nomor di card (Promo, Partner) jika sort_number ada
- [x] Runtime-verified: partners sort (Alpha, Beta, Zeta) + promos sort (status then sort_number)
- [x] Migration: `2026_09_02_040002_add_sort_number_to_promos_and_partners`
- [x] `UpdatePromoRequest` & `UpdatePartnerRequest` accept sort_number

## E. PROFILE
File: `resources/js/Pages/Member/Account/Edit.jsx`, `Member/AccountController.php`

- [x] Hapus section "Notification Settings" dari Profile
- [x] Hapus 3 field `notify_*` dari `useForm`
- [x] Hapus `settings` prop dari Inertia render di controller
- [x] Hapus `notification_settings` dari update payload
- [x] Hapus `notify_*` rules dari `UpdateAccountRequest`

## F. DASHBOARD ADMIN
File: `resources/js/Pages/Admin/Dashboard.jsx`, `Admin/DashboardController.php`, `ReportingService`

- [x] Total Member
- [x] Active, Inactive
- [x] Expired Next Month, Expired in Next 2 Months
- [x] Partner, Total Promo
- [x] Total Vendors
- [x] Pending Reviews (promos & payments)
- [x] Tomorrow Active, Tomorrow Non Active
- [x] Total Transaction, Net Sales, Net Promos (3 angka)
- [x] Perbandingan: This Month, Last Month, 2 Months Ago
- [x] Recent Transactions
- [x] Runtime-verified: stats + 3 monthly periods

## F.2 Filter (per index) - pending
- [ ] Filter di semua index (Members, Partners, Promos, Payments, Banners, Community, Transactions)

## F.3 Partner & Member list index
- [x] Selesai (existing: Admin/Members/Index, Admin/Partners/Index)

## F.4 Pengaturan Agenda / Kegiatan - partial
- [ ] Admin CRUD kegiatan (existing Community, may need event type filter)
- [x] Tagihan "Urunan Kegiatan" via Payment.event_id (Poin C)
- [ ] Peserta: Member, Non Member flow

## G. REPORTS
File: `resources/js/Pages/Admin/Reports/Index.jsx`, `Admin/ReportController.php`

- [x] Dibuat 3 menu/tab: Transaction Report, Member Statistics, Birthday Report
- [x] Sort DESC + tampil per bulan untuk Transaction Report
- [x] Laporan Transaksi per Vendor (Transaksi, Net Discount) — per bulan, sort tertinggi→terendah
- [x] Laporan Transaksi per Member — per bulan, sort tertinggi→terendah
- [x] Laporan Statistik Member (1 tabel, bulan di bagian atas):
  - [x] Member Terdaftar
  - [x] Aktif → Non Aktif, Non Aktif → Aktif
  - [x] Agama: Katolik, Kristen, Buddha, Hindu, Islam, Lainnya
  - [x] Pria, Wanita
  - [x] Umur: <21, 21–30, 30–40, 40–50, >50
  - [x] Attendance event
- [x] Laporan HUT: ulang tahun member, sort berdasarkan bulan dan tanggal
- [x] Migration: `2026_09_02_040003_add_member_demographics_to_users_table`
- [x] Migration: `2026_09_02_040004_create_member_scans_table` (juga utk Poin H)

## H. DASHBOARD VENDOR
File: `Vendor/VerifyController.php`, `TransactionService.php`, `MemberScan`

- [x] QR member di-scan (VerifyController)
- [x] Transaksi tidak harus langsung diinput
- [x] Transaksi diinput max 48 jam dari waktu scan
- [x] Tabel `member_scans` (member_id, scanned_by_vendor_id, scanned_at, expires_at)
- [x] Runtime-verified:
  - No scan → "Masa Input berakhir, Hubungi Admin untuk edit."
  - Fresh scan → transaction recorded
  - Expired scan (49h) → "Masa Input berakhir, Hubungi Admin untuk edit."

## I. PENOMORAN MEMBER
File: `app/Models/User.php` (`nextMemberCode`)

- [x] Format: `7030260001` (7030 fix + 26 tahun + 4 digit urut)
- [x] Reset tiap tahun (Januari mulai dari 0001 lagi)
- [x] Runtime-verified:
  - 2026: 7030260001, 7030260002, 7030260003
  - 2027 (Carbon::setTestNow): 7030270001, 7030270002

## J. INTEGRASI & OTOMATISASI
File: `app/Services/PaymentGateway/FaspayService.php`, `app/Services/Whatsapp/WaBlastService.php`, `Admin/IntegrationController.php`, `resources/js/Pages/Admin/Integrations/`

- [x] Payment Gateway Faspay: dummy UI
  - [x] `FaspayService::createInvoice(channel)` — returns trx_id, status, payment_url
  - [x] `FaspayService::checkStatus(trxId)`
  - [x] `FaspayService::handleCallback(payload)`
  - [x] Route: `admin.payments.faspay.dummy` (dummy payment page)
  - [x] Route: `admin.integrations.faspay.test` (test invoice)
- [x] WA Blast: stub UI
  - [x] `WaBlastService::send(recipient, message, context)` — stub logs
  - [x] `WaBlastService::broadcast(recipients, message)` — multi-recipient
  - [x] Audience filter: all_members, active_members, expired_members, all_admins
  - [x] Route: `admin.integrations.wa-blast.send`
- [x] Halaman Integrasi di sidebar admin (route `admin.integrations.index`)
- [x] Runtime-verified:
  - Faspay invoice generated (trx_id, channel=qris, status=pending, payment_url)
  - WA Blast send (queued), no-phone (failed)
- [ ] Integrasi penuh Faspay & WA Blast (deferred)

---

## Cara Pakai

1. Kerjakan poin per poin, jangan lompat
2. Tandai `[x]` di checklist saat selesai
3. Setelah selesai, commit + push ke branch `feat/revisi-XXX` atau langsung ke `main` sesuai workflow
4. **Self-check**: scan seluruh file terkait setelah setiap poin selesai
5. Lanjut ke poin berikutnya hanya setelah poin sebelumnya [`x`]

## Klarifikasi Sudah Dijawab

- [x] **A**: Card saja — dark card di atas background (bukan full dark theme)
- [x] **B.Chart vendor**: Vendor paling banyak digunakan ALL member (ranking by transaction count)
- [x] **B.Popup promo**: Setiap ke Home saja (sekali per session)
- [x] **C.Attendance**: Baru saja — minimal implementation dulu
- [x] **F.Urunan Kegiatan**: Tagihan payment saja (bukan invoice)
- [x] **H.48 jam**: Benar tidak boleh input. Pesan: "Masa Input berakhir, Hubungi Admin untuk edit"
- [x] **I.Nomor urut**: Reset tiap tahun (Januari mulai dari 0001 lagi)
- [x] **J.Payment Gateway**: Faspay — tampilan dummy dulu (integrasi nanti)
- [x] **J.WA Blast**: Belum terfikir — tombol tombol dulu saja (stub)
