<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\ReportingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $partner = auth()->user()->partner;

        abort_if($partner === null, 403);

        $from = $request->string('from')->toString() ?: now()->startOfMonth()->toDateString();
        $to = $request->string('to')->toString() ?: now()->toDateString();

        $summary = Transaction::query()
            ->where('partner_id', $partner->id)
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->selectRaw('COALESCE(SUM(total_amount),0) as total_amount')
            ->selectRaw('COALESCE(SUM(discount_amount),0) as discount_amount')
            ->selectRaw('COALESCE(SUM(net_amount),0) as net_amount')
            ->selectRaw('COUNT(*) as total_transactions')
            ->first();

        $transactions = Transaction::query()
            ->where('partner_id', $partner->id)
            ->with('member:id,name,member_code')
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->orderByDesc('transacted_at')
            ->get();

        $byDay = Transaction::query()
            ->where('partner_id', $partner->id)
            ->whereDate('transacted_at', '>=', $from)
            ->whereDate('transacted_at', '<=', $to)
            ->selectRaw(ReportingService::dayExpr() . " as day, COUNT(*) as total, COALESCE(SUM(net_amount),0) as net")
            ->groupBy('day')
            ->orderBy('day')
            ->get();

        return Inertia::render('Vendor/Reports/Index', [
            'summary' => $summary,
            'transactions' => $transactions,
            'by_day' => $byDay,
            'filters' => compact('from', 'to'),
        ]);
    }
}