<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $year = now()->format('y');
        $prefix = '7030' . $year;

        DB::transaction(function () use ($prefix) {
            $members = DB::table('users')
                ->where('role', 'member')
                ->orderBy('id')
                ->get(['id', 'member_code']);

            $next = $members
                ->pluck('member_code')
                ->filter(fn ($code) => is_string($code) && preg_match('/^' . $prefix . '\\d{4}$/', $code))
                ->map(fn (string $code) => (int) substr($code, -4))
                ->max() + 1;

            foreach ($members as $member) {
                if (! is_string($member->member_code) || ! str_starts_with($member->member_code, 'MMB-')) {
                    continue;
                }

                DB::table('users')
                    ->where('id', $member->id)
                    ->update(['member_code' => $prefix . str_pad((string) $next++, 4, '0', STR_PAD_LEFT)]);
            }
        });
    }

    public function down(): void
    {
        // Legacy member codes cannot be restored without a per-record mapping.
    }
};
