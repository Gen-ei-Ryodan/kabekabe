# DATABASE.md

SQLite (dev). Semua tabel dibuat lewat migrasi; `RefreshDatabase` untuk test.

## users
| kolom | tipe | keterangan |
|-------|------|------------|
| id | id | |
| name | string | |
| email | string unique | |
| email_verified_at | timestamp nullable | |
| password | string | hashed cast |
| role | enum(member,admin,vendor) default member, index | |
| phone, whatsapp, company | string nullable | |
| avatar | string nullable | storage path |
| member_code | string unique nullable | `7030YYNNNN`, contoh `7030260001` |
| card_token | string unique nullable | UUID QR |
| notification_settings | json nullable | |
| gender | enum nullable | `male` atau `female` |
| religion | enum nullable | islam, kristen, katolik, buddha, hindu, lainnya |
| birth_date | date nullable | tidak boleh di masa depan |
| city | string nullable | |

## memberships (1:1 per member)
| kolom | tipe |
|-------|------|
| member_id | FK users, cascade, **unique** |
| status | enum(active,inactive) default active, index |
| started_at | timestamp nullable |
| expires_at | timestamp nullable, index |

## membership_plans
| kolom | tipe |
|-------|------|
| name | string |
| duration_months | unsignedInteger, **unique** |
| price | unsignedBigInteger |
| is_active | boolean default true |

## payments
| kolom | tipe |
|-------|------|
| invoice_number | string unique |
| member_id | FK users cascade |
| plan_id | FK membership_plans restrict |
| period_months | unsignedInteger |
| amount | unsignedBigInteger |
| status | enum(pending,approved,rejected,expired) index |
| paid_at | timestamp nullable |
| proof_path | string nullable |
| notes | text nullable (alasan penolakan) |
| previous_expires_at / new_expires_at | timestamp nullable |
| approved_by | FK users nullOnDelete nullable |
| approved_at | timestamp nullable |
| index | (member_id, status) |

## partners
| kolom | tipe |
|-------|------|
| user_id | FK users cascade (akun vendor) |
| name | string |
| slug | string unique |
| category | string |
| description | text nullable |
| address | text nullable |
| phone, email | string nullable |
| logo | string nullable (storage path) |
| is_active | boolean default true |
| index | (category, is_active) |
| appends | `logo_url` = `/storage/{logo}` |

## promos
| kolom | tipe |
|-------|------|
| partner_id | FK partners cascade |
| title | string |
| description | text nullable |
| discount_type | enum(percent,nominal) |
| discount_value | unsignedBigInteger |
| min_purchase | unsignedBigInteger default 0 |
| start_date / end_date | date |
| terms | text nullable |
| status | enum(pending,approved,rejected) index |
| rejection_reason | string nullable |
| is_active | boolean default true |
| submitted_at, reviewed_at | timestamp nullable |
| reviewed_by | FK users nullable |
| index | (status,is_active,end_date), (partner_id,status) |

## transactions
| kolom | tipe |
|-------|------|
| transaction_number | string unique |
| partner_id | FK partners cascade |
| member_id | FK users restrict |
| promo_id | FK promos nullOnDelete nullable |
| total_amount | unsignedBigInteger |
| discount_percent | unsignedBigInteger nullable |
| discount_amount | unsignedBigInteger default 0 |
| net_amount | unsignedBigInteger |
| note | text nullable |
| proof_path | string nullable |
| transacted_at | timestamp |
| index | (partner_id,transacted_at), (member_id,transacted_at) |

## app_notifications
| kolom | tipe |
|-------|------|
| user_id | FK users cascade |
| title | string |
| body | text |
| type | string nullable index |
| action_url | string nullable |
| read_at | timestamp nullable |
| index | (user_id, read_at) |

## community_infos (Agenda Kegiatan)
| kolom | tipe |
|-------|------|
| type | enum(event,agenda) index |
| title | string |
| content | text |
| image | string nullable (storage path) |
| event_date | timestamp nullable |
| location | string nullable |
| fee | unsignedBigInteger nullable (contribution/urunan amount in rupiah) |
| is_published | boolean default false index |
| published_at | timestamp nullable |
| created_by | FK users nullable |
| index | (type, is_published) |
| appends | `image_url` = `/storage/{image}` |

## event_non_members
| kolom | tipe |
|-------|------|
| event_id | FK community_infos cascadeOnDelete |
| name | string |
| phone | string nullable |
| email | string nullable |
| attended | boolean default false |
| attended_at | timestamp nullable |
| index | (event_id, attended) |

## home_banners (slots home member, kurasi admin)
| kolom | tipe |
|-------|------|
| type | enum(promo,agenda) index |
| promo_id | FK promos nullOnDelete nullable |
| agenda_id | FK community_infos nullOnDelete nullable |
| sort_order | unsignedInteger default 1 |
| is_active | boolean default true |
| index | (is_active, sort_order) |

## home_popups (singleton popup promo home member)
| kolom | tipe | keterangan |
|-------|------|------------|
| promo_id | FK promos cascade | promo yang ditampilkan |
| image_path | string nullable | gambar popup di storage |
| is_active | boolean default true | popup tampil atau tidak |

Hanya satu konfigurasi popup yang digunakan. Popup aktif dikirim ke member Home dan ditampilkan setelah jeda 3 detik.

## Seed Data
`DatabaseSeeder`: 25 member, 5 partner (kfc, gramedia, rudy, transmart, gymfit), 5 promo, 4 transaksi, 1 payment, 19 notifikasi, 4 konten komunitas, 4 plan, 3 home banner (2 promo + 1 agenda), 1 home popup.
