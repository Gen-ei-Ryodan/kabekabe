# API_REFERENCE.md

Semua route web (Inertia). Konvensi nama route: `{role}.{resource}.{action}`. Proteksi: `auth` + `verified` + `role:{role}`.

## Auth (Breeze) — `routes/auth.php`
| Method | URI | Name | Keterangan |
|--------|-----|------|-----------|
| GET | `/login` | `login` | throttle `6,1` |
| POST | `/login` | `login` | throttle `6,1` |
| POST | `/logout` | `logout` | |
| GET | `/register` | `register` | throttle `6,1` |
| POST | `/register` | `register` | throttle `6,1` |
| GET | `/forgot-password` | `password.request` | throttle `5,1` |
| POST | `/forgot-password` | `password.email` | |
| GET | `/reset-password/{token}` | `password.reset` | |
| POST | `/reset-password` | `password.store` | |
| PUT | `/password` | `password.update` | |
| GET | `/verify-email` | `verification.notice` | |
| POST | `/email/verification-notification` | `verification.send` | |
| GET | `/verify-email/{id}/{hash}` | `verification.verify` | |
| GET | `/confirm-password` | `password.confirm` | |

## Member (`/member`, middleware `role:member`)
| Method | URI | Name |
|--------|-----|------|
| GET | `/home` | `member.home` |
| GET | `/promos/{promo}` | `member.promos.show` |
| GET | `/partners` | `member.partners.index` (props: `partners`, `promos`, `categories`, `filters`) |
| GET | `/partners/{partner}` | `member.partners.show` |
| GET | `/history` | `member.history.index` (props: `payments`, `transactions`, `total_benefit`, `membership`) |
| GET | `/notifications` | `member.notifications.index` |
| POST | `/notifications/read-all` | `member.notifications.read-all` |
| POST | `/notifications/{notification}/read` | `member.notifications.read` |
| GET | `/account` | `member.account.edit` |
| PUT | `/account` | `member.account.update` |

> **Dihapus (revisi klien):** `member.payments.index/store/proof` (member tidak membayar via sistem; admin yang mencatat), `member.promos.index` (list promo digabung ke PARTNER), `member.community.*` (fitur komunitas tidak lagi tampil untuk member).

## Vendor (`/vendor`, middleware `role:vendor`)
| Method | URI | Name |
|--------|-----|------|
| GET | `/dashboard` | `vendor.dashboard` |
| GET | `/verify` | `vendor.verify` |
| GET | `/verify/{token}` | `vendor.verify.token` (token = card_token ATAU member_code) |
| GET | `/promos` | `vendor.promos.index` |
| GET | `/promos/create` | `vendor.promos.create` |
| POST | `/promos` | `vendor.promos.store` |
| GET | `/promos/{promo}/edit` | `vendor.promos.edit` |
| PUT | `/promos/{promo}` | `vendor.promos.update` |
| DELETE | `/promos/{promo}` | `vendor.promos.destroy` |
| GET | `/transactions` | `vendor.transactions.index` |
| GET | `/transactions/create` | `vendor.transactions.create` |
| POST | `/transactions` | `vendor.transactions.store` (payload: `member_code`, `promo_id?`, `total`, `note?`, `proof?`) |
| GET | `/reports` | `vendor.reports.index` |

