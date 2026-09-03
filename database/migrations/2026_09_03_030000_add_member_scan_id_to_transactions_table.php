<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            if (! Schema::hasColumn('transactions', 'member_scan_id')) {
                $table->unsignedBigInteger('member_scan_id')->nullable()->after('member_id');
            }

            $table->unique('member_scan_id');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropUnique(['member_scan_id']);
            $table->dropColumn('member_scan_id');
        });
    }
};
