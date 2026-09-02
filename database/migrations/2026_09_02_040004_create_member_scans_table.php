<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('scanned_by_vendor_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('scanned_at');
            $table->timestamp('expires_at');
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['member_id', 'scanned_by_vendor_id', 'expires_at']);
        });
    }

    public function down(): void
    {
        Schema::table('member_scans', function (Blueprint $table) {
            $table->dropForeign(['member_id']);
            $table->dropForeign(['scanned_by_vendor_id']);
        });

        Schema::drop('member_scans');
    }
};