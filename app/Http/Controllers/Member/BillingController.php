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
            'plans' => \App\Models\MembershipPlan::where('is_active', true)
                ->orderBy('duration_months')
                ->get()
                ->map(fn ($plan) => [
                    'id' => $plan->id,
                    'name' => $plan->name,
                    'duration_months' => $plan->duration_months,
                    'price' => number_format($plan->price, 0, ',', '.'),
                ]),
        ]);
    }
}
