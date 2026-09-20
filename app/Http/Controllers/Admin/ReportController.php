<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Writer\XLSX\Writer as XlsxWriter;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    private const INDONESIAN_MONTHS = [
        1 => 'Januari',
        2 => 'Februari',
        3 => 'Maret',
        4 => 'April',
        5 => 'Mei',
        6 => 'Juni',
        7 => 'Juli',
        8 => 'Agustus',
        9 => 'September',
        10 => 'Oktober',
        11 => 'November',
        12 => 'Desember',
    ];

    public function __invoke(Request $request): Response
    {
        $from = $request->string('from')->toString() ?: now()->startOfMonth()->toDateString();
        $to = $request->string('to')->toString() ?: now()->toDateString();
        $birthdayFrom = $request->string('birthday_from')->toString();
        $birthdayTo = $request->string('birthday_to')->toString();
        $birthdayMonth = $request->string('birthday_month')->toString();

        $summary = Transaction::query()
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->selectRaw('COALESCE(SUM(total_amount),0) as total_amount')
            ->selectRaw('COALESCE(SUM(discount_amount),0) as discount_amount')
            ->selectRaw('COALESCE(SUM(net_amount),0) as net_amount')
            ->selectRaw('COUNT(*) as total_transactions')
            ->first();

        $months = $this->monthsBetween($from, $to);

        $byPartner = $this->transactionsByVendor($from, $to);
        $byMember = $this->transactionsByMember($from, $to);
        $memberStats = $this->memberStatistics($months);
        $birthdays = $this->birthdays($birthdayFrom, $birthdayTo, $birthdayMonth);

        $transactions = Transaction::query()
            ->with(['partner:id,name', 'member:id,name,member_code'])
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->orderByDesc('transacted_at')
            ->get();

        return Inertia::render('Admin/Reports/Index', [
            'summary' => $summary,
            'by_partner' => $byPartner,
            'by_member' => $byMember,
            'transactions' => $transactions,
            'member_stats' => $memberStats,
            'birthdays' => $birthdays,
            'filters' => [
                'from' => $from,
                'to' => $to,
                'birthday_from' => $birthdayFrom,
                'birthday_to' => $birthdayTo,
                'birthday_month' => $birthdayMonth,
            ],
        ]);
    }

    private function monthsBetween(string $from, string $to): array
    {
        $start = Carbon::parse($from)->startOfMonth();
        $end = Carbon::parse($to)->startOfMonth();
        $months = [];

        while ($start->lessThanOrEqualTo($end)) {
            $months[] = $start->format('Y-m');
            $start->addMonth();
        }

        return $months;
    }

    private function monthLabel(string $month): string
    {
        $carbon = Carbon::createFromFormat('Y-m', $month);

        return self::INDONESIAN_MONTHS[(int) $carbon->format('n')] . ' ' . $carbon->format('Y');
    }

    private function transactionsByVendor(string $from, string $to): array
    {
        $rows = DB::table('transactions')
            ->join('partners', 'transactions.partner_id', '=', 'partners.id')
            ->whereDate('transactions.transacted_at', '>=', $from)
            ->whereDate('transactions.transacted_at', '<=', $to)
            ->selectRaw($this->monthExpr('transactions.transacted_at') . " as month")
            ->selectRaw('partners.name as partner')
            ->selectRaw('COUNT(*) as total_transactions')
            ->selectRaw('COALESCE(SUM(transactions.discount_amount),0) as net_discount')
            ->selectRaw('COALESCE(SUM(transactions.net_amount),0) as net_sales')
            ->groupBy('month', 'partners.name')
            ->orderBy('month')
            ->orderByDesc('total_transactions')
            ->orderByDesc('net_discount')
            ->get();

        return $this->groupByMonth($rows, fn ($row) => [
            'partner' => $row->partner,
            'total_transactions' => (int) $row->total_transactions,
            'net_discount' => (int) $row->net_discount,
            'net_sales' => (int) $row->net_sales,
        ]);
    }

    private function transactionsByMember(string $from, string $to): array
    {
        $rows = DB::table('transactions')
            ->join('users', 'transactions.member_id', '=', 'users.id')
            ->whereDate('transactions.transacted_at', '>=', $from)
            ->whereDate('transactions.transacted_at', '<=', $to)
            ->selectRaw($this->monthExpr('transactions.transacted_at') . " as month")
            ->selectRaw('users.name as member')
            ->selectRaw('users.member_code as member_code')
            ->selectRaw('COUNT(*) as total_transactions')
            ->selectRaw('COALESCE(SUM(transactions.discount_amount),0) as total_discount')
            ->selectRaw('COALESCE(SUM(transactions.net_amount),0) as net_sales')
            ->groupBy('month', 'users.name', 'users.member_code')
            ->orderBy('month')
            ->orderByDesc('total_transactions')
            ->orderByDesc('net_sales')
            ->get();

        return $this->groupByMonth($rows, fn ($row) => [
            'member' => $row->member,
            'member_code' => $row->member_code,
            'total_transactions' => (int) $row->total_transactions,
            'total_discount' => (int) $row->total_discount,
            'net_sales' => (int) $row->net_sales,
        ]);
    }

    private function groupByMonth($rows, callable $mapper): array
    {
        $grouped = [];

        foreach ($rows as $row) {
            $month = $row->month;
            if (! isset($grouped[$month])) {
                $grouped[$month] = [
                    'month' => $month,
                    'label' => $this->monthLabel($month),
                    'rows' => [],
                ];
            }
            $grouped[$month]['rows'][] = $mapper($row);
        }

        return array_values($grouped);
    }

    private function memberStatistics(array $months): array
    {
        $monthLabels = array_map(fn ($m) => $this->monthLabel($m), $months);

        $registered = $this->countsPerMonth(
            User::query()->where('role', User::ROLE_MEMBER),
            'created_at',
            $months
        );

        $activeToInactive = $this->membershipChangeCounts($months, 'inactive');
        $inactiveToActive = $this->membershipChangeCounts($months, 'active');

        $religions = $this->demographicCountsPerMonth('religion', [
            'katolik', 'kristen', 'buddha', 'hindu', 'islam', 'lainnya',
        ], $months);

        $genders = $this->demographicCountsPerMonth('gender', ['male', 'female'], $months);

        $ageBuckets = $this->ageBucketCountsPerMonth($months);

        $attendance = $this->attendanceCountsPerMonth($months);

        return [
            'months' => $months,
            'month_labels' => $monthLabels,
            'rows' => [
                ['key' => 'registered', 'label' => 'Member Terdaftar', 'values' => $registered],
                ['key' => 'active_to_inactive', 'label' => 'Aktif → Non Aktif', 'values' => $activeToInactive],
                ['key' => 'inactive_to_active', 'label' => 'Non Aktif → Aktif', 'values' => $inactiveToActive],
                ['key' => 'religion_katolik', 'label' => 'Agama - Katolik', 'values' => $religions['katolik']],
                ['key' => 'religion_kristen', 'label' => 'Agama - Kristen', 'values' => $religions['kristen']],
                ['key' => 'religion_buddha', 'label' => 'Agama - Buddha', 'values' => $religions['buddha']],
                ['key' => 'religion_hindu', 'label' => 'Agama - Hindu', 'values' => $religions['hindu']],
                ['key' => 'religion_islam', 'label' => 'Agama - Islam', 'values' => $religions['islam']],
                ['key' => 'religion_lainnya', 'label' => 'Agama - Lainnya', 'values' => $religions['lainnya']],
                ['key' => 'male', 'label' => 'Pria', 'values' => $genders['male']],
                ['key' => 'female', 'label' => 'Wanita', 'values' => $genders['female']],
                ['key' => 'age_under_21', 'label' => 'Umur - Di bawah 21', 'values' => $ageBuckets['<21']],
                ['key' => 'age_21_30', 'label' => 'Umur - 21–30', 'values' => $ageBuckets['21-30']],
                ['key' => 'age_30_40', 'label' => 'Umur - 30–40', 'values' => $ageBuckets['30-40']],
                ['key' => 'age_40_50', 'label' => 'Umur - 40–50', 'values' => $ageBuckets['40-50']],
                ['key' => 'age_over_50', 'label' => 'Umur - Di atas 50', 'values' => $ageBuckets['>50']],
                ['key' => 'attendance', 'label' => 'Jumlah Kehadiran Acara', 'values' => $attendance],
            ],
        ];
    }

    private function countsPerMonth($query, string $dateColumn, array $months): array
    {
        $counts = $query
            ->selectRaw($this->monthExpr($dateColumn) . " as month, COUNT(*) as total")
            ->groupBy('month')
            ->pluck('total', 'month')
            ->toArray();

        return array_map(fn ($month) => (int) ($counts[$month] ?? 0), $months);
    }

    /**
     * Proxy for status-change counts: uses memberships.updated_at as the change
     * timestamp. No dedicated audit table exists, so this is the best available
     * approximation.
     */
    private function membershipChangeCounts(array $months, string $targetStatus): array
    {
        $counts = DB::table('memberships')
            ->join('users', 'memberships.member_id', '=', 'users.id')
            ->where('users.role', User::ROLE_MEMBER)
            ->where('memberships.status', $targetStatus)
            ->selectRaw($this->monthExpr('memberships.updated_at') . " as month, COUNT(*) as total")
            ->groupBy('month')
            ->pluck('total', 'month')
            ->toArray();

        return array_map(fn ($month) => (int) ($counts[$month] ?? 0), $months);
    }

    private function demographicCountsPerMonth(string $column, array $keys, array $months): array
    {
        $result = [];

        foreach ($keys as $key) {
            $counts = User::query()
                ->where('role', User::ROLE_MEMBER)
                ->where($column, $key)
                ->selectRaw($this->monthExpr('created_at') . " as month, COUNT(*) as total")
                ->groupBy('month')
                ->pluck('total', 'month')
                ->toArray();

            $result[$key] = array_map(fn ($month) => (int) ($counts[$month] ?? 0), $months);
        }

        return $result;
    }

    private function ageBucketCountsPerMonth(array $months): array
    {
        $buckets = ['<21' => [], '21-30' => [], '30-40' => [], '40-50' => [], '>50' => []];
        $counts = [];

        foreach ($months as $month) {
            $endOfMonth = Carbon::createFromFormat('Y-m', $month)->endOfMonth();

            $members = User::query()
                ->where('role', User::ROLE_MEMBER)
                ->whereNotNull('birth_date')
                ->whereDate('created_at', '<=', $endOfMonth)
                ->get(['birth_date']);

            $monthBuckets = ['<21' => 0, '21-30' => 0, '30-40' => 0, '40-50' => 0, '>50' => 0];

            foreach ($members as $member) {
                $age = Carbon::parse($member->birth_date)->diffInYears($endOfMonth);

                if ($age < 21) {
                    $bucket = '<21';
                } elseif ($age <= 30) {
                    $bucket = '21-30';
                } elseif ($age <= 40) {
                    $bucket = '30-40';
                } elseif ($age <= 50) {
                    $bucket = '40-50';
                } else {
                    $bucket = '>50';
                }

                $monthBuckets[$bucket]++;
            }

            foreach ($monthBuckets as $bucket => $count) {
                $counts[$bucket][] = $count;
            }
        }

        return $counts;
    }

    private function attendanceCountsPerMonth(array $months): array
    {
        $counts = DB::table('event_attendances')
            ->join('users', 'event_attendances.member_id', '=', 'users.id')
            ->where('users.role', User::ROLE_MEMBER)
            ->selectRaw($this->monthExpr('event_attendances.scanned_at') . " as month, COUNT(*) as total")
            ->groupBy('month')
            ->pluck('total', 'month')
            ->toArray();

        return array_map(fn ($month) => (int) ($counts[$month] ?? 0), $months);
    }

    private function birthdays(?string $birthdayFrom = null, ?string $birthdayTo = null, ?string $birthdayMonth = null): array
    {
        $monthExpr = $this->datePartExpr('birth_date', 'month');
        $dayExpr = $this->datePartExpr('birth_date', 'day');

        $query = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->whereNotNull('birth_date');

        if ($birthdayMonth) {
            $query->whereRaw("{$monthExpr} = ?", [(int) $birthdayMonth]);
        }

        if ($birthdayFrom) {
            $query->whereDate('birth_date', '>=', $birthdayFrom);
        }

        if ($birthdayTo) {
            $query->whereDate('birth_date', '<=', $birthdayTo);
        }

        $members = $query->orderByRaw($monthExpr)
            ->orderByRaw($dayExpr)
            ->get(['id', 'name', 'member_code', 'birth_date']);

        $grouped = $members->map(fn (User $u) => [
            'id' => $u->id,
            'name' => $u->name,
            'member_code' => $u->member_code,
            'birth_date' => $u->birth_date?->toDateString(),
            'age' => $u->birth_date ? Carbon::parse($u->birth_date)->age : null,
            'month' => $u->birth_date ? (int) $u->birth_date->format('n') : null,
            'day' => $u->birth_date ? (int) $u->birth_date->format('j') : null,
        ])->groupBy('month')->sortKeys();

        return $grouped->map(fn ($group, $month) => [
            'month' => (int) $month,
            'month_label' => self::INDONESIAN_MONTHS[(int) $month] ?? 'Bulan ' . $month,
            'members' => $group->sortBy('day')->values(),
        ])->values()->toArray();
    }

    public function export(Request $request): StreamedResponse
    {
        $type = $request->string('type')->toString() ?: 'transaction';
        $from = $request->string('from')->toString() ?: now()->startOfMonth()->toDateString();
        $to = $request->string('to')->toString() ?: now()->toDateString();

        if ($type === 'birthday') {
            return $this->exportBirthdays($request);
        }

        if ($type === 'member_stats') {
            return $this->exportMemberStats($from, $to);
        }

        return $this->exportTransactions($from, $to);
    }

    private function exportTransactions(string $from, string $to): StreamedResponse
    {
        $transactions = Transaction::query()
            ->with(['partner:id,name', 'member:id,name,member_code'])
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->orderBy('transacted_at')
            ->get();

        $filename = "laporan-transaksi-{$from}-sd-{$to}.xlsx";

        return response()->streamDownload(function () use ($transactions): void {
            $writer = new XlsxWriter();
            $writer->openToFile('php://output');
            $writer->getCurrentSheet()->setName('Transaksi');

            $writer->addRow(Row::fromValues([
                'No',
                'Tanggal',
                'No. Transaksi',
                'Nama Member',
                'Kode Member',
                'Partner / Vendor',
                'Total Belanja (Rp)',
                'Diskon (Rp)',
                'Penjualan Bersih (Rp)',
            ]));

            $totalAmount = 0;
            $totalDiscount = 0;
            $totalNet = 0;

            foreach ($transactions as $i => $t) {
                $totalAmount += $t->total_amount;
                $totalDiscount += $t->discount_amount;
                $totalNet += $t->net_amount;

                $writer->addRow(Row::fromValues([
                    $i + 1,
                    $t->transacted_at?->format('Y-m-d H:i') ?? '-',
                    $t->transaction_number,
                    $t->member?->name ?? '-',
                    $t->member?->member_code ?? '-',
                    $t->partner?->name ?? '-',
                    $t->total_amount,
                    $t->discount_amount,
                    $t->net_amount,
                ]));
            }

            // Summary Row
            $writer->addRow(Row::fromValues([
                'TOTAL',
                '',
                '',
                '',
                '',
                count($transactions) . ' Transaksi',
                $totalAmount,
                $totalDiscount,
                $totalNet,
            ]));

            $writer->close();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function exportMemberStats(string $from, string $to): StreamedResponse
    {
        $months = $this->monthsBetween($from, $to);
        $stats = $this->memberStatistics($months);
        $filename = "laporan-statistik-member-{$from}-sd-{$to}.xlsx";

        return response()->streamDownload(function () use ($stats): void {
            $writer = new XlsxWriter();
            $writer->openToFile('php://output');
            $writer->getCurrentSheet()->setName('Statistik Member');

            $writer->addRow(Row::fromValues([
                'No',
                'Periode Bulan',
                'Total Member Terdaftar',
                'Member Baru',
                'Member Aktif',
                'Member Nonaktif',
                'Kehadiran Event Komunitas',
            ]));

            foreach ($stats['months'] as $i => $month) {
                $writer->addRow(Row::fromValues([
                    $i + 1,
                    $this->monthLabel($month),
                    $stats['registered_members'][$i] ?? 0,
                    $stats['new_members'][$i] ?? 0,
                    $stats['active_members'][$i] ?? 0,
                    $stats['inactive_members'][$i] ?? 0,
                    $stats['attendances'][$i] ?? 0,
                ]));
            }

            $writer->close();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function exportBirthdays(Request $request): StreamedResponse
    {
        $bFrom = $request->string('birthday_from')->toString() ?: null;
        $bTo = $request->string('birthday_to')->toString() ?: null;
        $bMonth = $request->string('birthday_month')->toString() ?: null;

        $monthExpr = $this->datePartExpr('birth_date', 'month');
        $dayExpr = $this->datePartExpr('birth_date', 'day');

        $query = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->whereNotNull('birth_date');

        if ($bMonth) {
            $query->whereRaw("{$monthExpr} = ?", [(int) $bMonth]);
        }
        if ($bFrom) {
            $query->whereDate('birth_date', '>=', $bFrom);
        }
        if ($bTo) {
            $query->whereDate('birth_date', '<=', $bTo);
        }

        $members = $query->orderByRaw($monthExpr)
            ->orderByRaw($dayExpr)
            ->get(['id', 'name', 'member_code', 'birth_date', 'phone']);

        $filename = 'laporan-ulang-tahun-member.xlsx';

        return response()->streamDownload(function () use ($members): void {
            $writer = new XlsxWriter();
            $writer->openToFile('php://output');
            $writer->getCurrentSheet()->setName('Ulang Tahun Member');

            $writer->addRow(Row::fromValues([
                'No',
                'Nama Member',
                'ID / Kode Member',
                'No. Telepon / WA',
                'Tanggal Lahir',
                'Bulan Lahir',
                'Usia (Tahun)',
            ]));

            foreach ($members as $i => $m) {
                $monthNum = $m->birth_date ? (int) $m->birth_date->format('n') : 0;
                $writer->addRow(Row::fromValues([
                    $i + 1,
                    $m->name,
                    $m->member_code ?? '-',
                    $m->phone ?? '-',
                    $m->birth_date?->format('d/m/Y') ?? '-',
                    self::INDONESIAN_MONTHS[$monthNum] ?? '-',
                    $m->birth_date ? Carbon::parse($m->birth_date)->age : '-',
                ]));
            }

            $writer->close();
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    private function monthExpr(string $column): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', {$column})"
            : "DATE_FORMAT({$column}, '%Y-%m')";
    }

    private function datePartExpr(string $column, string $part): string
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            return "strftime('%" . ($part === 'month' ? 'm' : 'd') . "', {$column})";
        }

        return ($part === 'month' ? 'MONTH' : 'DAY') . "({$column})";
    }
}
