<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;

#[Fillable(['member_id', 'status', 'started_at', 'expires_at'])]
class Membership extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    public function plan(): HasOneThrough
    {
        return $this->hasOneThrough(
            MembershipPlan::class,
            Payment::class,
            'member_id',
            'id',
            'member_id',
            'plan_id',
        )
            ->where('payments.status', Payment::STATUS_APPROVED)
            ->latest('payments.approved_at');
    }

    public function getLatestPlan()
    {
        $latestPayment = Payment::where('member_id', $this->member_id)
            ->where('status', Payment::STATUS_APPROVED)
            ->whereNotNull('plan_id')
            ->latest('approved_at')
            ->first();

        return $latestPayment?->plan;
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE
            && $this->expires_at !== null
            && $this->expires_at->isAfter(now());
    }

    public function isExpiringSoon(int $days = 7): bool
    {
        return $this->isActive() && $this->expires_at->isBetween(now(), now()->addDays($days));
    }
}