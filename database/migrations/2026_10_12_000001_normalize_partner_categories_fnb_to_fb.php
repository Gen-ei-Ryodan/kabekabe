<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            DB::statement("UPDATE partners SET category = 'F&B' WHERE category = 'FNB'");
        });
    }

    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            DB::statement("UPDATE partners SET category = 'FNB' WHERE category = 'F&B'");
        });
    }
};