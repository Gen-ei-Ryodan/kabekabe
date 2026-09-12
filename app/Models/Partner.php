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

#[Fillable(['user_id', 'name', 'slug', 'category', 'description', 'address', 'phone', 'email', 'logo', 'is_active', 'status', 'expires_at', 'sort_number', 'total_belanja', 'diskon1', 'diskon2', 'diskon3'])]
#[Appends('logo_url')]
class Partner extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'expires_at' => 'datetime',
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

    public function isActive(): bool
    {
        return $this->status === self::STATUS_ACTIVE
            && $this->is_active
            && ($this->expires_at === null || $this->expires_at->isFuture());
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('status')->orWhere('status', self::STATUS_ACTIVE);
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            });
    }

    public static function slugFor(string $name): string
    {
        return Str::slug($name) . '-' . Str::lower(Str::random(4));
    }
}