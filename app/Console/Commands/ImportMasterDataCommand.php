<?php

namespace App\Console\Commands;

use App\Models\Membership;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ImportMasterDataCommand extends Command
{
    protected $signature = 'kbkb:import-master {file? : Path file CSV master data}';

    protected $description = 'Import master data keanggotaan KBKB dari Google Spreadsheet CSV';

    private array $monthMap = [
        'jan' => '01', 'peb' => '02', 'feb' => '02', 'mar' => '03', 'apr' => '04',
        'mei' => '05', 'may' => '05', 'jun' => '06', 'jul' => '07', 'agu' => '08',
        'agus' => '08', 'agt' => '08', 'aug' => '08', 'sep' => '09', 'okt' => '10',
        'oct' => '10', 'nop' => '11', 'nov' => '11', 'des' => '12', 'dec' => '12',
    ];

    public function handle(): int
    {
        $filePath = $this->argument('file') ?: storage_path('app/DATABASE MEMBERSHIP KBKB.csv');

        if (! file_exists($filePath)) {
            $this->error("File tidak ditemukan di: {$filePath}");
            return Command::FAILURE;
        }

        $this->info("Memulai import data master KBKB dari: {$filePath}");

        $handle = fopen($filePath, 'r');
        if (! $handle) {
            $this->error("Gagal membuka file: {$filePath}");
            return Command::FAILURE;
        }

        // Lewati baris 0 (header) dan baris 1 (subheader)
        fgetcsv($handle);
        fgetcsv($handle);

        $createdCount = 0;
        $updatedCount = 0;
        $membershipCount = 0;
        $rowCount = 0;

        DB::beginTransaction();

        try {
            while (($row = fgetcsv($handle)) !== false) {
                if (empty($row) || (count($row) < 4 && empty($row[2]))) {
                    continue;
                }

                $rawEmail = isset($row[2]) ? trim($row[2]) : '';
                $name = isset($row[3]) ? trim($row[3]) : '';

                if (empty($rawEmail) && empty($name)) {
                    continue;
                }

                $rowCount++;
                $email = strtolower($rawEmail);
                $name = Str::limit($name, 255, '');
                $nickname = isset($row[4]) && trim($row[4]) !== '' ? Str::limit(trim($row[4]), 100, '') : null;
                $gender = isset($row[5]) && trim($row[5]) !== '' ? Str::limit(trim($row[5]), 50, '') : null;
                $birthDateRaw = isset($row[6]) ? trim($row[6]) : '';
                $birthDate = $this->parseBirthDate($birthDateRaw);
                $birthPlace = isset($row[10]) && trim($row[10]) !== '' ? Str::limit(trim($row[10]), 100, '') : null;
                $maritalStatus = isset($row[12]) && trim($row[12]) !== '' ? Str::limit(trim($row[12]), 50, '') : null;
                $placeOfWorship = isset($row[13]) && trim($row[13]) !== '' ? trim($row[13]) : null;
                $religion = isset($row[14]) && trim($row[14]) !== '' ? Str::limit(trim($row[14]), 100, '') : null;

                $phone = isset($row[15]) && trim($row[15]) !== '' ? Str::limit(trim($row[15]), 30, '') : null;
                $whatsapp = isset($row[16]) && trim($row[16]) !== '' ? Str::limit(trim($row[16]), 30, '') : ($phone ?: null);
                $address = isset($row[18]) && trim($row[18]) !== '' ? trim($row[18]) : null;
                $district = isset($row[19]) && trim($row[19]) !== '' ? Str::limit(trim($row[19]), 100, '') : null;
                $city = isset($row[20]) && trim($row[20]) !== '' ? Str::limit(trim($row[20]), 100, '') : null;

                $company = isset($row[30]) && trim($row[30]) !== '' ? trim($row[30]) : null;
                $businessFieldsRaw = isset($row[32]) ? trim($row[32]) : '';
                $businessFields = $this->parseArrayField($businessFieldsRaw);

                $hobbiesRaw = isset($row[33]) ? trim($row[33]) : '';
                $hobbies = $this->parseArrayField($hobbiesRaw);

                // Disambiguasi email duplikat untuk orang berbeda (misal keluarga satu email)
                $targetEmail = $email;
                $existingUser = User::where('email', $email)->first();

                if ($existingUser && ! $this->isSamePerson($existingUser->name, $name)) {
                    $slug = Str::slug($name);
                    $emailParts = explode('@', $email);
                    if (count($emailParts) === 2) {
                        $targetEmail = "{$emailParts[0]}+{$slug}@{$emailParts[1]}";
                    } else {
                        $targetEmail = "{$email}.{$slug}";
                    }
                    $existingUser = User::where('email', $targetEmail)->first();
                }

                $defaultYear = $birthDate ? Carbon::parse($birthDate)->format('Y') : '2026';
                $defaultPassword = 'KBKB' . $defaultYear;

                if ($existingUser) {
                    $existingUser->update([
                        'name' => $name,
                        'nickname' => $nickname ?: $existingUser->nickname,
                        'gender' => $gender ?: $existingUser->gender,
                        'birth_date' => $birthDate ?: $existingUser->birth_date,
                        'birth_place' => $birthPlace ?: $existingUser->birth_place,
                        'marital_status' => $maritalStatus ?: $existingUser->marital_status,
                        'religion' => $religion ?: $existingUser->religion,
                        'place_of_worship_address' => $placeOfWorship ?: $existingUser->place_of_worship_address,
                        'phone' => $phone ?: $existingUser->phone,
                        'whatsapp' => $whatsapp ?: $existingUser->whatsapp,
                        'address' => $address ?: $existingUser->address,
                        'district' => $district ?: $existingUser->district,
                        'city' => $city ?: $existingUser->city,
                        'company' => $company ?: $existingUser->company,
                        'business_fields' => $businessFields ?: $existingUser->business_fields,
                        'hobbies' => $hobbies ?: $existingUser->hobbies,
                        'approval_status' => User::APPROVAL_APPROVED,
                    ]);
                    $user = $existingUser;
                    $updatedCount++;
                } else {
                    $user = User::create([
                        'email' => $targetEmail,
                        'name' => $name,
                        'nickname' => $nickname,
                        'gender' => $gender,
                        'birth_date' => $birthDate,
                        'birth_place' => $birthPlace,
                        'marital_status' => $maritalStatus,
                        'religion' => $religion,
                        'place_of_worship_address' => $placeOfWorship,
                        'phone' => $phone,
                        'whatsapp' => $whatsapp,
                        'address' => $address,
                        'district' => $district,
                        'city' => $city,
                        'company' => $company,
                        'business_fields' => $businessFields,
                        'hobbies' => $hobbies,
                        'password' => Hash::make($defaultPassword),
                        'role' => User::ROLE_MEMBER,
                        'approval_status' => User::APPROVAL_APPROVED,
                        'must_change_password' => true,
                    ]);
                    $createdCount++;
                }

                // Aktifkan membership 1 tahun
                Membership::updateOrCreate(
                    ['member_id' => $user->id],
                    [
                        'status' => Membership::STATUS_ACTIVE,
                        'started_at' => now(),
                        'expires_at' => now()->addYear(),
                    ]
                );
                $membershipCount++;
            }

            DB::commit();
            fclose($handle);

            $this->info("Import selesai dengan sukses!");
            $this->table(
                ['Metric', 'Total'],
                [
                    ['Baris Data Diproses', $rowCount],
                    ['Anggota Baru Dibuat', $createdCount],
                    ['Anggota Diperbarui', $updatedCount],
                    ['Membership Aktif', $membershipCount],
                ]
            );

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();
            fclose($handle);
            $this->error("Terjadi error saat import: " . $e->getMessage());
            $this->error($e->getTraceAsString());
            return Command::FAILURE;
        }
    }

    private function parseBirthDate(?string $raw): ?string
    {
        if (! $raw) {
            return null;
        }

        if (preg_match('/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})$/', trim($raw), $matches)) {
            $day = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
            $monthStr = strtolower($matches[2]);
            $month = $this->monthMap[$monthStr] ?? null;

            if ($month) {
                $year = (int) $matches[3];
                if ($year < 100) {
                    $year += ($year > 30) ? 1900 : 2000;
                }
                return sprintf('%04d-%s-%s', $year, $month, $day);
            }
        }

        try {
            return Carbon::parse($raw)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    private function parseArrayField(?string $raw): ?array
    {
        if (! $raw) {
            return null;
        }

        $items = preg_split('/[,\n\r]+/', $raw);
        $clean = array_values(array_filter(array_map('trim', $items), fn ($i) => $i !== ''));

        return ! empty($clean) ? $clean : null;
    }

    private function isSamePerson(string $nameA, string $nameB): bool
    {
        $a = Str::lower(trim($nameA));
        $b = Str::lower(trim($nameB));

        return $a === $b || Str::contains($a, $b) || Str::contains($b, $a);
    }
}
