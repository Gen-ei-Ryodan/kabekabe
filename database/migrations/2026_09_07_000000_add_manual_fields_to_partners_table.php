<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->string('total_belanja')->nullable()->after('is_active');
            $table->string('diskon1')->nullable()->after('total_belanja');
            $table->string('diskon2')->nullable()->after('diskon1');
            $table->string('diskon3')->nullable()->after('diskon2');
        });
    }

    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->dropColumn(['total_belanja', 'diskon1', 'diskon2', 'diskon3']);
        });
    }
};
