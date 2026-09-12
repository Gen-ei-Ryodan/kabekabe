<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $partner = $user->partner;

        abort_if(! $partner, 403, 'Anda bukan akun Partner.');

        $isActive = $partner->isActive();

        $history = Payment::query()
            ->where('member_id', $user->id)
            ->latest('created_at')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'invoice_number' => $p->invoice_number,
                'period_months' => $p->period_months,
                'amount' => $p->amount,
                'status' => $p->status,
                'paid_at' => $p->paid_at?->translatedFormat('d M Y'),
                'notes' => $p->notes,
            ]);

        // Paket Durasi 1–12 Bulan @ Rp100.000 per 30 hari
        $plans = collect(range(1, 12))->map(fn ($months) => [
            'months' => $months,
            'days' => $months * 30,
            'name' => "{$months} Bulan (" . ($months * 30) . " Hari)",
            'price' => $months * 100000,
            'formatted_price' => 'Rp' . number_format($months * 100000, 0, ',', '.'),
        ]);

        return Inertia::render('Vendor/Billing/Index', [
            'partner' => [
                'id' => $partner->id,
                'name' => $partner->name,
                'category' => $partner->category,
                'status' => $partner->status ?? 'active',
                'status_label' => $isActive ? 'AKTIF' : 'TIDAK AKTIF',
                'is_active' => $isActive,
                'expires_at' => $partner->expires_at?->translatedFormat('d M Y'),
                'days_remaining' => $partner->expires_at ? max(0, (int) $partner->expires_at->diffInDays(now())) : null,
            ],
            'plans' => $plans,
            'history' => $history,
        ]);
    }
}
