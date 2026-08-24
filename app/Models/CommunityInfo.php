<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['type', 'title', 'content', 'image', 'event_date', 'location', 'is_published', 'published_at', 'created_by'])]
#[Appends('image_url')]
class CommunityInfo extends Model
{
    use HasFactory;

    public const TYPE_EVENT = 'event';
    public const TYPE_ANNOUNCEMENT = 'announcement';
    public const TYPE_NEWS = 'news';
    public const TYPE_AGENDA = 'agenda';

    public const TYPES = [self::TYPE_EVENT, self::TYPE_ANNOUNCEMENT, self::TYPE_NEWS, self::TYPE_AGENDA];

    protected function casts(): array
    {
        return [
            'event_date' => 'datetime',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
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