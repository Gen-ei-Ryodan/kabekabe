# Platform Digital Membership & Community Management

## 1. Konsep Utama

Platform ini merupakan **Web-Based Membership & Community Platform** yang menjadi pusat:

- Identitas digital member
- Informasi dan aktivitas komunitas
- Informasi promo dan partner
- Pembayaran membership
- Histori penggunaan benefit
- Verifikasi member oleh partner/vendor
- Monitoring dan laporan oleh admin

### Konsep utama dari sisi Member

> **Member memiliki kartu digital sebagai bukti keanggotaan resmi, mendapatkan informasi kegiatan dan pengumuman komunitas, serta dapat mengakses berbagai promo dan benefit dari partner selama membership masih aktif.**

### Konsep utama dari sisi Vendor/Partner

> **Member menunjukkan kartu digital → vendor melakukan verifikasi → sistem mengecek status membership → jika aktif, member dapat menggunakan benefit → transaksi dicatat → admin dapat memonitor seluruh aktivitas dan laporan.**

### Aturan utama

- Member **ACTIVE** → dapat menggunakan benefit/promo partner.
- Member **INACTIVE** → tidak dapat menggunakan benefit/promo partner.
- Tidak ada tier membership. **Seluruh member memiliki benefit yang sama.**
- Perbedaan hanya pada **periode/masa aktif membership**.

---

# 2. Role Sistem

Terdapat 3 role utama:

### Member

Pengguna/member komunitas yang menggunakan platform untuk melihat kartu membership, informasi komunitas, promo, partner, pembayaran, dan histori.

### Admin

Pengelola utama sistem yang mengatur member, partner, promo, informasi komunitas, notifikasi, transaksi, dan laporan.

### Vendor / Partner

Perusahaan atau merchant yang memberikan promo/benefit kepada member serta melakukan verifikasi dan pencatatan transaksi.

---

# 3. MEMBER

## A. Home

Home menjadi halaman utama member.

### Digital Member Card

Menampilkan **gambar/desain kartu member digital**, bukan sekadar informasi teks.

Isi kartu:

- Logo komunitas
- Gambar kartu member
- Foto member
- Nama member
- Member ID
- QR Code
- Status membership
- Masa berlaku membership

Contoh status:

**ACTIVE**

> Member dapat menggunakan benefit partner.

**INACTIVE**

> Member tidak dapat menggunakan benefit partner sampai membership diperpanjang.

Kartu digital berfungsi sebagai:

1. **Bukti keanggotaan resmi**
2. **Identitas member**
3. **Media verifikasi ketika menggunakan benefit partner**

### Promo

Menampilkan promo/benefit partner yang sedang aktif. Promo dapat ditampilkan dalam bentuk card.

---

# 4. PAYMENT & HISTORY

Halaman ini berisi histori pembayaran dan penggunaan membership.

## A. Membership Payment

Member dapat melakukan pembayaran/perpanjangan membership berdasarkan periode.

Contoh:

- 1 bulan
- 3 bulan
- 6 bulan
- 12 bulan

Data pembayaran:

- Tanggal pembayaran
- Periode membership
- Nominal
- Status pembayaran
- Masa berlaku membership
- Invoice/bukti pembayaran

## B. Benefit / Transaction History

Menampilkan histori penggunaan benefit di partner.

Contoh:

> **KFC**  
> 20 Agustus 2026  
> Total Belanja: Rp1.000.000  
> Discount: 10%  
> Total Discount: Rp100.000  
> Net Sales: Rp900.000

---

# 5. PARTNER

Halaman Partner dibagi menjadi dua bagian.

## A. Promo

Menampilkan seluruh promo aktif dari partner.

Informasi promo:

- Nama promo
- Partner
- Deskripsi
- Periode promo
- Besaran discount/benefit
- Syarat dan ketentuan

Contoh:

> **KFC**  
> Discount 10% untuk pembelian minimal Rp1.000.000  
> Berlaku 1-31 Agustus 2026

Promo hanya dapat digunakan oleh member dengan status **ACTIVE**.

## B. List Partner

Menampilkan daftar partner komunitas berdasarkan kategori:

- FNB
- Salon
- Retail
- dll

Informasi partner dapat meliputi:

- Nama partner
- Kategori
- Deskripsi
- Alamat
- Kontak

---

# 6. NOTIFICATION

Member mendapatkan berbagai notifikasi dari sistem.

Contoh:

- Membership berhasil diperpanjang
- Membership akan segera berakhir
- Membership telah inactive
- Promo baru
- Promo akan berakhir
- Informasi kegiatan komunitas
- Pengumuman admin
- Informasi transaksi

Admin dapat mengatur dan mengirimkan notifikasi kepada member.

---

# 7. ACCOUNT

Halaman pengaturan akun member.

Berisi:

- Foto profil
- Nama
- Nomor WhatsApp
- Email
- Data perusahaan
- Password
- Pengaturan notifikasi
- Logout

---

# 8. ADMIN

Admin memiliki akses untuk mengelola seluruh aktivitas platform.

## A. Member Management

Admin dapat:

- Melihat daftar member
- Menambahkan member
- Mengedit member
- Mengaktifkan/nonaktifkan member
- Melihat status membership
- Melihat masa berlaku membership
- Melihat histori pembayaran
- Melihat histori penggunaan benefit

## B. Partner / Vendor Management

Admin dapat:

- Menambahkan partner
- Mengedit partner
- Melihat partner
- Mengaktifkan/nonaktifkan partner
- Mengelola informasi partner

## C. Promo Management

Admin dapat:

- Melihat promo
- Approve promo
- Reject promo
- Edit promo
- Mengaktifkan/nonaktifkan promo
- Mengatur periode promo

