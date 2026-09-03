<?php

namespace Database\Seeders;

use App\Models\AppNotification;
use App\Models\CommunityInfo;
use App\Models\HomeBanner;
use App\Models\HomePopup;
use App\Models\MembershipPlan;
use App\Models\Partner;
use App\Models\Payment;
use App\Models\Promo;
use App\Models\Transaction;
use App\Models\User;
use App\Services\MembershipService;
use App\Services\PaymentService;
use App\Services\PromoService;
use App\Services\TransactionService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $membershipService = app(MembershipService::class);
        $paymentService = app(PaymentService::class);
        $promoService = app(PromoService::class);
        $transactionService = app(TransactionService::class);

        // ---------- Admin ----------
        $admin = User::create([
            'name' => 'Admin Sentra',
            'email' => 'admin@sentra.test',
            'password' => 'password',
            'role' => User::ROLE_ADMIN,
        ]);

        // ---------- Membership Plans ----------
        $plans = collect([
            ['name' => '1 Bulan', 'duration_months' => 1, 'price' => 150000],
            ['name' => '3 Bulan', 'duration_months' => 3, 'price' => 400000],
            ['name' => '6 Bulan', 'duration_months' => 6, 'price' => 750000],
            ['name' => '12 Bulan', 'duration_months' => 12, 'price' => 1350000],
        ])->map(fn ($p) => MembershipPlan::create($p));

        // ---------- Partners & Vendors ----------
        $partnerData = [
            ['KFC', 'FNB', 'Ayam goreng renyah favorit semua. Diskon khusus untuk member komunitas.', 'Jl. Sudirman No. 45, Jakarta', 'KFC', 'kfc@sentra.test'],
            ['Gramedia', 'Retail', 'Toko buku dan alat tulis terlengkap.', 'Jl. Thamrin No. 12, Jakarta', 'Gramedia', 'gramedia@sentra.test'],
            ['Rudy Hadisuwarno', 'Salon', 'Salon premium untuk perawatan rambut dan wajah.', 'Jl. Gatot Subroto No. 78, Jakarta', 'Rudy Salon', 'rudy@sentra.test'],
            ['Transmart', 'Retail', 'Supermarket kebutuhan sehari-hari.', 'Jl. Rasuna Said No. 33, Jakarta', 'Transmart', 'transmart@sentra.test'],
            ['GymFit', 'Olahraga', 'Pusat kebugaran dan gym modern.', 'Jl. Kemang Raya No. 5, Jakarta', 'GymFit', 'gymfit@sentra.test'],
        ];

        $partners = collect($partnerData)->map(function ($data) use ($admin) {
            [$name, $category, $desc, $address, $vendorName, $vendorEmail] = $data;

            $vendor = User::create([
                'name' => $vendorName,
                'email' => $vendorEmail,
                'password' => 'password',
                'role' => User::ROLE_VENDOR,
            ]);

            return Partner::create([
                'user_id' => $vendor->id,
                'name' => $name,
                'slug' => Str::slug($name) . '-' . Str::lower(Str::random(4)),
                'category' => $category,
                'description' => $desc,
                'address' => $address,
                'phone' => '+62 21 ' . random_int(100000, 999999),
                'email' => 'contact@' . Str::slug($name) . '.test',
                'is_active' => true,
            ]);
        });

        $kfc = $partners->first(fn ($p) => $p->name === 'KFC');

        // ---------- Promos ----------
        $promos = collect([
            [
                'partner' => $kfc,
                'title' => 'Diskon 10% Min. Belanja Rp1.000.000',
                'description' => 'Nikmati diskon 10% untuk pembelian minimal Rp1.000.000 di KFC.',
                'type' => Promo::TYPE_PERCENT,
                'value' => 10,
                'min' => 1000000,
                'start' => now()->startOfMonth(),
                'end' => now()->endOfMonth(),
                'status' => Promo::STATUS_APPROVED,
            ],
            [
                'partner' => $partners->first(fn ($p) => $p->name === 'Gramedia'),
                'title' => 'Diskon 15% Buku Terpilih',
                'description' => 'Diskon 15% untuk semua buku terpilih di Gramedia.',
                'type' => Promo::TYPE_PERCENT,
                'value' => 15,
                'min' => 0,
                'start' => now()->subDay(),
                'end' => now()->addWeeks(2),
                'status' => Promo::STATUS_APPROVED,
            ],
            [
                'partner' => $partners->first(fn ($p) => $p->name === 'Rudy Hadisuwarno'),
                'title' => 'Potongan Rp100.000 Paket Hair Treatment',
                'description' => 'Potongan Rp100.000 untuk paket hair treatment.',
                'type' => Promo::TYPE_NOMINAL,
                'value' => 100000,
                'min' => 300000,
                'start' => now()->startOfMonth(),
                'end' => now()->addMonth(),
                'status' => Promo::STATUS_APPROVED,
            ],
            [
                'partner' => $partners->first(fn ($p) => $p->name === 'GymFit'),
                'title' => 'Diskon 20% Membership Bulanan',
                'description' => 'Diskon 20% untuk membership bulanan GymFit.',
                'type' => Promo::TYPE_PERCENT,
                'value' => 20,
                'min' => 0,
                'start' => now()->subDay(),
                'end' => now()->addDays(20),
                'status' => Promo::STATUS_APPROVED,
            ],
            [
                'partner' => $kfc,
                'title' => 'Paket Kombo Hemat Weekend',
                'description' => 'Paket kombo hemat khusus akhir pekan.',
                'type' => Promo::TYPE_PERCENT,
                'value' => 5,
                'min' => 200000,
                'start' => now()->addDay(),
                'end' => now()->addWeek(),
                'status' => Promo::STATUS_PENDING,
            ],
        ]);

        foreach ($promos as $promo) {
            Promo::create([
                'partner_id' => $promo['partner']->id,
                'title' => $promo['title'],
                'description' => $promo['description'],
                'discount_type' => $promo['type'],
                'discount_value' => $promo['value'],
                'min_purchase' => $promo['min'],
                'start_date' => $promo['start']->toDateString(),
                'end_date' => $promo['end']->toDateString(),
                'terms' => 'Berlaku untuk member dengan status ACTIVE. Tidak dapat digabung dengan promo lain.',
                'status' => $promo['status'],
                'is_active' => true,
                'submitted_at' => now()->subDays(2),
                'reviewed_at' => $promo['status'] === Promo::STATUS_PENDING ? null : now()->subDays(1),
                'reviewed_by' => $promo['status'] === Promo::STATUS_PENDING ? null : $admin->id,
            ]);
        }

        // ---------- Members ----------
        $memberA = User::create([
            'name' => 'Budi Santoso',
            'email' => 'member@sentra.test',
            'password' => 'password',
            'role' => User::ROLE_MEMBER,
            'phone' => '+62 812 3456 7890',
            'whatsapp' => '+62 812 3456 7890',
            'company' => 'PT Nusantara Sejahtera',
        ]);
        $membershipService->activate($memberA, 12);

        $memberB = User::create([
            'name' => 'Sari Wulandari',
            'email' => 'sari@sentra.test',
            'password' => 'password',
            'role' => User::ROLE_MEMBER,
            'phone' => '+62 813 2222 1111',
            'whatsapp' => '+62 813 2222 1111',
            'company' => 'CV Karya Mandiri',
        ]);
        $membershipService->activate($memberB, 3);

        $memberC = User::create([
            'name' => 'Agus Pratama',
            'email' => 'agus@sentra.test',
            'password' => 'password',
            'role' => User::ROLE_MEMBER,
            'phone' => '+62 821 9090 8080',
            'whatsapp' => '+62 821 9090 8080',
            'company' => 'PT Maju Bersama',
        ]);
        // inactive member - expired membership
        $membershipService->ensureMembership($memberC);
        $memberC->membership()->update(['status' => 'inactive', 'expires_at' => now()->subDay()]);

        $members = collect([$memberA, $memberB, $memberC]);

        foreach (range(1, 22) as $i) {
            $m = User::create([
                'name' => fake()->name(),
                'email' => 'member' . $i . '@sentra.test',
                'password' => 'password',
                'role' => User::ROLE_MEMBER,
                'phone' => fake()->phoneNumber(),
                'whatsapp' => fake()->phoneNumber(),
                'company' => fake()->company(),
            ]);

            if ($i % 4 !== 0) {
                $membershipService->activate($m, random_int(1, 12));
            }

            $members->push($m);
        }

        // ---------- Payments ----------
        $payment = $paymentService->createPending($memberA, $plans->first(fn ($p) => $p->duration_months === 3));
        $payment->update(['proof_path' => 'payment-proofs/demo.png']);

        // ---------- Transactions ----------
        $approvedPromos = Promo::query()->where('status', Promo::STATUS_APPROVED)->get();

        $demoTransactions = [
            [$memberA, $kfc, 1000000, 10, 'Belanja makan siang team'],
            [$memberA, $partners->first(fn ($p) => $p->name === 'Gramedia'), 350000, 15, 'Beli buku referensi'],
            [$memberB, $kfc, 1200000, 10, 'Order perusahaan'],
            [$memberB, $partners->first(fn ($p) => $p->name === 'Rudy Hadisuwarno'), 500000, 100000, 'Hair treatment bulanan'],
            [$memberC, $partners->first(fn ($p) => $p->name === 'GymFit'), 450000, 20, 'Membership gym'],
        ];

        foreach ($demoTransactions as [$member, $partner, $total, $discountValue, $note]) {
            if (! $member->hasActiveMembership()) {
                continue;
            }

            $promo = $approvedPromos->first(fn ($p) => $p->partner_id === $partner->id);

            $transactionService->record(
                $partner,
                $member,
                $promo,
                $total,
                $note,
            );
        }

        // Backdate a couple of transactions for reporting
        Transaction::where('partner_id', $kfc->id)->first()?->update([
            'transacted_at' => now()->subDays(3),
        ]);

        // ---------- Community Infos ----------
        CommunityInfo::create([
            'type' => CommunityInfo::TYPE_EVENT,
            'title' => 'Sentra Community Gathering 2026',
            'content' => 'Acara tahunan komunitas untuk mempererat kebersamaan antar member. Hadirkan sesi networking, workshop, dan hiburan.',
            'event_date' => now()->addDays(14)->setHour(13),
            'location' => 'Ballroom Hotel Mulia, Jakarta',
            'fee' => 150000,
            'is_published' => true,
            'published_at' => now()->subWeek(),
            'created_by' => $admin->id,
        ]);

        CommunityInfo::create([
            'type' => CommunityInfo::TYPE_AGENDA,
            'title' => 'Jadwal Gathering Bulan Ini',
            'content' => 'Rangkaian agenda gathering bulan ini: pembagian goodie bag, sesi sharing session, dan city tour.',
            'event_date' => now()->addDays(7)->setHour(9),
            'location' => 'Area Monas, Jakarta',
            'fee' => 50000,
            'is_published' => true,
            'published_at' => now()->subDay(),
            'created_by' => $admin->id,
        ]);

        // ---------- Home Banners ----------
        $bannerPromos = Promo::query()
            ->where('status', Promo::STATUS_APPROVED)
            ->where('is_active', true)
            ->where('start_date', '<=', now()->toDateString())
            ->where('end_date', '>=', now()->toDateString())
            ->orderBy('id')
            ->limit(2)
            ->get();

        $agendaInfo = CommunityInfo::query()
            ->where('type', CommunityInfo::TYPE_AGENDA)
            ->published()
            ->first();

        $bannerSeeds = [
            ['type' => HomeBanner::TYPE_PROMO, 'promo_id' => $bannerPromos->get(0)?->id, 'agenda_id' => null, 'sort_order' => 1],
            ['type' => HomeBanner::TYPE_PROMO, 'promo_id' => $bannerPromos->get(1)?->id, 'agenda_id' => null, 'sort_order' => 2],
            ['type' => HomeBanner::TYPE_AGENDA, 'promo_id' => null, 'agenda_id' => $agendaInfo?->id, 'sort_order' => 3],
        ];

        foreach ($bannerSeeds as $seed) {
            if ($seed['promo_id'] === null && $seed['agenda_id'] === null) {
                continue;
            }

            HomeBanner::firstOrCreate(
                ['sort_order' => $seed['sort_order']],
                array_merge($seed, ['is_active' => true]),
            );
        }

        if ($bannerPromos->first()) {
            HomePopup::firstOrCreate([], [
                'promo_id' => $bannerPromos->first()->id,
                'is_active' => true,
            ]);
        }

        // ---------- Notifications ----------
        $this->seedNotifications($memberA, $memberB, $memberC);
    }

    private function seedNotifications(User ...$members): void
    {
        $templates = [
            ['title' => 'Selamat Datang di Sentra', 'body' => 'Kartu digital kamu sudah aktif. Tunjukkan kartu saat bertransaksi di partner untuk menikmati benefit.', 'type' => 'system', 'days' => 20, 'action_url' => '/member/home'],
            ['title' => 'Membership Diperpanjang', 'body' => 'Membership kamu berhasil diperpanjang. Terima kasih sudah menjadi bagian dari komunitas.', 'type' => 'membership', 'days' => 15, 'action_url' => '/member/history'],
            ['title' => 'Promo Baru Tersedia', 'body' => 'KFC memberikan diskon 10% untuk pembelian minimal Rp1.000.000. Buruan manfaatkan!', 'type' => 'promo', 'days' => 10, 'action_url' => '/member/partners?tab=promos'],
            ['title' => 'Info Kegiatan Komunitas', 'body' => 'Jangan lewatkan Sentra Community Gathering 2026 yang akan datang.', 'type' => 'community', 'days' => 5, 'action_url' => '/member/home'],
            ['title' => 'Promo Akan Berakhir', 'body' => 'Promo diskon 10% KFC akan berakhir dalam 3 hari.', 'type' => 'promo', 'days' => 1, 'action_url' => '/member/partners?tab=promos'],
        ];

        foreach ($members as $member) {
            foreach ($templates as $tpl) {
                AppNotification::create([
                    'user_id' => $member->id,
                    'title' => $tpl['title'],
                    'body' => $tpl['body'],
                    'type' => $tpl['type'],
                    'action_url' => $tpl['action_url'] ?? null,
                    'read_at' => rand(0, 1) === 1 ? now()->subDays($tpl['days'] - 1) : null,
                    'created_at' => now()->subDays($tpl['days']),
                    'updated_at' => now()->subDays($tpl['days']),
                ]);
            }
        }
    }
}
