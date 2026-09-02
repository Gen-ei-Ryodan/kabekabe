<?php

namespace App\Services;

use App\Models\Partner;
use App\Models\Payment;
use App\Models\Promo;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReportingService
{
    public static function monthExpr(): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m', transacted_at)"
            : "DATE_FORMAT(transacted_at, '%Y-%m')";
    }

    public static function dayExpr(): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "strftime('%Y-%m-%d', transacted_at)"
            : "DATE_FORMAT(transacted_at, '%Y-%m-%d')";
    }

    public function adminDashboard(): array
    {
        $totalMembers = User::query()->where('role', User::ROLE_MEMBER)->count();
        $activeMembers = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->whereHas('membership', fn ($q) => $q->where('status', 'active')->where('expires_at', '>', now()))
            ->count();
        $inactiveMembers = max(0, $totalMembers - $activeMembers);
        $totalPartners = Partner::query()->count();
        $totalPromos = Promo::query()->count();
        $activePromos = Promo::query()->where('status', Promo::STATUS_APPROVED)->where('is_active', true)->count();
        $pendingPromos = Promo::query()->where('status', Promo::STATUS_PENDING)->count();
        $pendingPayments = Payment::query()->where('status', Payment::STATUS_PENDING)->count();
        $totalVendors = User::query()->where('role', User::ROLE_VENDOR)->count();

        $expiredNextMonth = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->whereHas('membership', function ($q) {
                $q->where('status', 'active')
                    ->whereBetween('expires_at', [now(), now()->addMonth()]);
            })
            ->count();

        $expiredNext2Months = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->whereHas('membership', function ($q) {
                $q->where('status', 'active')
                    ->whereBetween('expires_at', [now(), now()->addMonths(2)]);
            })
            ->count();

        $tomorrowActive = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->whereHas('membership', fn ($q) => $q->where('status', 'active')->whereDate('expires_at', now()->addDay()->toDateString()))
            ->count();

        $tomorrowNonActive = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->whereHas('membership', fn ($q) => $q->where('status', '!=', 'active')->whereDate('expires_at', now()->addDay()->toDateString()))
            ->count();

        $transactionAgg = Transaction::query()
            ->selectRaw('COALESCE(SUM(total_amount),0) as total_amount')
            ->selectRaw('COALESCE(SUM(discount_amount),0) as discount_amount')
            ->selectRaw('COALESCE(SUM(net_amount),0) as net_amount')
            ->selectRaw('COUNT(*) as total_transactions')
            ->first();

        $thisMonth = $this->monthlyTransactionAgg(now()->startOfMonth(), now()->endOfMonth());
        $lastMonth = $this->monthlyTransactionAgg(now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth());
        $twoMonthsAgo = $this->monthlyTransactionAgg(now()->subMonths(2)->startOfMonth(), now()->subMonths(2)->endOfMonth());

        $promoAgg = Promo::query()
            ->where('status', Promo::STATUS_APPROVED)
            ->where('is_active', true)
            ->selectRaw('COALESCE(SUM(CASE WHEN discount_type = \'nominal\' THEN discount_value ELSE 0 END),0) as nominal_total')
            ->first();
        $netPromos = (int) $promoAgg->nominal_total;

        return [
            'total_members' => $totalMembers,
            'active_members' => $activeMembers,
            'inactive_members' => $inactiveMembers,
            'expired_next_month' => $expiredNextMonth,
            'expired_next_2_months' => $expiredNext2Months,
            'tomorrow_active' => $tomorrowActive,
            'tomorrow_non_active' => $tomorrowNonActive,
            'total_partners' => $totalPartners,
            'total_promos' => $totalPromos,
            'active_promos' => $activePromos,
            'pending_promos' => $pendingPromos,
            'pending_payments' => $pendingPayments,
            'total_vendors' => $totalVendors,
            'total_transactions' => (int) $transactionAgg->total_transactions,
            'total_sales' => (int) $transactionAgg->total_amount,
            'total_discount' => (int) $transactionAgg->discount_amount,
            'net_sales' => (int) $transactionAgg->net_amount,
            'net_promos' => $netPromos,
            'this_month' => $thisMonth,
            'last_month' => $lastMonth,
            'two_months_ago' => $twoMonthsAgo,
        ];
    }

    private function monthlyTransactionAgg(\DateTimeInterface $from, \DateTimeInterface $to): array
    {
        $agg = Transaction::query()
            ->whereBetween('transacted_at', [$from, $to])
            ->selectRaw('COALESCE(SUM(total_amount),0) as total_amount')
            ->selectRaw('COALESCE(SUM(discount_amount),0) as discount_amount')
            ->selectRaw('COALESCE(SUM(net_amount),0) as net_amount')
            ->selectRaw('COUNT(*) as total_transactions')
            ->first();

        return [
            'total_transactions' => (int) $agg->total_transactions,
            'net_sales' => (int) $agg->net_amount,
            'net_promos' => (int) $agg->discount_amount,
        ];
    }

    public function vendorDashboard(Partner $partner): array
    {
        $transactions = $partner->transactions();

        $aggregate = (clone $transactions)
            ->selectRaw('COALESCE(SUM(total_amount),0) as total_amount')
            ->selectRaw('COALESCE(SUM(discount_amount),0) as discount_amount')
            ->selectRaw('COALESCE(SUM(net_amount),0) as net_amount')
            ->selectRaw('COUNT(*) as total_transactions')
            ->first();

        $activeMembers = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->whereHas('membership', fn ($q) => $q->where('status', 'active')->where('expires_at', '>', now()))
            ->count();

        $transactionsByMonth = $partner->transactions()
            ->selectRaw(self::monthExpr() . " as month, COUNT(*) as total, COALESCE(SUM(net_amount),0) as net")
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->limit(6)
            ->get();

        return [
            'active_members' => $activeMembers,
            'total_transactions' => (int) $aggregate->total_transactions,
            'total_sales' => (int) $aggregate->total_amount,
            'total_discount' => (int) $aggregate->discount_amount,
            'net_sales' => (int) $aggregate->net_amount,
            'monthly' => $transactionsByMonth,
        ];
    }

    public function transactionsReport(string $from, string $to): array
    {
        return Transaction::query()
            ->between($from, $to)
            ->selectRaw('COALESCE(SUM(total_amount),0) as total_amount')
            ->selectRaw('COALESCE(SUM(discount_amount),0) as discount_amount')
            ->selectRaw('COALESCE(SUM(net_amount),0) as net_amount')
            ->selectRaw('COUNT(*) as total_transactions')
            ->first()
            ->toArray();
    }
}