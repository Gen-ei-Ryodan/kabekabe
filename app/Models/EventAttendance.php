<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['event_id', 'member_id', 'scanned_by_vendor_id', 'scan_token', 'scanned_at', 'ip_address', 'user_agent'])]
#[Appends(['scanned_at_human'])]
class EventAttendance extends Model
{

    protected function casts(): array
    {
        return [
            'scanned_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(CommunityInfo::class, 'event_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    public function scannedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scanned_by_vendor_id');
    }

    public function scopeForEvent(Builder $query, int $eventId): Builder
    {
        return $query->where('event_id', $eventId);
    }

    public function scopeForMember(Builder $query, int $memberId): Builder
    {
        return $query->where('member_id', $memberId);
    }

    public function scopeScanned(Builder $query): Builder
    {
        return $query->whereNotNull('scanned_at');
    }

    public function getScannedAtHumanAttribute(): ?string
    {
        return $this->scanned_at?->diffForHumans();
    }
}