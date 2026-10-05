<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1 master identity bisa menaungi akun member dan/atau partner.
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('master_identity_id')
                ->nullable()
                ->after('card_token')
                ->constrained('master_identities')
                ->nullOnDelete();
        });

        Schema::table('partners', function (Blueprint $table) {
            $table->foreignId('master_identity_id')
                ->nullable()
                ->after('member_user_id')
                ->constrained('master_identities')
                ->nullOnDelete();
        });

        // Email member & partner boleh sama (portal/guard terpisah),
        // tapi unik di dalam role yang sama.
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique('users_email_unique');
            $table->unique(['email', 'role']);
        });

        // Setiap partner wajib unik emailnya (duplikat lama dikosongkan dulu).
        $seen = [];
        DB::table('partners')->whereNotNull('email')->orderBy('id')->select('id', 'email')->get()
            ->each(function ($row) use (&$seen) {
                if (isset($seen[$row->email])) {
                    DB::table('partners')->where('id', $row->id)->update(['email' => null]);
                } else {
                    $seen[$row->email] = true;
                }
            });

        Schema::table('partners', function (Blueprint $table) {
            $table->unique('email');
        });

        // Riwayat pembayaran manual admin: metode bayar.
        Schema::table('payments', function (Blueprint $table) {
            $table->string('method', 50)->nullable()->after('paid_at');
            $table->foreignId('plan_id')->nullable()->change();
        });

        $this->backfillIdentities();
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['method']);
        });

        Schema::table('partners', function (Blueprint $table) {
            $table->dropUnique(['email']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['email', 'role']);
            $table->unique('email');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('master_identity_id');
        });

        Schema::table('partners', function (Blueprint $table) {
            $table->dropConstrainedForeignId('master_identity_id');
        });
    }

    /**
     * Isi identity lama dari profil user yang sudah ada (sekali jalan).
     */
    private function backfillIdentities(): void
    {
        DB::table('users')->whereNull('master_identity_id')->orderBy('id')->chunkById(200, function ($users) {
            foreach ($users as $user) {
                $identityId = DB::table('master_identities')->insertGetId([
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'whatsapp' => $user->whatsapp,
                    'birth_date' => $user->birth_date,
                    'birth_place' => $user->birth_place,
                    'gender' => $user->gender,
                    'religion' => $user->religion,
                    'marital_status' => $user->marital_status,
                    'address' => $user->address,
                    'city' => $user->city,
                    'district' => $user->district,
                    'hobbies' => $user->hobbies,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('users')->where('id', $user->id)->update(['master_identity_id' => $identityId]);

                DB::table('partners')->where('user_id', $user->id)->update(['master_identity_id' => $identityId]);
            }
        });
    }
};
