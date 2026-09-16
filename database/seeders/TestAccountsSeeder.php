<?php

namespace Database\Seeders;

use App\Models\Partner;
use App\Models\Promo;
use App\Models\User;
use App\Services\MembershipService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class TestAccountsSeeder extends Seeder
{
    public function run(): void
    {
        $membershipService = app(MembershipService::class);

        // ==========================================
        // 1. 3 MEMBER AKTIF (Scan QR Valid, Status Aktif)
        // ==========================================
        $activeMembers = [
            [
                'name' => 'Budi Hartono (Member Aktif)',
                'email' => 'member.aktif1@kbkb.id',
                'member_code' => 'KBKB-MEM-001',
                'card_token' => '11111111-aaaa-4000-8000-000000000001',
                'phone' => '081211110001',
                'months' => 12,
            ],
            [
                'name' => 'Siti Rahmawati (Member Aktif)',
                'email' => 'member.aktif2@kbkb.id',
                'member_code' => 'KBKB-MEM-002',
                'card_token' => '22222222-bbbb-4000-8000-000000000002',
                'phone' => '081211110002',
                'months' => 6,
            ],
            [
                'name' => 'Dewi Lestari (Member Aktif)',
                'email' => 'member.aktif3@kbkb.id',
                'member_code' => 'KBKB-MEM-003',
                'card_token' => '33333333-cccc-4000-8000-000000000003',
                'phone' => '081211110003',
                'months' => 3,
            ],
        ];

        foreach ($activeMembers as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => 'password',
                    'role' => User::ROLE_MEMBER,
                    'approval_status' => 'approved',
                    'phone' => $data['phone'],
                    'whatsapp' => $data['phone'],
                    'member_code' => $data['member_code'],
                    'card_token' => $data['card_token'],
                    'email_verified_at' => now(),
                ]
            );

            // Aktifkan membership
            $membershipService->activate($user, $data['months']);
            $user->membership()->update([
                'status' => 'active',
                'expires_at' => now()->addMonths($data['months']),
            ]);
        }

        // ==========================================
        // 2. 3 MEMBER NON-AKTIF (Scan QR Valid, Status Nonaktif / Expired)
        // ==========================================
        $inactiveMembers = [
            [
                'name' => 'Hendra Wijaya (Member Non-Aktif)',
                'email' => 'member.nonaktif1@kbkb.id',
                'member_code' => 'KBKB-MEM-004',
                'card_token' => '44444444-dddd-4000-8000-000000000004',
                'phone' => '081211110004',
                'expired_days_ago' => 1,
            ],
            [
                'name' => 'Rina Marlina (Member Non-Aktif)',
                'email' => 'member.nonaktif2@kbkb.id',
                'member_code' => 'KBKB-MEM-005',
                'card_token' => '55555555-eeee-4000-8000-000000000005',
                'phone' => '081211110005',
                'expired_days_ago' => 30,
            ],
            [
                'name' => 'Andi Saputra (Member Non-Aktif)',
                'email' => 'member.nonaktif3@kbkb.id',
                'member_code' => 'KBKB-MEM-006',
                'card_token' => '66666666-ffff-4000-8000-000000000006',
                'phone' => '081211110006',
                'expired_days_ago' => 90,
            ],
        ];

        foreach ($inactiveMembers as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => 'password',
                    'role' => User::ROLE_MEMBER,
                    'approval_status' => 'approved',
                    'phone' => $data['phone'],
                    'whatsapp' => $data['phone'],
                    'member_code' => $data['member_code'],
                    'card_token' => $data['card_token'],
                    'email_verified_at' => now(),
                ]
            );

            $membership = $membershipService->ensureMembership($user);
            $membership->update([
                'status' => 'inactive',
                'expires_at' => now()->subDays($data['expired_days_ago']),
            ]);
        }

        // ==========================================
        // 3. 3 PARTNER AKTIF (Approved, Active, Valid Promo)
        // ==========================================
        $activePartners = [
            [
                'user_name' => 'PIC Kopi Kenangan',
                'email' => 'partner.aktif1@kbkb.id',
                'name' => 'Kopi Kenangan Senopati',
                'category' => 'F&B',
                'address' => 'Jl. Senopati No. 18, Jakarta Selatan',
                'phone' => '081222220001',
                'months' => 12,
                'promo' => [
                    'title' => 'Diskon 15% Min. Belanja Rp50.000',
                    'discount_type' => 'percent',
                    'discount_value' => 15,
                    'min_purchase' => 50000,
                ],
            ],
            [
                'user_name' => 'PIC Optik Melawai',
                'email' => 'partner.aktif2@kbkb.id',
                'name' => 'Optik Melawai BSD',
                'category' => 'Kesehatan & Optik',
                'address' => 'Ruko Tol Boulevard No. 12, BSD City',
                'phone' => '081222220002',
                'months' => 6,
                'promo' => [
                    'title' => 'Free Barang Cairan & Lap Pembersih Lensa',
                    'discount_type' => 'free_item',
                    'discount_value' => 50000,
                    'min_purchase' => 150000,
                ],
            ],
            [
                'user_name' => 'PIC AutoClean',
                'email' => 'partner.aktif3@kbkb.id',
                'name' => 'AutoClean Car Wash',
                'category' => 'Otomotif & Jasa',
                'address' => 'Jl. Panjang No. 88, Kebon Jeruk, Jakarta Barat',
                'phone' => '081222220003',
                'months' => 3,
                'promo' => [
                    'title' => 'Potongan Langsung Rp25.000 Cuci Mobil Komplit',
                    'discount_type' => 'nominal',
                    'discount_value' => 25000,
                    'min_purchase' => 70000,
                ],
            ],
        ];

        foreach ($activePartners as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['user_name'],
                    'password' => 'password',
                    'role' => User::ROLE_VENDOR,
                    'approval_status' => 'approved',
                    'phone' => $data['phone'],
                    'email_verified_at' => now(),
                ]
            );

            $partner = Partner::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $data['name'],
                    'slug' => Str::slug($data['name']) . '-' . $user->id,
                    'category' => $data['category'],
                    'description' => "Partner terpercaya komunitas KBKB di bidang {$data['category']}.",
                    'address' => $data['address'],
                    'phone' => $data['phone'],
                    'email' => $data['email'],
                    'status' => 'active',
                    'is_active' => true,
                    'expires_at' => now()->addMonths($data['months']),
                    'joined_at' => now()->subMonths(1),
                    'sort_number' => null,
                ]
            );

            // Buat promo aktif untuk partner
            Promo::updateOrCreate(
                [
                    'partner_id' => $partner->id,
                    'title' => $data['promo']['title'],
                ],
                [
                    'description' => 'Tunjukkan kartu digital member KBKB yang masih aktif di kasir.',
                    'discount_type' => $data['promo']['discount_type'],
                    'discount_value' => $data['promo']['discount_value'],
                    'min_purchase' => $data['promo']['min_purchase'],
                    'start_date' => now()->subDays(5)->toDateString(),
                    'end_date' => now()->addMonths(3)->toDateString(),
                    'terms' => 'Berlaku khusus untuk member aktif KBKB.',
                    'status' => 'approved',
                    'is_active' => true,
                    'submitted_at' => now()->subDays(5),
                    'reviewed_at' => now()->subDays(4),
                ]
            );
        }

        // ==========================================
        // 4. 3 PARTNER NON-AKTIF (Expired, Pending Approval, Rejected)
        // ==========================================
        $inactivePartners = [
            [
                'user_name' => 'PIC Boutique Cantika',
                'email' => 'partner.nonaktif1@kbkb.id',
                'name' => 'Boutique Cantika (Expired)',
                'category' => 'Fashion & Pakaian',
                'address' => 'Mall Taman Anggrek Lt. 2, Jakarta',
                'phone' => '081222220004',
                'user_status' => 'approved',
                'partner_status' => 'inactive',
                'is_active' => false,
                'expires_at' => now()->subDays(5),
            ],
            [
                'user_name' => 'PIC Warung Steak 88',
                'email' => 'partner.nonaktif2@kbkb.id',
                'name' => 'Warung Steak 88 (Menunggu Review)',
                'category' => 'F&B',
                'address' => 'Jl. Tebet Raya No. 40, Jakarta Selatan',
                'phone' => '081222220005',
                'user_status' => 'pending',
                'partner_status' => 'inactive',
                'is_active' => false,
                'expires_at' => null,
            ],
            [
                'user_name' => 'PIC Bengkel Maju Jaya',
                'email' => 'partner.nonaktif3@kbkb.id',
                'name' => 'Bengkel Maju Jaya (Ditolak)',
                'category' => 'Otomotif & Jasa',
                'address' => 'Jl. Raya Daan Mogot KM 12, Jakarta Barat',
                'phone' => '081222220006',
                'user_status' => 'rejected',
                'partner_status' => 'inactive',
                'is_active' => false,
                'expires_at' => null,
            ],
        ];

        foreach ($inactivePartners as $data) {
            $user = User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['user_name'],
                    'password' => 'password',
                    'role' => User::ROLE_VENDOR,
                    'approval_status' => $data['user_status'],
                    'phone' => $data['phone'],
                    'email_verified_at' => now(),
                ]
            );

            Partner::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $data['name'],
                    'slug' => Str::slug($data['name']) . '-' . $user->id,
                    'category' => $data['category'],
                    'description' => "Partner non-aktif ({$data['user_status']}).",
                    'address' => $data['address'],
                    'phone' => $data['phone'],
                    'email' => $data['email'],
                    'status' => $data['partner_status'],
                    'is_active' => $data['is_active'],
                    'expires_at' => $data['expires_at'],
                    'joined_at' => now()->subMonths(2),
                ]
            );
        }
    }
}
