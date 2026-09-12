<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $plans = [
            ['duration_months' => 1, 'name' => '1 Bulan (30 Hari)', 'price' => 100000],
            ['duration_months' => 3, 'name' => '3 Bulan (90 Hari)', 'price' => 300000],
            ['duration_months' => 6, 'name' => '6 Bulan (180 Hari)', 'price' => 600000],
            ['duration_months' => 12, 'name' => '12 Bulan (360 Hari)', 'price' => 1200000],
        ];

        foreach ($plans as $plan) {
            DB::table('membership_plans')
                ->where('duration_months', $plan['duration_months'])
                ->update([
                    'name' => $plan['name'],
                    'price' => $plan['price'],
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        // Non-destructive down
    }
};
