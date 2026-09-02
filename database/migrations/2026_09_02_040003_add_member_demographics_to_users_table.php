<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('gender', ['male', 'female', 'other'])->nullable()->after('name');
            $table->enum('religion', ['islam', 'kristen', 'katolik', 'buddha', 'hindu', 'lainnya'])->nullable()->after('gender');
            $table->date('birth_date')->nullable()->after('religion');
            $table->string('city')->nullable()->after('birth_date');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['gender', 'religion', 'birth_date', 'city']);
        });
    }
};