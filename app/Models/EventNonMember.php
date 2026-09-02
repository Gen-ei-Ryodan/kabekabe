<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['event_id', 'name', 'phone', 'email', 'attended', 'attended_at'])]
class EventNonMember extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'attended' => 'boolean',
            'attended_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(CommunityInfo::class, 'event_id');
    }
}
