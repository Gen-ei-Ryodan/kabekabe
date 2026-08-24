# SECURITY.md — Audit OWASP Top 10

Status: **Ditinjau**. Lingkup demo (single-server, web session).

## A01 Broken Access Control — ✓ Dilindungi
- Middleware `role:member|vendor|admin` di semua route berperan.
- Policy per model: `PromoPolicy.update/delete` memeriksa kepemilikan partner + status rejected untuk vendor; `PaymentPolicy.view` membatasi owner member; `TransactionPolicy.view` membatasi owner.
- Vendor `TransactionController` membatasi promo ke partner-nya (`where('partner_id', $partner->id)`).
- Vendor tanpa partner → `abort(403)`.
- Catatan: vendor `promos.update` di-gate policy (update hanya untuk status rejected miliknya).

## A02 Cryptographic Failures — ✓
- Password di-hash via cast `hashed`.
- `card_token` UUID acak untuk QR.
- Tidak ada secret/credential di repo; `.env` di-gitignore.

## A03 Injection — ✓
- Semua query Eloquent/parameterized; FormRequest validasi ketat.
- `rawOrderBy` hanya `FIELD(status, ...)` dengan konstanta in-list.

## A04 Insecure Design — ✓ Sebagian
- Throttle login/register/forgot-password (`throttle:6,1`, `throttle:5,1`).
- MFA / rate-limit per action tidak diimplementasikan (di luar scope demo).

## A05 Security Misconfiguration — ✓
- Middleware `SecurityHeaders` global: X-Frame-Options SAMEORIGIN, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy (camera=(self)), dan **CSP** dengan nonce.
- CSP `script-src 'self' 'nonce-…'`; `@routes` Ziggy & `@vite` diberi nonce yang sama (override directive di AppServiceProvider) — **terverifikasi header vs nonce script sama dalam satu request**.
- `APP_DEBUG` harus `false` di production.

## A06 Vulnerable & Outdated Components — ✓
- `composer audit`: 0 advisories. `npm audit`: 0 vulnerabilities.

## A07 Identification & Authentication Failures — ✓ Sebagian
- Breeze auth + email verification (`verified` middleware di semua area).
- Session driver default; cookie secure disarankan di production (HTTPS).

## A08 Software & Data Integrity — ✓
- Upload divalidasi mimes & size (logo/proof/image: jpg/jpeg/png/webp(+svg logo), max 2–4MB).
- Nama file dari `store()` (hash acak) — tidak ada path traversal.
- Hapus file lama saat replace (avatar/logo/community image).

## A09 Logging & Monitoring — ⚠️ Dasar
- Logging default Laravel (`stack`). Belum ada audit trail khusus pembayaran/promo selain `approved_by`/`reviewed_by`.

## A10 SSRF — ✓ N/A
- Tidak ada fetching URL server-side.

## Catatan Tindakan Sebelum Production
1. Set `APP_DEBUG=false`, `SESSION_SECURE_COOKIE=true`, DB prod + backup.
2. Migrasi ke queue worker untuk broadcast notifikasi massal.
3. Tambah scheduler untuk `PaymentService::expireOverduePayments()`.
4. Pertimbangkan 2FA & audit log untuk aksi finansial.