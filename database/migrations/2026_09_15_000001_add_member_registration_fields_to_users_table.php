<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('company');
            }
            if (! Schema::hasColumn('users', 'industry')) {
                $table->string('industry')->nullable()->after('date_of_birth');
            }
            if (! Schema::hasColumn('users', 'hobbies')) {
                $table->text('hobbies')->nullable()->after('industry');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['date_of_birth', 'industry', 'hobbies']);
        });
    }
};
