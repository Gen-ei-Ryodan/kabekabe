<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
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

        $transactions = Transaction::query()
            ->with(['partner:id,name', 'member:id,name,member_code'])
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->orderByDesc('transacted_at')
            ->get();

        return Inertia::render('Admin/Reports/Index', [
            'summary' => $summary,
            'by_partner' => $byPartner,
            'transactions' => $transactions,
            'filters' => compact('from', 'to'),
        ]);
    }
}