## Admin (`/admin`, middleware `role:admin`)
| Method | URI | Name |
|--------|-----|------|
| GET | `/dashboard` | `admin.dashboard` |
| GET | `/members` | `admin.members.index` |
| GET | `/members/create` | `admin.members.create` |
| POST | `/members` | `admin.members.store` |
| GET | `/members/{member}` | `admin.members.show` |
| GET | `/members/{member}/edit` | `admin.members.edit` |
| PUT | `/members/{member}` | `admin.members.update` |
| PUT | `/members/{member}/status` | `admin.members.toggle` |
| DELETE | `/members/{member}` | `admin.members.destroy` |
| GET | `/partners` | `admin.partners.index` |
| GET | `/partners/create` | `admin.partners.create` |
| POST | `/partners` | `admin.partners.store` |
| GET | `/partners/{partner}/edit` | `admin.partners.edit` |
| PUT | `/partners/{partner}` | `admin.partners.update` |
| PUT | `/partners/{partner}/toggle` | `admin.partners.toggle` |
| DELETE | `/partners/{partner}` | `admin.partners.destroy` |
| GET | `/promos` | `admin.promos.index` |
| GET | `/promos/{promo}/edit` | `admin.promos.edit` |
| PUT | `/promos/{promo}` | `admin.promos.update` |
| PUT | `/promos/{promo}/approve` | `admin.promos.approve` |
| PUT | `/promos/{promo}/reject` | `admin.promos.reject` (payload: `reason`) |
| PUT | `/promos/{promo}/toggle` | `admin.promos.toggle` |
| GET | `/payments` | `admin.payments.index` |
| GET | `/payments/create` | `admin.payments.create` |
| POST | `/payments` | `admin.payments.store` (payload: `member_id`, `plan_id`, `notes?`) |
| GET | `/payments/{payment}` | `admin.payments.show` |
| GET | `/banners` | `admin.banners.index` |
| GET | `/banners/create` | `admin.banners.create` |
| POST | `/banners` | `admin.banners.store` (payload: `type`, `promo_id?`, `agenda_id?`, `sort_order`, `is_active`) |
| GET | `/banners/{banner}/edit` | `admin.banners.edit` |
| PUT | `/banners/{banner}` | `admin.banners.update` |
| PUT | `/banners/{banner}/toggle` | `admin.banners.toggle` |
| DELETE | `/banners/{banner}` | `admin.banners.destroy` |
| PUT | `/payments/{payment}/approve` | `admin.payments.approve` |
| PUT | `/payments/{payment}/reject` | `admin.payments.reject` (payload: `reason`) |
| GET | `/community` | `admin.community.index` |
| GET | `/community/create` | `admin.community.create` |
| POST | `/community` | `admin.community.store` (payload: `type`, `title`, `content`, `event_date?`, `location?`, `fee?`, `image?`, `is_published`) |
| GET | `/community/{info}` | `admin.community.show` |
| GET | `/community/{info}/edit` | `admin.community.edit` |
| PUT | `/community/{info}` | `admin.community.update` |
| DELETE | `/community/{info}` | `admin.community.destroy` |
| POST | `/community/{info}/attendance` | `admin.community.attendance.store` (payload: `member_id` OR `name`, `phone?`, `email?`) |
| POST | `/community/{info}/attendance/scan` | `admin.community.attendance.scan` (payload: `token` = card_token or member_code) |
| POST | `/community/{info}/payments` | `admin.community.payment.store` (payload: `member_id`) |
| POST | `/community/{info}/non-members` | `admin.community.non_member.store` (payload: `name`, `phone?`, `email?`)
| GET | `/notifications` | `admin.notifications.index` |
| POST | `/notifications` | `admin.notifications.store` (payload: `title`, `body`, `type`, `recipient_id?`, `action_url?`) |
| GET | `/transactions` | `admin.transactions.index` |
| GET | `/transactions/{transaction}` | `admin.transactions.show` |
| GET | `/reports` | `admin.reports.index` |

## Query Parameters (Index)
- `admin.members.index`: `search`, `status(active|inactive)`
- `admin.partners.index`: `search`
- `admin.promos.index` / `vendor.promos.index`: `status(pending|approved|rejected)`
- `admin.payments.index`: `status(pending|approved|rejected|expired)`
- `admin.community.index`: `type(event|agenda)`, `search`, `status(published|unpublished)`
- `admin.transactions.index` / `vendor.transactions.index`: `from`, `to`, `search`
- `admin.reports.index` / `vendor.reports.index`: `from`, `to`
- `member.partners.index`: `category`

## Semantics Penting
- `vendor.verify.token`: `?token` harus `card_token` atau `member_code`; hasil: `result.found`, `result.active`, `result.member`.
- `admin.payments.approve` memperpanjang membership otomatis (lihat PaymentService).
- Semua redirect memakai `->with('success'|'error', ...)` dan dibaca komponen `FlashMessages`.