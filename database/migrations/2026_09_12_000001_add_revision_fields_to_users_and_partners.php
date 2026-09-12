<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'address')) {
                $table->text('address')->nullable()->after('city');
            }
            if (! Schema::hasColumn('users', 'approval_status')) {
                $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('approved')->after('role');
            }
            if (! Schema::hasColumn('users', 'must_change_password')) {
                $table->boolean('must_change_password')->default(false)->after('password');
            }
        });

        Schema::table('partners', function (Blueprint $table) {
            if (! Schema::hasColumn('partners', 'status')) {
                $table->enum('status', ['active', 'inactive'])->default('active')->after('is_active');
            }
            if (! Schema::hasColumn('partners', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['address', 'approval_status', 'must_change_password']);
        });

        Schema::table('partners', function (Blueprint $table) {
            $table->dropColumn(['status', 'expires_at']);
        });
    }
};
