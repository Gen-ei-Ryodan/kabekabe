<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\ReportingService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly ReportingService $reports,
    ) {}

    public function __invoke(): Response
    {
        $partner = auth()->user()->partner;

        abort_if($partner === null, 403);

        $recent = Transaction::query()
            ->where('partner_id', $partner->id)
            ->with('member:id,name,member_code')
            ->latest('transacted_at')
            ->limit(8)
            ->get();

        return Inertia::render('Vendor/Dashboard', [
            'partner' => $partner,
            'stats' => $this->reports->vendorDashboard($partner),
            'recent_transactions' => $recent,
        ]);
    }
}