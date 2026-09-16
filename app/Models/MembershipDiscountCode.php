<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'code',
    'name',
    'discount_type',
    'discount_value',
    'is_active',
    'max_uses',
    'used_count',
    'expires_at',
])]
class MembershipDiscountCode extends Model
{
    use HasFactory;

    public const TYPE_PERCENT = 'percent';
    public const TYPE_NOMINAL = 'nominal';

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'discount_value' => 'integer',
            'max_uses' => 'integer',
            'used_count' => 'integer',
            'expires_at' => 'datetime',
        ];
    }

    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        if ($this->max_uses !== null && $this->used_count >= $this->max_uses) {
            return false;
        }

        return true;
    }

    public function calculateDiscount(int $originalPrice): int
    {
        if (! $this->isValid()) {
            return 0;
        }

        if ($this->discount_type === self::TYPE_PERCENT) {
            $discount = (int) round(($originalPrice * $this->discount_value) / 100);
            return min($discount, $originalPrice);
        }

        return min($this->discount_value, $originalPrice);
    }
}
