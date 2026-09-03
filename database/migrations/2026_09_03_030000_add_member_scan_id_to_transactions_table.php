<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('member_scan_id')->nullable()->after('member_id')->constrained('member_scans')->nullOnDelete();
            $table->unique('member_scan_id');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropUnique(['member_scan_id']);
            $table->dropForeign(['member_scan_id']);
            $table->dropColumn('member_scan_id');
        });
    }
};
