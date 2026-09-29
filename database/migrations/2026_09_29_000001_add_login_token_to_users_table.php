<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Token sesi per-login: device yang memegang token lama otomatis ter-kick.
            $table->string('login_token', 64)->nullable()->after('remember_token');
            $table->timestamp('last_login_at')->nullable()->after('login_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['login_token', 'last_login_at']);
        });
    }
};
