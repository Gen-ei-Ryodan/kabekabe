<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id', 'guard', 'portal', 'ip_address', 'user_agent',
    'browser', 'platform', 'device', 'location',
])]
class UserLoginLog extends Model
{
    use HasFactory;

    public const PORTAL_MEMBER = 'member';

    public const PORTAL_PARTNER = 'partner';

    public const PORTAL_ADMIN = 'admin';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function deviceLabel(): string
    {
        return trim(($this->device ?: '').' · '.($this->platform ?: '').' · '.($this->browser ?: ''), ' ·')
            ?: 'Tidak dikenal';
    }
}
