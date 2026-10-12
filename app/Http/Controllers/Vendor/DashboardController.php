<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\ReportingService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly ReportingService $reports,
    ) {}

    public function __invoke(): Response
    {
        $user = Auth::guard('partner')->user() ?? auth()->user();
        $partner = $user?->partner;

        abort_if($partner === null, 403);

        $recent = Transaction::query()
            ->where('partner_id', $partner->id)
            ->with('member:id,name,member_code')
            ->latest('transacted_at')
            ->limit(8)
            ->get();

        \Carbon\Carbon::setLocale('id');
        $isActive = $partner->isActive();
        $expiresAtWita = $partner->expires_at
            ? $partner->expires_at->setTimezone('Asia/Makassar')->translatedFormat('l, d F Y').' WITA'
            : 'Tidak Terbatas (Permanen)';

        $partnerData = array_merge($partner->toArray(), [
            'is_active' => $isActive,
            'status_label' => $isActive ? 'AKTIF' : 'TIDAK AKTIF',
            'expires_at_formatted' => $expiresAtWita,
            'days_remaining' => $partner->expires_at ? max(0, (int) now()->diffInDays($partner->expires_at, false)) : null,
        ]);

        return Inertia::render('Vendor/Dashboard', [
            'partner' => $partnerData,
            'stats' => $this->reports->vendorDashboard($partner),
            'recent_transactions' => $recent,
        ]);
    }
}
