<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'invoice_number', 'member_id', 'plan_id', 'event_id', 'period_months', 'amount', 'status',
    'paid_at', 'proof_path', 'notes', 'previous_expires_at', 'new_expires_at',
    'approved_by', 'approved_at',
])]
class Payment extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_EXPIRED = 'expired';

    protected function casts(): array
    {
        return [
            'paid_at' => 'datetime',
            'previous_expires_at' => 'datetime',
            'new_expires_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(MembershipPlan::class, 'plan_id');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(CommunityInfo::class, 'event_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function proofUrl(): ?string
    {
        if (! $this->proof_path) {
            return null;
        }

        return '/storage/' . $this->proof_path;
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }
}