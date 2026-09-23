<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'is_household')) {
                $table->boolean('is_household')->default(false)->after('business_city');
            }

            if (! Schema::hasColumn('users', 'businesses')) {
                $table->json('businesses')->nullable()->after('is_household');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_household', 'businesses']);
        });
    }
};