Promo yang dibuat vendor **tidak langsung tampil ke member** dan harus melalui approval admin.

## D. Community Information

Admin dapat mengelola:

- Event
- Kegiatan
- Pengumuman
- Berita/informasi komunitas
- Agenda

## E. Notification Management

Admin dapat membuat dan mengirimkan notifikasi kepada member.

## F. Transaction Management

Admin dapat melihat seluruh transaksi yang dicatat oleh partner.

## G. Reporting

Dashboard laporan dapat menampilkan:

- Total member
- Member aktif
- Member inactive
- Total partner
- Total promo
- Total transaksi
- Total nilai transaksi
- Total discount
- Net sales
- Transaksi berdasarkan partner
- Transaksi berdasarkan periode

---

# 9. VENDOR / PARTNER

Vendor memiliki dashboard khusus untuk mengelola aktivitas kerja sama dengan komunitas, mulai dari verifikasi member, pengelolaan promo, hingga pencatatan dan laporan transaksi.

## A. Dashboard

Menampilkan ringkasan aktivitas vendor:

- Total member aktif
- Total transaksi
- Total nilai transaksi
- Total discount
- Net sales

## B. Scan QR & Member Verification

Vendor dapat melakukan **scan QR Code pada Digital Member Card** untuk mengetahui status membership.

Alur:

**Member datang → Menunjukkan Digital Member Card → Vendor Scan QR → Sistem mengecek status membership**

Jika **ACTIVE**:

- Member ID
- Nama member
- Foto member
- Status membership
- Masa berlaku
- Member dapat menggunakan benefit promo

Jika **INACTIVE**:

- Status membership inactive
- Member tidak dapat menggunakan benefit/promo

## C. Promo Management

Vendor dapat membuat dan mengajukan promo untuk member.

Contoh:

> **Diskon 10%**  
> Minimal pembelian Rp1.000.000  
> Periode 1-31 Agustus 2026

Alur:

**Vendor membuat promo → Submit → Admin melakukan review → Approve / Reject**

Jika disetujui, promo akan tampil kepada member.

Jika ditolak, vendor dapat melakukan revisi dan mengajukan kembali.

## D. Transaction Recording

Transaksi pembelian tetap dilakukan melalui sistem kasir/POS milik vendor. Platform membership digunakan untuk **mencatat transaksi yang menggunakan benefit membership**.

Alur:

**Member scan QR → Status ACTIVE → Member melakukan transaksi di POS vendor → Vendor mendapatkan nota → Vendor mencatat transaksi ke platform**

Vendor dapat memasukkan:

- Nomor transaksi
- Member ID
- Total belanja
- Discount
- Keterangan
- Upload foto nota sebagai bukti transaksi

Data transaksi kemudian tersimpan di sistem dan dapat dilihat oleh member serta admin.

## E. Transaction Report

Vendor dapat melihat **laporan transaksi secara detail** dan melakukan filter berdasarkan periode.

Contoh:

> **Periode: Agustus 2026**

| Field | Keterangan |
| --- | --- |
| No. Transaksi | Nomor transaksi |
| Tanggal | Tanggal transaksi |
| Member ID | ID member |
| Nama Member | Nama member |
| Total Belanja | Nilai transaksi sebelum discount |
| Discount | Persentase discount |
| Total Discount | Nominal discount |
| Net Sales | Nilai transaksi setelah discount |
| Keterangan | Catatan transaksi |
| Nota | Foto/bukti transaksi |

**Vendor hanya dapat melihat transaksi milik mereka sendiri, sedangkan Admin dapat melihat seluruh transaksi dari seluruh vendor.**

---

# 10. Alur Besar Sistem

```text
                         MEMBER
                            │
                            ▼
                  DIGITAL MEMBER CARD
                            │
                  ┌─────────┴─────────┐
                  │                   │
                  ▼                   ▼
           INFO KOMUNITAS       PROMO & PARTNER
                  │                   │
                  │                   ▼
                  │             DATANG KE PARTNER
                  │                   │
                  │                   ▼
                  │              SCAN QR MEMBER
                  │                   │
                  │                   ▼
                  │           CEK STATUS MEMBER
                  │              /           \
                  │             /             \
                  │          ACTIVE          INACTIVE
                  │            │                │
                  │            ▼                ▼
                  │      DAPAT BENEFIT      TIDAK DAPAT
                  │            │              BENEFIT
                  │            ▼
                  │       TRANSAKSI POS
                  │            │
                  │            ▼
                  │       INPUT TRANSAKSI
                  │            │
                  └────────────┼──────────────┐
                               ▼              │
                       TRANSACTION HISTORY    │
                               │              │
                         ┌─────┴─────┐        │
                         ▼           ▼        ▼
                       MEMBER      ADMIN    REPORT
                                     │
                        ┌────────────┼────────────┐
                        ▼            ▼            ▼
                      MEMBER      PARTNER       REPORT
                    MANAGEMENT   MANAGEMENT      & DATA
                                     │
                                     ▼
                               PROMO APPROVAL
```

---

# 11. Positioning Final

Secara keseluruhan, sistem dapat diposisikan sebagai:

> **Platform Digital Membership & Community Management**

Sebuah platform terintegrasi untuk mengelola:

- Keanggotaan komunitas
- Kartu member digital
- Informasi kegiatan
- Partner & benefit
- Verifikasi membership
- Pencatatan transaksi
- Monitoring
- Reporting

Struktur sistem membagi fungsi secara jelas antara **Member, Admin, dan Vendor/Partner**.

Core workflow:

> **QR → Verifikasi → Benefit → Transaksi → History → Reporting**

Workflow tersebut menjadi satu ekosistem utama dalam platform.
