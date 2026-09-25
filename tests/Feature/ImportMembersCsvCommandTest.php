<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ImportMembersCsvCommandTest extends TestCase
{
    use RefreshDatabase;

    private string $csv;

    protected function setUp(): void
    {
        parent::setUp();

        $this->csv = tempnam(sys_get_temp_dir(), 'members_import_').'.csv';
    }

    protected function tearDown(): void
    {
        if (is_file($this->csv)) {
            unlink($this->csv);
        }

        parent::tearDown();
    }

    public function test_imports_new_members_with_default_password_and_csv_based_member_code(): void
    {
        $this->writeCsv([
            $this->row(),
            $this->row([
                2 => 'baru@contoh.test',
                3 => 'Baru Anggota',
                1 => '11/05/2023 10:00:00',
                20 => 'Tidak Aktif',
                21 => '12/31/2025',
            ]),
        ]);

        $this->artisan('members:import-csv', ['--file' => $this->csv])->assertExitCode(0);

        $member = User::where('email', 'baru@contoh.test')->firstOrFail();

        $this->assertTrue(Hash::check('password', $member->password));
        $this->assertSame(User::ROLE_MEMBER, $member->role);
        $this->assertSame(User::APPROVAL_APPROVED, $member->approval_status);
        $this->assertTrue($member->must_change_password);
        $this->assertSame('70302311001', $member->member_code);

        $first = User::where('email', 'ray.komputerku@gmail.com')->firstOrFail();
        $this->assertSame('70302310001', $first->member_code);
        $this->assertSame('Raymond Pradipta', $first->name);
        $this->assertSame('1989-01-27', $first->birth_date->format('Y-m-d'));
        $this->assertSame(['BBQ', 'Gaming'], $first->hobbies);
        $this->assertSame('Denpasar Barat', $first->district);

        $this->assertSame('inactive', $member->membership()->first()->status);
        $this->assertSame('2025-12-31', $member->membership()->first()->expires_at->format('Y-m-d'));

        $active = $first->membership()->first();
        $this->assertSame('active', $active->status);
        $this->assertSame('2027-01-08', $active->expires_at->format('Y-m-d'));
        $this->assertSame('2023-10-13', $active->started_at->format('Y-m-d'));
    }

    public function test_protected_accounts_keep_their_existing_password_hash(): void
    {
        $hash = Hash::make('rahasia-lama');
        User::factory()->member()->create([
            'email' => 'ray.komputerku@gmail.com',
            'password' => $hash,
        ]);

        $this->writeCsv([
            $this->row(),
            $this->row([2 => 'lain@contoh.test', 3 => 'Lain Anggota']),
        ]);

        $this->artisan('members:import-csv', ['--file' => $this->csv])->assertExitCode(0);

        $protected = User::where('email', 'ray.komputerku@gmail.com')->firstOrFail();

        $this->assertSame($hash, $protected->getRawOriginal('password'));
        $this->assertTrue(Hash::check('rahasia-lama', $protected->password));
        $this->assertSame('Raymond Pradipta', $protected->name);
        $this->assertTrue(Hash::check('password', User::where('email', 'lain@contoh.test')->firstOrFail()->password));
    }

    public function test_member_code_sequence_resets_per_join_month_and_stays_unique(): void
    {
        $this->writeCsv([
            $this->row(),
            $this->row([2 => 'dua@contoh.test', 3 => 'Dua Anggota']),
            $this->row([2 => 'tiga@contoh.test', 3 => 'Tiga Anggota', 1 => '10/20/2023 08:00:00']),
            $this->row([2 => 'empat@contoh.test', 3 => 'Empat Anggota', 1 => '11/01/2023 08:00:00']),
        ]);

        $this->artisan('members:import-csv', ['--file' => $this->csv])->assertExitCode(0);

        $codes = User::whereIn('email', [
            'ray.komputerku@gmail.com',
            'dua@contoh.test',
            'tiga@contoh.test',
            'empat@contoh.test',
        ])->pluck('member_code', 'email');

        $this->assertSame('70302310001', $codes['ray.komputerku@gmail.com']);
        $this->assertSame('70302310002', $codes['dua@contoh.test']);
        $this->assertSame('70302310003', $codes['tiga@contoh.test']);
        $this->assertSame('70302311001', $codes['empat@contoh.test']);
        $this->assertSame($codes->count(), $codes->unique()->count());
    }

    private function writeCsv(array $rows): void
    {
        $handle = fopen($this->csv, 'w');
        fputcsv($handle, array_fill(0, 22, 'column'), ',', '"', '');

        foreach ($rows as $row) {
            fputcsv($handle, $row, ',', '"', '');
        }

        fclose($handle);
    }

    private function row(array $override = []): array
    {
        $row = array_fill(0, 22, '');
        $row[1] = '10/13/2023 13:43:56';
        $row[2] = 'ray.komputerku@gmail.com';
        $row[3] = 'Raymond Pradipta';
        $row[4] = 'Ray';
        $row[5] = 'Pria';
        $row[6] = '27 Jan 1989';
        $row[7] = 'Surakarta';
        $row[9] = 'Menikah';
        $row[10] = 'Katolik';
        $row[11] = 'Katolik';
        $row[12] = '08993113889';
        $row[14] = 'Graha Laksamana Mulia A16';
        $row[15] = 'Denpasar Barat';
        $row[16] = 'FX Bali Computer';
        $row[18] = 'Elektronik';
        $row[19] = 'BBQ, Gaming';
        $row[20] = 'Aktif';
        $row[21] = '01/08/2027';

        return array_replace($row, $override);
    }
}
