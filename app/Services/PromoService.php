<?php

namespace App\Services;

use App\Models\Promo;
use App\Models\User;

class PromoService
{
    public function __construct(
        private readonly NotificationService $notifications,
    ) {}

    public function submit(Promo $promo, User $vendor): Promo
    {
        $promo->forceFill([
            'status' => Promo::STATUS_PENDING,
            'submitted_at' => now(),
            'reviewed_at' => null,
            'reviewed_by' => null,
            'rejection_reason' => null,
        ])->save();

        $this->notifications->send(
            User::query()->where('role', User::ROLE_ADMIN)->first()?->id
                ?? throw new \RuntimeException('Admin not found.'),
            'New Promo Pending Review',
            "Promo \"{$promo->title}\" from {$promo->partner->name} is awaiting approval.",
            'promo',
            route('admin.promos.index', ['status' => 'pending']),
        );

        return $promo->fresh();
    }

    public function approve(Promo $promo, User $admin): Promo
    {
        $promo->forceFill([
            'status' => Promo::STATUS_APPROVED,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
            'rejection_reason' => null,
        ])->save();

        $this->notifications->broadcastToMembers(
            'New Promo Available',
            "Promo \"{$promo->title}\" from {$promo->partner->name} is now available to active members.",
            'promo',
            route('member.promos.show', $promo),
        );

        return $promo->fresh();
    }

    public function reject(Promo $promo, User $admin, string $reason): Promo
    {
        $promo->forceFill([
            'status' => Promo::STATUS_REJECTED,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
            'rejection_reason' => $reason,
        ])->save();

        $this->notifications->send(
            $promo->partner->user,
            'Promo Rejected',
            "Promo \"{$promo->title}\" was rejected. Reason: {$reason}",
            'promo',
            route('vendor.promos.edit', $promo),
        );

        return $promo->fresh();
    }
}