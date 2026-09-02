<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promos', function (Blueprint $table) {
            $table->unsignedInteger('sort_number')->nullable()->after('is_active');
        });

        Schema::table('partners', function (Blueprint $table) {
            $table->unsignedInteger('sort_number')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('promos', function (Blueprint $table) {
            $table->dropColumn('sort_number');
        });

        Schema::table('partners', function (Blueprint $table) {
            $table->dropColumn('sort_number');
        });
    }
};