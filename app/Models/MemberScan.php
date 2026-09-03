<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['member_id', 'scanned_by_vendor_id', 'scanned_at', 'expires_at', 'ip_address'])]
#[Appends(['expires_in_human'])]
class MemberScan extends Model
{
    public const SCAN_WINDOW_HOURS = 48;

    protected $table = 'member_scans';

    public static function startFor(int $memberId, int $vendorId, ?string $ip = null): self
    {
        return self::create([
            'member_id' => $memberId,
            'scanned_by_vendor_id' => $vendorId,
            'scanned_at' => now(),
            'expires_at' => now()->addHours(self::SCAN_WINDOW_HOURS),
            'ip_address' => $ip,
        ]);
    }

    protected function casts(): array
    {
        return [
            'scanned_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    public function scannedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scanned_by_vendor_id');
    }

    public function transaction(): HasOne
    {
        return $this->hasOne(Transaction::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('expires_at', '>', now());
    }

    public function scopeForVendor(Builder $query, int $vendorId): Builder
    {
        return $query->where('scanned_by_vendor_id', $vendorId);
    }

    public function scopeForMember(Builder $query, int $memberId): Builder
    {
        return $query->where('member_id', $memberId);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function getExpiresInHumanAttribute(): ?string
    {
        if (! $this->expires_at) return null;
        if ($this->isExpired()) return 'Expired';
        return $this->expires_at->diffForHumans();
    }
}
