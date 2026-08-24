<?php

namespace App\Services;

use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentService
{
    public function __construct(
        private readonly MembershipService $memberships,
        private readonly NotificationService $notifications,
    ) {}

    public function createPending(User $member, MembershipPlan $plan): Payment
    {
        $payment = $member->payments()->create([
            'invoice_number' => $this->nextInvoiceNumber(),
            'plan_id' => $plan->id,
            'period_months' => $plan->duration_months,
            'amount' => $plan->price,
            'status' => Payment::STATUS_PENDING,
            'paid_at' => now(),
        ]);

        return $payment;
    }

    public function approve(Payment $payment, User $admin, ?string $notes = null): Payment
    {
        return DB::transaction(function () use ($payment, $admin, $notes) {
            $member = $payment->member;
            $membership = $this->memberships->ensureMembership($member);

            $previous = $membership->expires_at;

            $newExpiry = $this->nextExpiry($membership->expires_at, $payment->period_months);

            $payment->forceFill([
                'status' => Payment::STATUS_APPROVED,
                'approved_by' => $admin->id,
                'approved_at' => now(),
                'notes' => $notes,
                'previous_expires_at' => $previous,
                'new_expires_at' => $newExpiry,
            ])->save();

            $membership->forceFill([
                'status' => \App\Models\Membership::STATUS_ACTIVE,
                'started_at' => $membership->started_at ?? now(),
                'expires_at' => $newExpiry,
            ])->save();

            $member->setRelation('membership', $membership->fresh());

            $this->notifications->send(
                $member,
                'Payment Approved',
                "Your membership has been extended until {$newExpiry->format('d M Y')}. Enjoy your member benefits.",
                'membership',
                '/member/history',
            );

            return $payment->fresh();
        });
    }

    public function reject(Payment $payment, User $admin, string $reason): Payment
    {
        $payment->forceFill([
            'status' => Payment::STATUS_REJECTED,
            'approved_by' => $admin->id,
            'approved_at' => now(),
            'notes' => $reason,
        ])->save();

        $this->notifications->send(
            $payment->member,
            'Payment Rejected',
            "Payment {$payment->invoice_number} was rejected. " . ($reason ?: 'Please contact admin for more information.'),
            'membership',
            '/member/history',
        );

        return $payment->fresh();
    }

    public function expireOverduePayments(): int
    {
        return Payment::query()
            ->where('status', Payment::STATUS_PENDING)
            ->where('paid_at', '<', now()->subDays(3))
            ->update(['status' => Payment::STATUS_EXPIRED]);
    }

    private function nextInvoiceNumber(): string
    {
        return 'INV-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
    }

    private function nextExpiry(?Carbon $currentExpiry, int $months): Carbon
    {
        $base = $currentExpiry && $currentExpiry->isFuture() ? $currentExpiry : Carbon::now();

        return (clone $base)->addMonths($months);
    }
}