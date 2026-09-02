<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $from = $request->string('from')->toString() ?: now()->startOfMonth()->toDateString();
        $to = $request->string('to')->toString() ?: now()->toDateString();

        $summary = Transaction::query()
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->selectRaw('COALESCE(SUM(total_amount),0) as total_amount')
            ->selectRaw('COALESCE(SUM(discount_amount),0) as discount_amount')
            ->selectRaw('COALESCE(SUM(net_amount),0) as net_amount')
            ->selectRaw('COUNT(*) as total_transactions')
            ->first();

        $byPartner = Transaction::query()
            ->with('partner:id,name')
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->get()
            ->groupBy(fn ($t) => $t->partner->name)
            ->map(fn ($group) => [
                'partner' => $group->first()->partner->name,
                'total_transactions' => $group->count(),
                'total_sales' => (int) $group->sum('total_amount'),
                'total_discount' => (int) $group->sum('discount_amount'),
                'net_sales' => (int) $group->sum('net_amount'),
            ])
            ->values();

        $byMember = Transaction::query()
            ->with('member:id,name,member_code')
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->get()
            ->groupBy(fn ($t) => $t->member->name ?? 'Unknown')
            ->map(fn ($group) => [
                'member' => $group->first()->member->name ?? 'Unknown',
                'member_code' => $group->first()->member->member_code ?? null,
                'total_transactions' => $group->count(),
                'total_sales' => (int) $group->sum('total_amount'),
                'total_discount' => (int) $group->sum('discount_amount'),
                'net_sales' => (int) $group->sum('net_amount'),
            ])
            ->values();

        $transactions = Transaction::query()
            ->with(['partner:id,name', 'member:id,name,member_code'])
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->orderByDesc('transacted_at')
            ->get();

        $memberStats = $this->memberStatistics($from, $to);

        return Inertia::render('Admin/Reports/Index', [
            'summary' => $summary,
            'by_partner' => $byPartner,
            'by_member' => $byMember,
            'transactions' => $transactions,
            'member_stats' => $memberStats,
            'filters' => compact('from', 'to'),
        ]);
    }

    private function memberStatistics(string $from, string $to): array
    {
        $monthStart = now()->startOfMonth()->toDateString();
        $monthEnd = now()->endOfMonth()->toDateString();

        $totalRegistered = User::query()->where('role', User::ROLE_MEMBER)->count();
        $activeToInactive = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->whereHas('membership', fn ($q) => $q->where('status', 'active'))
            ->whereHas('membership', fn ($q) => $q->where('status', '!=', 'active'))
            ->count();
        $inactiveToActive = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->whereHas('membership', fn ($q) => $q->where('status', '!=', 'active'))
            ->whereHas('membership', fn ($q) => $q->where('status', 'active'))
            ->count();

        $religions = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->selectRaw('religion, COUNT(*) as total')
            ->groupBy('religion')
            ->get()
            ->pluck('total', 'religion')
            ->toArray();

        $genders = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->selectRaw('gender, COUNT(*) as total')
            ->groupBy('gender')
            ->get()
            ->pluck('total', 'gender')
            ->toArray();

        $ages = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->whereNotNull('birth_date')
            ->get()
            ->groupBy(function ($u) {
                $age = now()->diffInYears($u->birth_date);
                if ($age < 21) return '<21';
                if ($age <= 30) return '21-30';
                if ($age <= 40) return '30-40';
                if ($age <= 50) return '40-50';
                return '>50';
            })
            ->map(fn ($group) => $group->count())
            ->toArray();

        $attendanceCount = DB::table('event_attendances')
            ->join('users', 'event_attendances.member_id', '=', 'users.id')
            ->where('users.role', User::ROLE_MEMBER)
            ->selectRaw('event_attendances.member_id, COUNT(*) as total')
            ->groupBy('event_attendances.member_id')
            ->get()
            ->pluck('total', 'member_id')
            ->map(fn ($total) => (int) $total)
            ->toArray();

        $eventsByMonth = DB::table('event_attendances')
            ->selectRaw(self::monthExpr() . " as month, COUNT(*) as total")
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(6)
            ->get();

        return [
            'total_registered' => $totalRegistered,
            'active_to_inactive' => $activeToInactive,
            'inactive_to_active' => $inactiveToActive,
            'religions' => $religions,
            'genders' => $genders,
            'ages' => $ages,
            'attendance_count' => $attendanceCount,
            'events_by_month' => $eventsByMonth,
        ];
    }

    public static function monthExpr(): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', event_attendances.scanned_at)"
            : "DATE_FORMAT(event_attendances.scanned_at, '%Y-%m')";
    }
}