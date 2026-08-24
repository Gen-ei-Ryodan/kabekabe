<?php

namespace App\Services\Import;

use App\Models\User;
use App\Services\MembershipService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MemberImporter
{
    public function __construct(
        private readonly SpreadsheetRowReader $rows,
        private readonly MembershipService $memberships,
    ) {}

    /**
     * @return array{imported: int, failed: int, errors: list<string>}
     */
    public function import(User $admin, string $path): array
    {
        $result = ['imported' => 0, 'failed' => 0, 'errors' => []];

        foreach ($this->rows->rows($path) as $index => $row) {
            $line = $index + 2; // +1 header, +1 human numbering

            try {
                $this->importRow($row);
                $result['imported']++;
            } catch (\Throwable $e) {
                $result['failed']++;
                $identifier = $row['email'] ?? '?';
                $result['errors'][] = "Row {$line} ({$identifier}): ".$e->getMessage();
            }
        }

        unset($admin);

        return $result;
    }

    private function importRow(array $row): void
    {
        $name = trim((string) ($row['name'] ?? ''));
        $email = strtolower(trim((string) ($row['email'] ?? '')));

        if ($name === '' || $email === '') {
            throw new \InvalidArgumentException('Name and email are required.');
        }

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \InvalidArgumentException('Invalid email address.');
        }

        if (User::query()->where('email', $email)->exists()) {
            throw new \InvalidArgumentException('Email already registered.');
        }

        DB::transaction(function () use ($row, $name, $email): void {
            $member = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(trim((string) ($row['password'] ?? '')) ?: Str::password(12)),
                'role' => User::ROLE_MEMBER,
                'phone' => $row['phone'] ?? null,
                'whatsapp' => $row['whatsapp'] ?? null,
                'company' => $row['company'] ?? null,
            ]);

            $validUntil = trim((string) ($row['valid_until'] ?? ''));

            if ($validUntil !== '') {
                $expiresAt = \Illuminate\Support\Carbon::parse($validUntil);

                if ($expiresAt->isPast()) {
                    throw new \InvalidArgumentException("Valid until date ({$validUntil}) is in the past.");
                }

                $this->memberships->activateUntil($member, $expiresAt);
            }
        });
    }
}
