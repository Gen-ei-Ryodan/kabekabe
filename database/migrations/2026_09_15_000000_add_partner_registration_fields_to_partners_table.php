<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            if (! Schema::hasColumn('partners', 'employee_count')) {
                $table->integer('employee_count')->nullable()->after('email');
            }
            if (! Schema::hasColumn('partners', 'established_since')) {
                $table->string('established_since')->nullable()->after('employee_count');
            }
            if (! Schema::hasColumn('partners', 'pic_name')) {
                $table->string('pic_name')->nullable()->after('established_since');
            }
            if (! Schema::hasColumn('partners', 'pic_phone')) {
                $table->string('pic_phone')->nullable()->after('pic_name');
            }
            if (! Schema::hasColumn('partners', 'is_member')) {
                $table->boolean('is_member')->default(false)->after('pic_phone');
            }
            if (! Schema::hasColumn('partners', 'member_code')) {
                $table->string('member_code')->nullable()->after('is_member');
            }
            if (! Schema::hasColumn('partners', 'industry')) {
                $table->string('industry')->nullable()->after('member_code');
            }
            if (! Schema::hasColumn('partners', 'hobbies')) {
                $table->text('hobbies')->nullable()->after('industry');
            }
            if (! Schema::hasColumn('partners', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('hobbies');
            }
        });
    }

    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->dropColumn([
                'employee_count',
                'established_since',
                'pic_name',
                'pic_phone',
                'is_member',
                'member_code',
                'industry',
                'hobbies',
                'date_of_birth',
            ]);
        });
    }
};
