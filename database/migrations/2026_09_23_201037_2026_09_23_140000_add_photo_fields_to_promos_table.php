<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('promos', function (Blueprint $table) {
            $table->string('logo')->nullable()->after('title');
            $table->string('promo_image')->nullable()->after('logo');
            $table->string('product_image')->nullable()->after('promo_image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('promos', function (Blueprint $table) {
            $table->dropColumn(['logo', 'promo_image', 'product_image']);
        });
    }
};
