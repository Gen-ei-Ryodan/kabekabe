<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        for ($i = 1; $i <= 12; $i++) {
            $days = $i * 30;
            DB::table('membership_plans')->updateOrInsert(
                ['duration_months' => $i],
                [
                    'name' => "{$i} Bulan ({$days} Hari)",
                    'price' => $i * 100000,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        // Non-destructive down
    }
};
