<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            if (! Schema::hasColumn('partners', 'pic_email')) {
                $table->string('pic_email', 255)->nullable()->after('pic_phone');
            }

            if (! Schema::hasColumn('partners', 'pic_whatsapp')) {
                $table->string('pic_whatsapp', 30)->nullable()->after('pic_email');
            }
        });
    }

    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            if (Schema::hasColumn('partners', 'pic_whatsapp')) {
                $table->dropColumn('pic_whatsapp');
            }

            if (Schema::hasColumn('partners', 'pic_email')) {
                $table->dropColumn('pic_email');
            }
        });
    }
};
