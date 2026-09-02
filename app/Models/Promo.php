<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'partner_id', 'title', 'description', 'discount_type', 'discount_value',
    'min_purchase', 'start_date', 'end_date', 'terms', 'status',
    'rejection_reason', 'is_active', 'sort_number', 'submitted_at', 'reviewed_at', 'reviewed_by',
])]
class Promo extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    public const TYPE_PERCENT = 'percent';
    public const TYPE_NOMINAL = 'nominal';

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class, 'partner_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isActive(): bool
    {
        return $this->status === self::STATUS_APPROVED
            && $this->is_active
            && $this->start_date?->isPast()
            && $this->end_date?->isFuture();
    }

    public function scopeVisibleToMembers(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_APPROVED)
            ->where('is_active', true)
            ->where('start_date', '<=', now()->toDateString())
            ->where('end_date', '>=', now()->toDateString())
            ->with('partner:id,name,category,logo,slug');
    }

    public function discountLabel(): string
    {
        return $this->discount_type === self::TYPE_PERCENT
            ? $this->discount_value . '%'
            : 'Rp' . number_format($this->discount_value, 0, ',', '.');
    }

    public function discountAmountFor(int $total): int
    {
        return $this->discount_type === self::TYPE_PERCENT
            ? (int) round($total * $this->discount_value / 100)
            : min($this->discount_value, $total);
    }
}