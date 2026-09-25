<?php

namespace App\Console\Commands;

use App\Models\Membership;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ImportMembersCsvCommand extends Command
{
    protected $signature = 'members:import-csv {--file=database/data/members_import_20260925.csv}';

    protected $description = 'Import member dari CSV: biodata, kode member 7030YYMMNNN, dan membership';

    private const COL = [
        'join' => 1,
        'email' => 2,
        'name' => 3,
        'nickname' => 4,
        'gender' => 5,
        'birth_date' => 6,
        'birth_place' => 7,
        'marital' => 9,
        'worship' => 10,
        'religion' => 11,
        'whatsapp' => 12,
        'address' => 14,
        'district' => 15,
        'company' => 16,
        'business' => 18,
        'hobbies' => 19,
        'status' => 20,
        'valid' => 21,
    ];

    /** Akun yang password hash-nya wajib dipertahankan apa adanya. */
    private const PROTECTED_EMAILS = [
        'ray.komputerku@gmail.com',
        'paulinerenny@gmail.com',
        'tasyaw168@gmail.com',
        'love_shally@yahoo.com',
        'jurgen@dutaintika.com',
        'lusicici73@gmail.com',
        'remedy.san@gmail.com',
        'cbr1@hotmail.com',
        'ersad.ery@gmail.com',
        'sinar168@gmail.com',
        'stedja85@gmail.com',
        'smame07@hotmail.com',
        'marina@solidds.com',
        'frankywibisono888@gmail.com',
        'bunardi_denny@yahoo.com',
    ];

    private array $monthMap = [
        'jan' => '01', 'peb' => '02', 'feb' => '02', 'mar' => '03', 'apr' => '04',
        'mei' => '05', 'may' => '05', 'jun' => '06', 'jul' => '07', 'agu' => '08',
        'agus' => '08', 'agt' => '08', 'aug' => '08', 'sep' => '09', 'okt' => '10',
        'oct' => '10', 'nop' => '11', 'nov' => '11', 'des' => '12', 'dec' => '12',
    ];

    /** @var array<string, int> Nomor urut (NNN) per bulan join pada run ini. */
    private array $sequence = [];

    /** @var array<string, true> Email yang member_code-nya sudah ditentukan pada run ini. */
    private array $assigned = [];

    public function handle(): int
    {
        $file = (string) $this->option('file');
        $path = str_starts_with($file, DIRECTORY_SEPARATOR) ? $file : base_path($file);

        if (! is_file($path)) {
            $this->error("File tidak ditemukan di: {$path}");

            return self::FAILURE;
        }

        $handle = fopen($path, 'r');
        if (! $handle) {
            $this->error("Gagal membuka file: {$path}");

            return self::FAILURE;
        }

        fgetcsv($handle, null, ',', '"', '');

        $created = 0;
        $updated = 0;
        $rows = 0;
        $protected = 0;
        $keptPassword = 0;

        DB::beginTransaction();

        try {
            while (($row = fgetcsv($handle, null, ',', '"', '')) !== false) {
                $email = Str::lower($this->cell($row, self::COL['email']));
                $name = $this->cell($row, self::COL['name']);

                if ($email === '' || $name === '') {
                    continue;
                }

                $rows++;
                $joinDate = $this->parseJoinDate($this->cell($row, self::COL['join']));
                $isProtected = in_array($email, self::PROTECTED_EMAILS, true);
                $user = User::where('email', $email)->first();
                $isNew = $user === null;
                $oldPassword = null;

                if ($isNew) {
                    $user = new User($this->biodata($row) + [
                        'email' => $email,
                        'password' => Hash::make('password'),
                        'role' => User::ROLE_MEMBER,
                        'approval_status' => User::APPROVAL_APPROVED,
                        'must_change_password' => true,
                    ]);
                } else {
                    $oldPassword = $isProtected
                        ? (string) DB::table('users')->where('id', $user->id)->value('password')
                        : null;
                    $user->fill(array_filter($this->biodata($row), fn ($v) => $v !== null && $v !== '' && $v !== []));
                }

                if (! isset($this->assigned[$email])) {
                    $user->member_code = $this->nextMemberCode($joinDate, $isNew ? null : $user->id);
                    $this->assigned[$email] = true;
                }

                $user->save();

                if ($isNew) {
                    $created++;
                } else {
                    $updated++;
                }

                if ($oldPassword !== null) {
                    // Restore eksplisit: hash akun proteksi tidak boleh berubah jadi 'password'.
                    DB::table('users')->where('id', $user->id)->update(['password' => $oldPassword]);
                    $keptPassword++;
                }

                if ($isProtected) {
                    $protected++;
                }

                $this->syncMembership($user, $row, $joinDate);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            fclose($handle);
            $this->error('Import gagal: '.$e->getMessage());
            $this->error($e->getTraceAsString());

            return self::FAILURE;
        }

        fclose($handle);

        $this->info('Import selesai.');
        $this->table(['Metric', 'Total'], [
            ['Baris diproses', $rows],
            ['Member baru', $created],
            ['Member diperbarui', $updated],
            ['Email proteksi khusus ditemukan', $protected],
            ['Password hash dipertahankan', $keptPassword],
        ]);

        return self::SUCCESS;
    }

    private function biodata(array $row): array
    {
        return [
            'name' => Str::limit($this->cell($row, self::COL['name']), 255, ''),
            'nickname' => $this->str($row, self::COL['nickname'], 100),
            'gender' => $this->str($row, self::COL['gender'], 50),
            'birth_date' => $this->parseBirthDate($this->cell($row, self::COL['birth_date'])),
            'birth_place' => $this->str($row, self::COL['birth_place'], 100),
            'marital_status' => $this->str($row, self::COL['marital'], 50),
            'place_of_worship_address' => $this->str($row, self::COL['worship'], 255),
            'religion' => $this->str($row, self::COL['religion'], 100),
            'phone' => $this->str($row, self::COL['whatsapp'], 30),
            'whatsapp' => $this->str($row, self::COL['whatsapp'], 30),
            'address' => $this->str($row, self::COL['address']),
            'district' => $this->str($row, self::COL['district'], 100),
            'company' => $this->str($row, self::COL['company']),
            'business_fields' => $this->parseArrayField($this->cell($row, self::COL['business'])),
            'hobbies' => $this->parseArrayField($this->cell($row, self::COL['hobbies'])),
        ];
    }

    private function syncMembership(User $user, array $row, Carbon $joinDate): void
    {
        $membership = Membership::firstOrNew(['member_id' => $user->id]);
        $membership->status = Str::lower($this->cell($row, self::COL['status'])) === 'aktif'
            ? Membership::STATUS_ACTIVE
            : Membership::STATUS_INACTIVE;
        $membership->expires_at = $this->parseDate($this->cell($row, self::COL['valid']));
        $membership->started_at ??= $joinDate;
        $membership->save();
    }

    /**
     * Kode '7030'.YY.MM.NNN, NNN di-reset tiap bulan/tahun join, dijamin unik antar user.
     */
    private function nextMemberCode(Carbon $joinDate, ?int $userId): string
    {
        // ponytail: NNN 3 digit -> >999 join per bulan bikin kode 12 digit; naik ke 4 digit bila pernah terjadi.
        $ym = $joinDate->format('ym');
        $n = $this->sequence[$ym] ?? 0;

        do {
            $n++;
            $code = '7030'.$ym.str_pad((string) $n, 3, '0', STR_PAD_LEFT);
            $taken = DB::table('users')
                ->where('member_code', $code)
                ->when($userId !== null, fn ($q) => $q->where('id', '!=', $userId))
                ->exists();
        } while ($taken);

        $this->sequence[$ym] = $n;

        return $code;
    }

    private function parseJoinDate(string $raw): Carbon
    {
        $raw = trim($raw);

        foreach (['n/j/Y G:i:s', 'n/j/Y H:i:s', 'n/j/Y'] as $format) {
            try {
                return Carbon::createFromFormat('!'.$format, $raw);
            } catch (\Throwable) {
                // coba format berikutnya
            }
        }

        return now();
    }

    private function parseDate(string $raw): ?Carbon
    {
        $parts = array_map('trim', explode('/', $raw));

        if (count($parts) !== 3 || ! ctype_digit($parts[0]) || ! ctype_digit($parts[1]) || ! ctype_digit($parts[2])) {
            return null;
        }

        $year = strlen($parts[2]) === 2 ? '20'.$parts[2] : $parts[2];

        try {
            return Carbon::createFromFormat('!m/d/Y', sprintf('%02d/%02d/%04d', $parts[0], $parts[1], $year));
        } catch (\Throwable) {
            return null;
        }
    }

    private function parseBirthDate(string $raw): ?string
    {
        $raw = trim($raw);

        if ($raw === '') {
            return null;
        }

        if (preg_match('/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})$/', $raw, $m)) {
            $month = $this->monthMap[Str::lower($m[2])] ?? null;

            if ($month) {
                $year = (int) $m[3];

                if ($year < 100) {
                    $year += $year > 30 ? 1900 : 2000;
                }

                return sprintf('%04d-%s-%02d', $year, $month, $m[1]);
            }
        }

        try {
            return Carbon::parse($raw)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    private function parseArrayField(string $raw): ?array
    {
        $raw = trim($raw);

        if ($raw === '') {
            return null;
        }

        $items = array_values(array_filter(array_map('trim', preg_split('/[,\n\r]+/', $raw)), fn ($i) => $i !== ''));

        return $items === [] ? null : $items;
    }

    private function cell(array $row, int $index): string
    {
        return trim((string) ($row[$index] ?? ''));
    }

    private function str(array $row, int $index, ?int $limit = null): ?string
    {
        $value = $this->cell($row, $index);

        if ($value === '') {
            return null;
        }

        return $limit ? Str::limit($value, $limit, '') : $value;
    }
}
