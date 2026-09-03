<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'transaction_number', 'partner_id', 'member_id', 'member_scan_id', 'promo_id', 'total_amount',
    'discount_percent', 'discount_amount', 'net_amount', 'note', 'proof_path', 'transacted_at',
])]
class Transaction extends Model
{
    use HasFactory;

    protected $appends = ['proof_url'];

    protected function casts(): array
    {
        return [
            'transacted_at' => 'datetime',
        ];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class, 'partner_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    public function memberScan(): BelongsTo
    {
        return $this->belongsTo(MemberScan::class);
    }

    public function promo(): BelongsTo
    {
        return $this->belongsTo(Promo::class, 'promo_id');
    }

    public function proofUrl(): ?string
    {
        if (! $this->proof_path) {
            return null;
        }

        return '/storage/' . $this->proof_path;
    }

    public function getProofUrlAttribute(): ?string
    {
        return $this->proofUrl();
    }

    public function scopeForVendor(Builder $query, int $partnerId): Builder
    {
        return $query->where('partner_id', $partnerId);
    }

    public function scopeBetween(Builder $query, ?string $from, ?string $to): Builder
    {
        return $query->when($from, fn ($q) => $q->whereDate('transacted_at', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('transacted_at', '<=', $to));
    }
}
