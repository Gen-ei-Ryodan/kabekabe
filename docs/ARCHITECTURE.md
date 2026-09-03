# ARCHITECTURE.md

## Pola Arsitektur
- **Laravel + Inertia + React**: server merender Inertia page components; React di sisi klien.
- **Service Pattern**: logika bisnis di `app/Services/`, controller tipis.
- **Policy + FormRequest**: otorisasi via policy, validasi via FormRequest.
- **Middleware**: `role:` (EnsureRole), `SecurityHeaders` (CSP + hardening), throttling auth.
- **Model**: Laravel 13 attribute style (`#[Fillable]`, `#[Hidden]`, `#[Appends]`).

## Struktur Folder
```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Member/    # Home, Promo (show), Partner, History, Notification, Account (Payment & Community dihapus)
│   │   ├── Vendor/    # Dashboard, Verify, Promo, Transaction, Report
│   │   └── Admin/     # Dashboard, Member, Partner, Promo, Payment (+create/store), HomeBanner, Community, Notification, Transaction, Report
│   ├── Middleware/    # EnsureRole, SecurityHeaders, HandleInertiaRequests
│   └── Requests/      # 17 FormRequests
├── Models/            # User, Membership, MembershipPlan, Payment, Partner, Promo, HomeBanner, HomePopup, Transaction, AppNotification, CommunityInfo
├── Policies/          # PaymentPolicy, PromoPolicy, TransactionPolicy, PartnerPolicy, CommunityInfoPolicy, MembershipPolicy
├── Providers/         # AppServiceProvider (Vite prefetch + @routes nonce CSP)
└── Services/          # MembershipService, PaymentService, PromoService, TransactionService, NotificationService, ReportingService

resources/
├── js/
│   ├── Components/    # AppLogo, MemberCard, StatusChip, StatCard, Reveal (GSAP), Pagination, EmptyState, QrCode, FlashMessages
│   ├── Layouts/       # MemberLayout, VendorLayout, AdminLayout, GuestLayout
│   ├── Pages/
│   │   ├── Auth/      # Login, Register, dsb (SENTRA style)
│   │   ├── Member/    # 7 halaman: Home, History, Partners (Index/Show), Promos/Show, Notifications, Account
│   │   ├── Vendor/    # 9 halaman (lengkap)
│   │   └── Admin/     # 18 halaman + Payments/Create + Banners (banner + Opening popup)
│   └── Utils/format.js
├── css/app.css        # Design tokens + utility classes (.input, .label, .btn-*, .card-surface, .eyebrow)
└── views/app.blade.php # Fonts + @routes (nonce) + @vite

routes/
├── web.php           # Semua route role-scoped (member., vendor., admin.)
└── auth.php          # Breeze auth + throttle
```

## Service Pattern
| Service | Tanggung jawab |
|---------|---------------|
| `MembershipService` | `ensureMembership`, `extend`, `deactivate`, `activate`, `isActive` |
| `PaymentService` | `createPending`, `approve` (perpanjang membership), `reject`, `expireOverduePayments` |
| `PromoService` | `submit`, `approve`, `reject` (+ notifikasi) |
| `TransactionService` | `record` — validasi member aktif + promo milik partner, hitung diskon |
| `NotificationService` | `send`, `broadcastToMembers` |
| `ReportingService` | `adminDashboard`, `vendorDashboard`, `transactionsReport` |

## Frontend Pattern
- **Layout per role**: komponen `*Layout.jsx` menyediakan shell (sidebar/nav) via `.layout` static property pada halaman.
- **Reveal**: komponen `Reveal` memakai GSAP ScrollTrigger untuk animasi masuk.
- **MemberCard**: kartu digital 3D tilt (GSAP) dengan latar `bglogin.png`, foto member kanan atas (klik untuk lightbox), QR di kiri bawah, status membership berwarna kontras, dan overlay X untuk member non-active.
- **StatusChip**: tone `active/inactive/pending/approved/rejected/expired`.
- **Ziggy**: `route()` dipakai di seluruh frontend; `@routes` diberi CSP nonce via override directive di AppServiceProvider.

## Catatan Desain (Design Tokens)
- Warna: ink `#0B1526`, paper `#F5F2EB`, gold `#C9A227`, ember `#C2542E`, sage `#2E7D5B`, slate `#5B6472`.
- Font: Space Grotesk (display), Inter (body), JetBrains Mono (kode/harga).
