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
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'avatar_changes_count')) {
                $table->unsignedSmallInteger('avatar_changes_count')->default(0)->after('avatar');
            }
        });

        \Illuminate\Support\Facades\DB::table('users')
            ->whereNotNull('avatar')
            ->where('avatar', '!=', '')
            ->update(['avatar_changes_count' => 1]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'avatar_changes_count')) {
                $table->dropColumn('avatar_changes_count');
            }
        });
    }
};
