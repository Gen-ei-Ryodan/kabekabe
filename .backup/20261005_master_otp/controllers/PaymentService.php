<?php

namespace App\Services;

use App\Models\Membership;
use App\Models\MembershipDiscountCode;
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

    public function approve(Payment $payment, ?User $admin = null, ?string $notes = null): Payment
    {
        return DB::transaction(function () use ($payment, $admin, $notes) {
            $member = $payment->member;
            $membership = $this->memberships->ensureMembership($member);

            $previous = $membership->expires_at;

            $paidAt = $payment->paid_at ? Carbon::parse($payment->paid_at) : Carbon::now();
            $newExpiry = $this->nextExpiry($membership->expires_at, $payment->period_months, $paidAt);

            $payment->forceFill([
                'status' => Payment::STATUS_APPROVED,
                'approved_by' => $admin?->id,
                'approved_at' => now(),
                // Gabung, jangan timpa: keterangan promo/diskon wajib tetap tercatat.
                'notes' => $this->mergeNotes($payment->notes, $notes),
                'previous_expires_at' => $previous,
                'new_expires_at' => $newExpiry,
            ])->save();

            $membership->forceFill([
                'status' => Membership::STATUS_ACTIVE,
                'started_at' => $membership->started_at ?? $paidAt,
                'expires_at' => $newExpiry,
            ])->save();

            $member->setRelation('membership', $membership->fresh());

            // Terapkan bundling promo Partner jika berlaku
            $this->memberships->applyPartnerBundlingAndPromos($member, $payment->period_months, $newExpiry);

            $this->notifications->send(
                $member,
                'Pembayaran Disetujui',
                "Membership Anda telah diperpanjang hingga {$newExpiry->translatedFormat('d F Y')}. Nikmati berbagai keuntungan member.",
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
            'Pembayaran Ditolak',
            "Pembayaran {$payment->invoice_number} ditolak. ".($reason ?: 'Silakan hubungi admin untuk informasi lebih lanjut.'),
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

    /**
     * Satu jalur untuk klaim promo/checkout senilai Rp0.
     * Selalu membuat record payment dengan amount 0 + keterangan diskon/promo terpakai.
     */
    public function claimFreeMembership(
        User $member,
        MembershipPlan $plan,
        ?MembershipDiscountCode $discountCode = null,
        string $channel = 'promo',
    ): Payment {
        return DB::transaction(function () use ($member, $plan, $discountCode, $channel) {
            $planPrice = (int) $plan->price;
            $discountAmount = $discountCode ? $discountCode->calculateDiscount($planPrice) : 0;

            $payment = $this->createPending($member, $plan);

            $notes = "Checkout Rp0 ({$channel}) | Harga Paket: Rp".number_format($planPrice, 0, ',', '.');
            if ($discountCode) {
                $notes .= " | Promo ({$discountCode->code}): -Rp".number_format($discountAmount, 0, ',', '.');
            }
            $notes .= ' | Total Dibayar: Rp0';

            $payment->forceFill([
                'amount' => 0,
                'paid_at' => now(),
                'notes' => $notes,
            ])->save();

            $this->approve($payment, null, $discountCode
                ? "Aktivasi Membership via Voucher {$discountCode->code}"
                : 'Aktivasi Membership Gratis (Rp0)');

            if ($discountCode) {
                $discountCode->increment('used_count');
            }

            return $payment->fresh();
        });
    }

    private function mergeNotes(?string $existing, ?string $extra): ?string
    {
        $existing = trim((string) $existing);
        $extra = trim((string) $extra);

        if ($extra === '') {
            return $existing !== '' ? $existing : null;
        }

        if ($existing === '' || str_contains($existing, $extra)) {
            return $existing === '' ? $extra : $existing;
        }

        return $existing.' | '.$extra;
    }

    private function nextInvoiceNumber(): string
    {
        return 'INV-'.now()->format('Ymd').'-'.strtoupper(Str::random(6));
    }

    private function nextExpiry(?Carbon $currentExpiry, int $months, ?Carbon $paymentDate = null): Carbon
    {
        $now = $paymentDate ?? Carbon::now();

        if ($currentExpiry && $currentExpiry->isFuture()) {
            return (clone $currentExpiry)->addDays($months * 30)->addDay();
        }

        return (clone $now)->addDays($months * 30);
    }
}
