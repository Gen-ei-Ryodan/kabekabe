<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['type', 'title', 'content', 'image', 'event_date', 'location', 'fee', 'is_published', 'published_at', 'created_by'])]
#[Appends('image_url')]
class CommunityInfo extends Model
{
    use HasFactory;

    public const TYPE_EVENT = 'event';
    public const TYPE_AGENDA = 'agenda';

    public const TYPES = [self::TYPE_EVENT, self::TYPE_AGENDA];

    protected function casts(): array
    {
        return [
            'event_date' => 'datetime',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
            'fee' => 'integer',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(EventAttendance::class, 'event_id');
    }

    public function nonMembers(): HasMany
    {
        return $this->hasMany(EventNonMember::class, 'event_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'event_id');
    }

    public function memberAttendeesCount(): int
    {
        return $this->attendances()->count();
    }

    public function nonMemberAttendeesCount(): int
    {
        return $this->nonMembers()->where('attended', true)->count();
    }

    public function totalAttendeesCount(): int
    {
        return $this->memberAttendeesCount() + $this->nonMemberAttendeesCount();
    }

    public function imageUrl(): ?string
    {
        if (! $this->image) {
            return null;
        }

        return '/storage/' . $this->image;
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->imageUrl();
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }
}
