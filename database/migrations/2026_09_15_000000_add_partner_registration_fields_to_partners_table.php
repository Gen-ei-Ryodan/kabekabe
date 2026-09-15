<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->integer('employee_count')->nullable()->after('email');
            $table->string('established_since')->nullable()->after('employee_count');
            $table->string('pic_name')->nullable()->after('established_since');
            $table->string('pic_phone')->nullable()->after('pic_name');
            $table->boolean('is_member')->default(false)->after('pic_phone');
            $table->string('member_code')->nullable()->after('is_member');
            $table->string('industry')->nullable()->after('member_code');
            $table->text('hobbies')->nullable()->after('industry');
            $table->date('date_of_birth')->nullable()->after('hobbies');
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
