<?php

namespace App\Http\Controllers\Admin;

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
        $recent = Transaction::query()
            ->with(['partner:id,name', 'member:id,name'])
            ->latest('transacted_at')
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $this->reports->adminDashboard(),
            'recent_transactions' => $recent,
        ]);
    }
}