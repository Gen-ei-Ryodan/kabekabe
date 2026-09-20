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

        $pendingPayment = \App\Models\Payment::where('member_id', $user->id)
            ->where('status', \App\Models\Payment::STATUS_PENDING)
            ->with('plan')
            ->latest()
            ->first();

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
            'pending_payment' => $pendingPayment ? [
                'id' => $pendingPayment->id,
                'invoice_number' => $pendingPayment->invoice_number,
                'amount' => (int) $pendingPayment->amount,
                'plan_name' => $pendingPayment->plan?->name,
                'duration_months' => $pendingPayment->period_months,
                'proof_path' => $pendingPayment->proof_path,
                'payment_proof_url' => $pendingPayment->proofUrl(),
                'paid_at' => $pendingPayment->paid_at?->format('d M Y H:i'),
                'created_at' => $pendingPayment->created_at?->format('d M Y H:i'),
                'notes' => $pendingPayment->notes,
            ] : null,
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
