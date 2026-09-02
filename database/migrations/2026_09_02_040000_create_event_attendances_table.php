<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('community_infos')->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('scanned_by_vendor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('scan_token', 16)->nullable()->index();
            $table->timestamp('scanned_at')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 512)->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'member_id'], 'event_member_unique');
        });
    }

    public function down(): void
    {
        Schema::table('event_attendances', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
            $table->dropForeign(['member_id']);
            $table->dropForeign(['scanned_by_vendor_id']);
        });

        Schema::drop('event_attendances');
    }
};