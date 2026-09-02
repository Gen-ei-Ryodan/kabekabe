<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable(['user_id', 'name', 'slug', 'category', 'description', 'address', 'phone', 'email', 'logo', 'is_active', 'sort_number'])]
#[Appends('logo_url')]
class Partner extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function promos(): HasMany
    {
        return $this->hasMany(Promo::class, 'partner_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'partner_id');
    }

    public function logoUrl(): ?string
    {
        if (! $this->logo) {
            return null;
        }

        return '/storage/' . $this->logo;
    }

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logoUrl();
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public static function slugFor(string $name): string
    {
        return Str::slug($name) . '-' . Str::lower(Str::random(4));
    }
}