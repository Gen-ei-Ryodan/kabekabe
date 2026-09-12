<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Modify gender and religion to string for maximum flexibility if not already
            if (Schema::hasColumn('users', 'gender')) {
                $table->string('gender', 50)->nullable()->change();
            }
            if (Schema::hasColumn('users', 'religion')) {
                $table->string('religion', 100)->nullable()->change();
            }

            if (! Schema::hasColumn('users', 'nickname')) {
                $table->string('nickname')->nullable()->after('name');
            }
            if (! Schema::hasColumn('users', 'birth_place')) {
                $table->string('birth_place')->nullable()->after('birth_date');
            }
            if (! Schema::hasColumn('users', 'hobbies')) {
                $table->json('hobbies')->nullable()->after('birth_place');
            }
            if (! Schema::hasColumn('users', 'marital_status')) {
                $table->string('marital_status')->nullable()->after('hobbies');
            }
            if (! Schema::hasColumn('users', 'place_of_worship_address')) {
                $table->text('place_of_worship_address')->nullable()->after('religion');
            }
            if (! Schema::hasColumn('users', 'district')) {
                $table->string('district')->nullable()->after('address');
            }
            if (! Schema::hasColumn('users', 'business_fields')) {
                $table->json('business_fields')->nullable()->after('company');
            }
            if (! Schema::hasColumn('users', 'business_address')) {
                $table->text('business_address')->nullable()->after('business_fields');
            }
            if (! Schema::hasColumn('users', 'business_district')) {
                $table->string('business_district')->nullable()->after('business_address');
            }
            if (! Schema::hasColumn('users', 'business_city')) {
                $table->string('business_city')->nullable()->after('business_district');
            }
            if (! Schema::hasColumn('users', 'industry')) {
                $table->string('industry')->nullable()->after('business_city');
            }
        });

        Schema::table('partners', function (Blueprint $table) {
            if (! Schema::hasColumn('partners', 'pic_name')) {
                $table->string('pic_name')->nullable()->after('name');
            }
            if (! Schema::hasColumn('partners', 'pic_phone')) {
                $table->string('pic_phone')->nullable()->after('pic_name');
            }
            if (! Schema::hasColumn('partners', 'district')) {
                $table->string('district')->nullable()->after('address');
            }
            if (! Schema::hasColumn('partners', 'city')) {
                $table->string('city')->nullable()->after('district');
            }
            if (! Schema::hasColumn('partners', 'industry')) {
                $table->string('industry')->nullable()->after('category');
            }
            if (! Schema::hasColumn('partners', 'joined_at')) {
                $table->timestamp('joined_at')->nullable()->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'nickname',
                'birth_place',
                'hobbies',
                'marital_status',
                'place_of_worship_address',
                'district',
                'business_fields',
                'business_address',
                'business_district',
                'business_city',
                'industry',
            ]);
        });

        Schema::table('partners', function (Blueprint $table) {
            $table->dropColumn([
                'pic_name',
                'pic_phone',
                'district',
                'city',
                'industry',
                'joined_at',
            ]);
        });
    }
};
