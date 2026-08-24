# BUSINESS_RULES.md

## Status Membership
- Membership bersifat **1:1** per member (`member_id` unique).
- **ACTIVE** = `status='active'` **DAN** `expires_at` di masa depan.
- Member tanpa baris membership atau `expires_at` lewat = **INACTIVE**.
- Perpanjangan menambah bulan dari `expires_at` saat ini bila masih aktif, jika tidak dari `now()`.
- `ensureMembership()` membuat baris inactive bila belum ada; selalu `setRelation('membership', ...)` untuk hindari stale relation.

## Kartu Digital & QR
- `card_token` (UUID) dibangkitkan otomatis saat user member dibuat, dan dijamin via `ensureCardToken()`.
- `member_code` format `MMB-XXXXX`, auto-increment per member.
- QR kartu berisi `card_token`; vendor juga bisa memasukkan `member_code` manual.

## Promo
- Alur: vendor `submit` → status `pending` → admin `approve`/`reject` (wajib alasan) → `approved`.
- Promo **visible** untuk member hanya jika: `approved` + `is_active` + `start_date <= now <= end_date`.
- Vendor hanya boleh edit ulang promo **rejected** miliknya (policy).
- Vendor hanya melihat/menghapus promo milik partner-nya.
- `discount_value` maks 100.000.000; `end_date >= start_date`.

## Transaksi Benefit
- Hanya member **ACTIVE** yang boleh memakai benefit (`DomainException` bila tidak).
- Promo yang dipakai **harus milik partner yang sama** dengan yang mencatat transaksi.
- Diskon dihitung: `percent` → `round(total × value / 100)`; `nominal` → `min(value, total)`.
- Diskon hanya berlaku jika `total >= min_purchase`.
- `net_amount = total_amount - discount_amount`; `transaction_number` unik `TRX-{timestamp}-{rand}`.
- Notifikasi "Benefit Terpakai" dikirim ke member.

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

## Home Banners (kurasi admin)
- Home member menampilkan **maksimal 3 banner** yang dikurasi admin (bukan list promo otomatis).
- Setiap banner bertipe `promo` (referensi promo) atau `agenda` (referensi konten komunitas).
- **Maksimal 3 banner aktif**; admin menambah/edithapus/aktifnonaktif via `admin.banners.*`.
- Layout member adaptif: 1 banner → 1 kartu; 2 → dua kartu sejajar (kiri-kanan); 3 → dua sejajar + satu lebar di bawah.
- Banner promo hanya tampil jika targetnya visible (approved + aktif + dalam periode); banner agenda hanya jika konten `is_published`. Target yang tidak valid/dihapus di-filter dari payload member.
- Seeder: 3 banner demo (2 promo + 1 agenda).

## Menu & Navigasi Member (revisi)
- Navbar member: **HOME, HISTORY, PARTNER, NOTIF, ACCOUNT** (bahasa Inggris).
- PARTNER = gabungan daftar **Promo** + daftar **Partner** (satu halaman, dua tab).
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