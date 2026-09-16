<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Kolom tambahan pada partners
        Schema::table('partners', function (Blueprint $table) {
            if (! Schema::hasColumn('partners', 'trade_name')) {
                $table->string('trade_name')->nullable()->after('name');
            }
            if (! Schema::hasColumn('partners', 'employee_count')) {
                $table->unsignedInteger('employee_count')->nullable()->after('address');
            }
            if (! Schema::hasColumn('partners', 'established_since')) {
                $table->string('established_since', 50)->nullable()->after('employee_count');
            }
            if (! Schema::hasColumn('partners', 'is_member')) {
                $table->boolean('is_member')->default(false)->after('established_since');
            }
            if (! Schema::hasColumn('partners', 'member_id_number')) {
                $table->string('member_id_number', 100)->nullable()->after('is_member');
            }
            if (! Schema::hasColumn('partners', 'member_name')) {
                $table->string('member_name')->nullable()->after('member_id_number');
            }
            if (! Schema::hasColumn('partners', 'member_birth_date')) {
                $table->date('member_birth_date')->nullable()->after('member_name');
            }
        });

        // 2. Kolom promo_title pada home_banners dan home_popups
        Schema::table('home_banners', function (Blueprint $table) {
            if (! Schema::hasColumn('home_banners', 'promo_title')) {
                $table->string('promo_title')->nullable()->after('image_path');
            }
        });

        Schema::table('home_popups', function (Blueprint $table) {
            if (! Schema::hasColumn('home_popups', 'promo_title')) {
                $table->string('promo_title')->nullable()->after('image_path');
            }
        });

        // 3. Discount type promos mendukung free_item
        Schema::table('promos', function (Blueprint $table) {
            $table->string('discount_type', 30)->default('percent')->change();
        });

        // 4. Tabel pengajuan iklan partner (partner_ads)
        if (! Schema::hasTable('partner_ads')) {
            Schema::create('partner_ads', function (Blueprint $table) {
                $table->id();
                $table->foreignId('partner_id')->constrained('partners')->cascadeOnDelete();
                $table->foreignId('promo_id')->nullable()->constrained('promos')->nullOnDelete();
                $table->string('type', 30); // popup (3 days), banner (5 days)
                $table->string('promo_title')->nullable();
                $table->string('image_path')->nullable();
                $table->date('start_date');
                $table->date('end_date');
                $table->unsignedBigInteger('price')->default(0);
                $table->string('status', 30)->default('pending'); // pending, approved, rejected, paid, active, completed
                $table->text('notes')->nullable();
                $table->text('admin_feedback')->nullable();
                $table->timestamp('approved_at')->nullable();
                $table->timestamp('paid_at')->nullable();
                $table->timestamps();
            });
        }

        // 5. Tabel kode diskon membership (membership_discount_codes)
        if (! Schema::hasTable('membership_discount_codes')) {
            Schema::create('membership_discount_codes', function (Blueprint $table) {
                $table->id();
                $table->string('code', 50)->unique();
                $table->string('name')->nullable();
                $table->string('discount_type', 20)->default('percent'); // percent, nominal
                $table->unsignedInteger('discount_value')->default(0); // 100 untuk free, 50 untuk 50%
                $table->boolean('is_active')->default(true);
                $table->unsignedInteger('max_uses')->nullable();
                $table->unsignedInteger('used_count')->default(0);
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });

            // Seed default discount codes
            if (! app()->runningUnitTests()) {
                DB::table('membership_discount_codes')->insert([
                    [
                        'code' => 'KBKBFREE',
                        'name' => 'Membership Gratis 100%',
                        'discount_type' => 'percent',
                        'discount_value' => 100,
                        'is_active' => true,
                        'max_uses' => null,
                        'used_count' => 0,
                        'expires_at' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                    [
                        'code' => 'KBKB50',
                        'name' => 'Diskon Membership 50%',
                        'discount_type' => 'percent',
                        'discount_value' => 50,
                        'is_active' => true,
                        'max_uses' => null,
                        'used_count' => 0,
                        'expires_at' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ],
                ]);
            }
        }

        // 6. Update Membership Plans untuk periode promo Okt - Nov 2026
        // Daftar paket: 1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15 bulan
        if (! app()->runningUnitTests()) {
            $promoPlans = [
                1  => ['price' => 100000,  'days' => 30],
                2  => ['price' => 200000,  'days' => 60],
                3  => ['price' => 300000,  'days' => 90],
                5  => ['price' => 400000,  'days' => 150], // Hemat Rp100.000
                6  => ['price' => 500000,  'days' => 180],
                7  => ['price' => 600000,  'days' => 210],
                8  => ['price' => 700000,  'days' => 240],
                10 => ['price' => 800000,  'days' => 300], // Hemat Rp200.000
                11 => ['price' => 900000,  'days' => 330],
                12 => ['price' => 1000000, 'days' => 360], // Hemat Rp200.000
                13 => ['price' => 1100000, 'days' => 390],
                15 => ['price' => 1200000, 'days' => 450], // Hemat Rp300.000
            ];

            // Nonaktifkan plan durasi di luar daftar (misal bulan 4, 9, 14 jika ada)
            DB::table('membership_plans')
                ->whereNotIn('duration_months', array_keys($promoPlans))
                ->update(['is_active' => false]);

            foreach ($promoPlans as $months => $info) {
                DB::table('membership_plans')->updateOrInsert(
                    ['duration_months' => $months],
                    [
                        'name' => "{$months} Bulan ({$info['days']} Hari)",
                        'price' => $info['price'],
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }
    }

    public function down(): void
    {
        // Safe rollback
        Schema::dropIfExists('partner_ads');
        Schema::dropIfExists('membership_discount_codes');
    }
};
