<?php

namespace App\Services;

use App\Models\Membership;
use App\Models\User;
use Illuminate\Support\Carbon;

class MembershipService
{
    public function ensureMembership(User $member): Membership
    {
        $membership = $member->relationLoaded('membership')
            ? $member->membership
            : $member->membership()->first();

        if (! $membership) {
            $membership = $member->membership()->create([
                'status' => Membership::STATUS_INACTIVE,
            ]);
        }

        $member->setRelation('membership', $membership);

        return $membership;
    }

    /**
     * Extend a member's membership by the given number of months (30 days per month).
     * Rules:
     * - Jika pembayaran setelah expired / baru: tgl_pembayaran + (30 * bulan) hari.
     * - Jika pembayaran sebelum expired: tgl_selesai_lama + (30 * bulan) hari + 1 hari.
     */
    public function extend(User $member, int $months, bool $startNow = false, ?Carbon $paymentDate = null): Membership
    {
        $membership = $this->ensureMembership($member);
        $now = $paymentDate ?? Carbon::now();
        $isCurrentlyActive = $membership->expires_at && $membership->expires_at->isFuture();

        if ($startNow || ! $isCurrentlyActive) {
            $startedAt = $now;
            $newExpiry = (clone $now)->addDays($months * 30);
        } else {
            $startedAt = $membership->started_at ?? $now;
            $newExpiry = (clone $membership->expires_at)->addDays($months * 30)->addDay();
        }

        $membership->forceFill([
            'status' => Membership::STATUS_ACTIVE,
            'started_at' => $startedAt,
            'expires_at' => $newExpiry,
        ])->save();

        $member->setRelation('membership', $membership->fresh());

        $this->applyPartnerBundlingAndPromos($member, $months, $newExpiry);

        return $membership->fresh();
    }

    public function applyPartnerBundlingAndPromos(User $member, int $months, Carbon $memberNewExpiry): void
    {
        $partner = $member->partner;
        if (! $partner) {
            return;
        }

        $freeDays = 0;
        $notes = [];

        if ($months >= 12) {
            $freeDays += 360;
            $notes[] = 'Member 1 Tahun (FREE Partner 1 Tahun)';
        } elseif ($months >= 3) {
            $freeDays += 90;
            $notes[] = 'Member 3 Bulan (FREE Partner 3 Bulan)';
        }

        // Cek promo waktu bergabung
        $joined = $member->created_at ?? now();
        if ($joined->year === 2026 && $joined->month === 9) {
            // Bergabung September 2026: partner club gratis Okt & Nov 2026
            $novEnd = Carbon::parse('2026-11-30 23:59:59');
            if (! $partner->expires_at || $partner->expires_at->isBefore($novEnd)) {
                $partner->expires_at = $novEnd;
                $notes[] = 'Promo Sept 2026 (Free Okt-Nov 2026)';
            }
        } elseif ($joined->year === 2026 && $joined->month === 10) {
            // Bergabung Oktober 2026: gratis 30 hari
            $freeDays += 30;
            $notes[] = 'Promo Okt 2026 (Free 30 Hari)';
        } elseif ($joined->year === 2026 && $joined->month === 11) {
            // Bergabung November 2026: gratis jika bayar min 6 bulan
            if ($months >= 6) {
                $freeDays += 180;
                $notes[] = 'Promo Nov 2026 (Min +6 Bulan Free)';
            }
        }

        if ($freeDays > 0) {
            $basePartnerExpiry = $partner->expires_at && $partner->expires_at->isFuture()
                ? $partner->expires_at
                : Carbon::now();
            $partner->expires_at = (clone $basePartnerExpiry)->addDays($freeDays);
        }

        if (! empty($notes)) {
            $partner->status = \App\Models\Partner::STATUS_ACTIVE;
            $partner->is_active = true;
            $partner->save();

            \App\Models\Payment::create([
                'invoice_number' => 'FREE-' . strtoupper(\Illuminate\Support\Str::random(8)),
                'member_id' => $member->id,
                'period_months' => ceil($freeDays / 30),
                'amount' => 0,
                'status' => \App\Models\Payment::STATUS_APPROVED,
                'paid_at' => now(),
                'notes' => implode(', ', $notes) . ' [FREE]',
                'approved_at' => now(),
                'approved_by' => auth()->id(),
            ]);
        }
    }

    public function deactivate(User $member): Membership
    {
        $membership = $this->ensureMembership($member);

        $membership->forceFill([
            'status' => Membership::STATUS_INACTIVE,
        ])->save();

        $member->setRelation('membership', $membership->fresh());

        return $membership->fresh();
    }

    public function activate(User $member, int $months = 12): Membership
    {
        return $this->extend($member, $months, startNow: true);
    }

    /**
     * Activate a member's membership until an explicit expiry date.
     */
    public function activateUntil(User $member, string|Carbon $expiresAt): Membership
    {
        $membership = $this->ensureMembership($member);

        $membership->forceFill([
            'status' => Membership::STATUS_ACTIVE,
            'started_at' => Carbon::now(),
            'expires_at' => Carbon::parse($expiresAt)->endOfDay(),
        ])->save();

        $member->setRelation('membership', $membership->fresh());

        return $membership->fresh();
    }

    public function isActive(User $member): bool
    {
        return $member->hasActiveMembership();
    }
}