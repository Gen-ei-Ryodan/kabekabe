<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('otp_code', 6)->nullable()->after('password');
            $table->timestamp('otp_expires_at')->nullable()->after('otp_code');
            $table->string('otp_purpose', 30)->nullable()->after('otp_expires_at')->index();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['otp_purpose']);
            $table->dropColumn(['otp_code', 'otp_expires_at', 'otp_purpose']);
        });
    }
};
