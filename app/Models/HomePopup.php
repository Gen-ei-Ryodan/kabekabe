<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['promo_id', 'image_path', 'is_active'])]
class HomePopup extends Model
{
    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function promo(): BelongsTo
    {
        return $this->belongsTo(Promo::class);
    }

    public function imageUrl(): ?string
    {
        return $this->image_path ? '/storage/'.$this->image_path : null;
    }
}
