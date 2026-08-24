<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'type', 'promo_id', 'agenda_id', 'sort_order', 'is_active',
])]
class HomeBanner extends Model
{
    use HasFactory;

    public const TYPE_PROMO = 'promo';
    public const TYPE_AGENDA = 'agenda';

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function promo(): BelongsTo
    {
        return $this->belongsTo(Promo::class, 'promo_id');
    }

    public function agenda(): BelongsTo
    {
        return $this->belongsTo(CommunityInfo::class, 'agenda_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
