<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class BillingController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $user->load('membership.plan');

        $membership = $user->membership;
        $isActive = $user->hasActiveMembership();

        // 1. Auto-expire unpaid pending payments older than 24 hours
        \App\Models\Payment::where('member_id', $user->id)
            ->where('status', \App\Models\Payment::STATUS_PENDING)
            ->whereNull('proof_path')
            ->where('created_at', '<', now()->subHours(24))
            ->update(['status' => \App\Models\Payment::STATUS_EXPIRED]);

        // 2. Fetch 1 active order (pending within 24h or already has proof, or recently approved within 24h)
        $activePayment = \App\Models\Payment::where('member_id', $user->id)
            ->where(function ($q) {
                $q->where(function ($sub) {
                    $sub->where('status', \App\Models\Payment::STATUS_PENDING)
                        ->where(function ($s2) {
                            $s2->whereNotNull('proof_path')
                               ->orWhere('created_at', '>=', now()->subHours(24));
                        });
                })->orWhere(function ($sub) {
                    $sub->where('status', \App\Models\Payment::STATUS_APPROVED)
                        ->where('approved_at', '>=', now()->subHours(24));
                });
            })
            ->with('plan')
            ->latest()
            ->first();

        $activeBill = null;
        if ($activePayment) {
            $stage = 'unpaid';
            $stageLabel = 'Belum Dibayar';

            if ($activePayment->status === \App\Models\Payment::STATUS_APPROVED) {
                $stage = 'processed';
                $stageLabel = 'Sudah Diproses (Lunas)';
            } elseif ($activePayment->proof_path) {
                $stage = 'paid';
                $stageLabel = 'Sudah Dibayar (Menunggu Verifikasi Admin)';
            }

            $expiresAt = $activePayment->created_at ? $activePayment->created_at->addHours(24) : now()->addHours(24);
            $remainingSeconds = max(0, now()->diffInSeconds($expiresAt, false));

            $activeBill = [
                'id' => $activePayment->id,
                'invoice_number' => $activePayment->invoice_number,
                'amount' => (int) $activePayment->amount,
                'plan_id' => $activePayment->plan_id,
                'plan_name' => $activePayment->plan?->name ?? "Paket {$activePayment->period_months} Bulan",
                'duration_months' => $activePayment->period_months,
                'stage' => $stage, // 'unpaid' | 'paid' | 'processed'
                'stage_label' => $stageLabel,
                'proof_path' => $activePayment->proof_path,
                'payment_proof_url' => $activePayment->proofUrl(),
                'paid_at' => $activePayment->paid_at?->translatedFormat('d M Y H:i'),
                'approved_at' => $activePayment->approved_at?->translatedFormat('d M Y H:i'),
                'created_at' => $activePayment->created_at->translatedFormat('d M Y H:i'),
                'expires_at_timestamp' => $expiresAt->timestamp,
                'remaining_seconds' => $remainingSeconds,
            ];
        }

        return Inertia::render('Member/Account/Billing', [
            'membership' => [
                'status' => $isActive ? 'active' : 'inactive',
                'status_label' => $isActive ? 'ACTIVE' : 'INACTIVE',
                'started_at' => $membership?->started_at?->format('d M Y'),
                'expires_at' => $membership?->expires_at?->format('d M Y'),
                'days_remaining' => $membership?->expires_at?->diffInDays(now()),
                'plan' => $membership?->plan ? [
                    'name' => $membership->plan->name,
                    'duration_months' => $membership->plan->duration_months,
                    'price' => number_format($membership->plan->price, 0, ',', '.'),
                ] : null,
            ],
            'admin_fee' => (int) config('services.doku.admin_fee', 0),
            'active_bill' => $activeBill,
            'plans' => \App\Models\MembershipPlan::where('is_active', true)
                ->orderBy('duration_months')
                ->get()
                ->map(fn ($plan) => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'duration_months' => $plan->duration_months,
                    'price_raw' => (int) $plan->price,
                    'price' => number_format($plan->price, 0, ',', '.'),
                ]),
        ]);
    }
}
