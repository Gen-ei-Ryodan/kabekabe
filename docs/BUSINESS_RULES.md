# BUSINESS_RULES.md

## Status Membership
- Membership bersifat **1:1** per member (`member_id` unique).
- **ACTIVE** = `status='active'` **DAN** `expires_at` di masa depan.
- Member tanpa baris membership atau `expires_at` lewat = **INACTIVE**.
- Perpanjangan menambah bulan dari `expires_at` saat ini bila masih aktif, jika tidak dari `now()`.
- `ensureMembership()` membuat baris inactive bila belum ada; selalu `setRelation('membership', ...)` untuk hindari stale relation.

## Demografi Member
- Jenis kelamin member menggunakan nilai `male` atau `female`.
- Agama member menggunakan nilai `islam`, `kristen`, `katolik`, `buddha`, `hindu`, atau `lainnya`.
- Tanggal lahir bersifat opsional dan tidak boleh berada di masa depan.

## Kartu Digital & QR
- `card_token` (UUID) dibangkitkan otomatis saat user member dibuat, dan dijamin via `ensureCardToken()`.
- `member_code` format `7030YYNNNN` (contoh `7030260001` untuk member pertama tahun 2026), auto-increment per tahun.
- QR kartu berisi `card_token`; scan kehadiran admin hanya menerima token QR kartu, bukan `member_code` yang sudah tercatat.

## Promo
- Alur: vendor `submit` → status `pending` → admin `approve`/`reject` (wajib alasan) → `approved`.
- Promo **visible** untuk member hanya jika: `approved` + `is_active` + `start_date <= now <= end_date`.
- Vendor hanya boleh edit ulang promo **rejected** miliknya (policy).
- Vendor hanya melihat/menghapus promo milik partner-nya.
- `discount_value` maks 100.000.000; `end_date >= start_date`.

## Transaksi Benefit
- Hanya member **ACTIVE** yang boleh memakai benefit (`DomainException` bila tidak).
- Transaksi hanya dapat dicatat dalam jendela **48 jam setelah scan kartu member** oleh vendor yang sama. Jika melewati 48 jam, vendor wajib scan ulang.
- Promo yang dipakai **harus milik partner yang sama** dengan yang mencatat transaksi.
- Diskon dihitung: `percent` → `round(total × value / 100)`; `nominal` → `min(value, total)`.
- Diskon hanya berlaku jika `total >= min_purchase`.
- `net_amount = total_amount - discount_amount`; `transaction_number` unik `TRX-{timestamp}-{rand}`.
- Notifikasi "Benefit Terpakai" dikirim ke member.
- Scan vendor yang belum memiliki transaksi ditampilkan sebagai **Pending Transaction**. Vendor dapat melengkapi transaksi secara manual sampai 48 jam setelah scan; setelah transaksi disimpan, scan tidak lagi pending.

## Pembayaran & Verifikasi
- **Member TIDAK membayar/submit pembayaran di sistem.** Pembayaran dilakukan langsung ke admin (offline); admin yang mencatat.
- Admin mencatat pembayaran manual via `admin.payments.store` (`member_id`, `plan_id`, `notes?`) → payment dibuat **langsung approved** (createPending + approve dalam satu transaksi) → membership aktif/diperpanjang + notifikasi ke member.
- Member hanya **melihat** riwayat pembayaran di halaman HISTORY (tab Payments), read-only.
- `reject` (untuk pembayaran yang salah/tidak valid) → wajib alasan.
- Payment tidak bisa di-approve/reject dua kali (harus pending).
- Scheduler `expireOverduePayments` menjadi tidak relevan (payment dibuat langsung approved), namun tetap ada di service.

## Komunitas (Member)
- Konten: `event`, `announcement`, `news`, `agenda`.
- Hanya konten `is_published` + `published_at <= now` yang tampil **hanya di sisi admin** (kelola konten).
- **Member tidak lagi melihat fitur komunitas** — halaman, route, dan controller sisi member dihapus (revisi klien).
- Admin tetap bisa membuat/mengedit/menghapus konten komunitas.

## Home Banners dan Agenda
- Home member menampilkan **maksimal 3 banner promo** yang dikurasi admin.
- Agenda Home diambil otomatis, maksimal 3 event/activity dari Events & Activities yang berstatus published/aktif.
- Featured Home Banner selalu berupa promo; agenda Home diambil otomatis dari Events & Activities dan tidak dibuat sebagai banner manual.
- **Maksimal 3 banner aktif**; admin menambah/edithapus/aktifnonaktif via `admin.banners.*`.
- Layout member adaptif: 1 banner → 1 kartu; 2 → dua kartu sejajar (kiri-kanan); 3 → dua sejajar + satu lebar di bawah.
- Banner promo hanya tampil jika targetnya visible (approved + aktif + dalam periode); agenda otomatis hanya tampil jika `is_published`, `published_at <= now()`, dan diurutkan berdasarkan tanggal kegiatan. Target yang tidak valid/dihapus di-filter dari payload member.
- Seeder: 3 banner demo (2 promo + 1 agenda).

## Home Opening Popup
- Admin dapat mengatur satu popup promo terpisah dari tiga slot Home Banners melalui menu **Opening popup**.
- Popup hanya tampil jika konfigurasi aktif dan promo target visible untuk member.
- Popup muncul 3 detik setelah setiap pembukaan halaman Home; menutup popup hanya berlaku untuk kunjungan tersebut.

## Menu & Navigasi Member (revisi)
- Navbar member: **HOME, HISTORY, PARTNER, NOTIF, BILLING, ACCOUNT** (bahasa Inggris).
- **BILLING** = halaman manajemen billing: status membership, current plan, masa berlaku, daftar plan tersedia, dan petunjuk renew/extend (offline payment).
- PARTNER = gabungan daftar **Promo** + daftar **Partner** (satu halaman, dua tab).
- Filter kategori pada PARTNER diterapkan ke daftar promo berdasarkan kategori partner dan ke daftar partner.
- HISTORY = gabungan **riwayat pembayaran** + **riwayat penggunaan benefit** (satu halaman, dua tab).
- Home: kartu digital + foto member, dan maksimal **3 promo terbaru** (limit 3).

## Akses Role
- Setiap route area dibungkus `role:member|vendor|admin` + `auth` + `verified`.
- Root `/` me-redirect sesuai role via `User::homeRoute()`.
- Vendor tanpa partner terhubung → 403 di dashboard/verify/transaksi/promo.

## Komunitas
- Konten: `event`, `announcement`, `news`, `agenda`.
- Hanya konten `is_published` + `published_at <= now` yang tampil untuk member.
- Member hanya bisa melihat; admin yang membuat/mengedit/menghapus.

## Notifikasi
- Tipe: `promo`, `membership`, `community`, `system`, `transaction`.
- Admin bisa broadcast ke semua member atau ke satu member.
- Badge unread dihitung dari `appNotifications()->unread()->count()`.
