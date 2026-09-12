# DOKUMEN SPESIFIKASI & DAFTAR REVISI SISTEM KBKB

Berdasarkan dokumen resmi Google Docs:
`https://docs.google.com/document/d/1w568tTuPZe4FWNwUfpJ6gIaympEYtQlObOcZUlE9Cvo/edit`

Tanggal Pembaruan: 12 September 2026

---

## 1. Bahasa & Waktu
- **Semua bahasa dalam sistem**: Wajib menggunakan **Bahasa Indonesia** secara menyeluruh (Label form, tombol, navigasi, tabel, alert/flash message, email/notifikasi).
- **Timezone**: Menggunakan **WITA (UTC+8)** / `Asia/Makassar` di konfigurasi Laravel (`config/app.php`).
- **Format Tanggal**: Untuk seluruh informasi tanggal di antarmuka (UI), **cukup tampilkan Hari/Tanggal** (contoh: `Senin, 12 Sep 2026` atau `12 Sep 2026`), **tidak perlu menampilkan jam:menit**.

---

## 2. QR Member (Digital Card)
- **Interaksi QR Code**: QR Code pada kartu digital member (`MemberCard.jsx`) dapat diklik oleh user.
- **Lightbox / Modal Zoom**: Saat diklik, muncul modal popup resolusi tinggi berisi QR Code besar, nama member, dan kode member agar mudah di-scan oleh kasir/vendor.

---

## 3. Member & Membership
- **Harga Membership**: Rp100.000 per 30 hari (bukan per bulan kalender masehi).
- **Pilihan Periode**: Member dapat memilih durasi **1 s.d. 12 bulan**:
  - 1 bulan = 30 hari (Rp100.000)
  - 2 bulan = 60 hari (Rp200.000)
  - ...
  - 12 bulan = 360 hari (Rp1.200.000)
- **Masa Berlaku**:
  - Berlaku untuk blok 30 hari x jumlah bulan yang dipilih.
  - Masa berlaku dimulai sejak tanggal pembayaran disetujui.
  - **Tidak ada masa tenggang (grace period)**.
- **Perhitungan Perpanjangan**:
  - **Setelah Expired**: Jika status sudah kedaluwarsa saat bayar, masa berlaku baru dihitung:
    $$\text{Expired Baru} = \text{Tanggal Pembayaran} + (30 \times \text{Periode Bulan}) \text{ hari}$$
  - **Sebelum Expired**: Jika diperpanjang saat masih aktif:
    $$\text{Expired Baru} = \text{Tanggal Selesai Lama} + (30 \times \text{Periode Bulan}) + 1 \text{ hari}$$
- **Payment Gateway**:
  - Biaya admin / payment gateway dibebankan kepada pembeli.
  - Pendapatan bersih yang diterima sistem tetap **Rp100.000 per bulan**.
- **Promo Partner Club (Otomatis / Aturan Khusus)**:
  - Member yang bergabung **September 2026**: Mendapatkan status Partner Club gratis untuk bulan **Oktober dan November 2026**.
  - Member yang bergabung **Oktober 2026**: Mendapatkan Partner Club gratis selama **30 hari**.
  - Member yang bergabung **November 2026**: Mendapatkan Partner Club gratis jika membayar membership sebagai Partner Club minimal **+6 bulan sekaligus**.
  - **Existing Member**: Tetap harus menambah perpanjangan minimum **+6 bulan** sebagai Member Club.

---

## 4. Partner (Vendor)
- **Biaya Partner**: Rp100.000 per 30 hari.
- **Masa Berlaku Partner**:
  - Memiliki tanggal masa berlaku (`expires_at`), fleksibel sesuai ketentuan.
  - **Paket Bundling Member**:
    - Jika Member membayar membership 1 tahun (12 bulan), otomatis mendapatkan Partner gratis selama 1 tahun.
    - Jika Member membayar membership 3 bulan, otomatis mendapatkan Partner gratis selama 3 bulan.
    - Pembayaran gratis ini tetap dicatat di riwayat dengan status transaksi / tagihan **`FREE`**.
- **Status Partner**:
  - Data partner memiliki status: **Aktif (`active`)** & **Tidak Aktif (`inactive`)**.
  - Jika berstatus **Tidak Aktif** (atau masa berlaku habis):
    1. **Tidak dapat menerima transaksi** (proses input/verifikasi QR transaksi ditolak dengan pesan peringatan).
    2. **Tidak dapat membuat promo baru**.
    3. **Otomatis tidak muncul pada direktori/daftar Partner** publik maupun member.
    4. Jika sudah tidak lagi menjadi partner, nama partner otomatis terhapus / unlisted dari daftar partner.

---

## 5. Registrasi & Autentikasi
- **Pilihan Peran saat Registrasi**:
  - Daftar sebagai **Member**
  - Daftar sebagai **Partner**
- **Approval Admin**:
  - Seluruh pendaftaran (baik Member maupun Partner) wajib berstatus `pending` dan **di-approve oleh Admin** sebelum akun dapat aktif bertransaksi / login normal.
  - Tersedia menu verifikasi/approval di Admin Panel.
- **Autofill Data**:
  - Data yang sudah diinput atau tersedia dari akun akan dimasukkan secara otomatis.
- **Password Awal**:
  - Sistem meng-generate password awal secara otomatis (random secure temporary password).
  - Password ditampilkan / diinformasikan ke user.
  - Flag `must_change_password`: Setelah login pertama kali, sistem **memaksa user melakukan update password** sebelum bisa mengakses fitur dashboard lainnya.

---

## 6. Profile Member
- Member dapat memperbarui profil secara mandiri:
  - **Email**
  - **Agama** (`islam`, `kristen`, `katolik`, `hindu`, `buddha`, `konghucu`, `lainnya`)
  - **Alamat** (kolom `address` baru pada tabel user)
  - **Foto Profil** (`avatar`)

---

## 7. Billing Partner
- Pada portal / sidebar Partner, ditambahkan menu **Billing**:
  - Informasi masa berlaku akun partner & status aktif.
  - Formulir / tombol perpanjangan membership partner (pilihan durasi 1–12 bulan x Rp100.000).
  - Riwayat billing partner (termasuk pencatatan gratis dengan status `FREE`).

---

## 8. Integrasi WhatsApp
- Menambahkan kontak WhatsApp resmi di dalam sistem setelah login, baik untuk role **Member** maupun role **Partner**:
  - Floating WhatsApp Help Button / Navigasi Bantuan di layout Member & Partner.
  - Mengarahkan langsung ke chat WhatsApp CS KBKB dengan template pesan otomatis.

---

## 9. SOP Deploy ke Hosting KBKB (`nvme2.natanetwork.id` / `kbkb.id`)
1. **Backup Database**: Jalankan `mysqldump` database `kbkbid_membership` sebelum migrate.
2. **Push Git**: Commit semua perubahan lokal dan push ke `origin main`.
3. **Deploy Script**: Jalankan `/home/kbkbid/deploy-kbkb.sh` via SSH `kbkb`.
4. **Verifikasi**: Cek endpoint HTTP https://kbkb.id dan fungsionalitas utama.
