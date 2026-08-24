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
     * Extend a member's membership by the given number of months.
     * The new period starts from the later of now or the current expiry.
     */
    public function extend(User $member, int $months, bool $startNow = false): Membership
    {
        $membership = $this->ensureMembership($member);

        $base = $membership->expires_at && $membership->expires_at->isFuture()
            ? $membership->expires_at
            : Carbon::now();

        $membership->forceFill([
            'status' => Membership::STATUS_ACTIVE,
            'started_at' => $startNow ? Carbon::now() : $membership->started_at ?? Carbon::now(),
            'expires_at' => (clone $base)->addMonths($months),
        ])->save();

        $member->setRelation('membership', $membership->fresh());

        return $membership->fresh();
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