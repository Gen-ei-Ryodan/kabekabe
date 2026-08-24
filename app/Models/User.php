<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

#[Fillable(['name', 'email', 'password', 'role', 'phone', 'whatsapp', 'company', 'avatar', 'member_code', 'card_token', 'notification_settings'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const ROLE_MEMBER = 'member';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_VENDOR = 'vendor';

    public const ROLES = [self::ROLE_MEMBER, self::ROLE_ADMIN, self::ROLE_VENDOR];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'notification_settings' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if ($user->role === self::ROLE_MEMBER) {
                $user->card_token ??= (string) Str::uuid();
                $user->member_code ??= self::nextMemberCode();
            }
        });
    }

    private static function nextMemberCode(): string
    {
        $last = static::query()->where('role', self::ROLE_MEMBER)
            ->orderByDesc('id')
            ->value('member_code');

        $next = $last ? ((int) str_replace('MMB-', '', $last)) + 1 : 1;

        return 'MMB-' . str_pad((string) $next, 5, '0', STR_PAD_LEFT);
    }

    public function membership(): HasOne
    {
        return $this->hasOne(Membership::class, 'member_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'member_id');
    }

    public function memberTransactions(): HasMany
    {
        return $this->hasMany(Transaction::class, 'member_id');
    }

    public function partner(): HasOne
    {
        return $this->hasOne(Partner::class, 'user_id');
    }

    public function appNotifications(): HasMany
    {
        return $this->hasMany(AppNotification::class, 'user_id');
    }

    public function communityInfos(): HasMany
    {
        return $this->hasMany(CommunityInfo::class, 'created_by');
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isVendor(): bool
    {
        return $this->role === self::ROLE_VENDOR;
    }

    public function isMember(): bool
    {
        return $this->role === self::ROLE_MEMBER;
    }

    public function homeRoute(): string
    {
        return match ($this->role) {
            self::ROLE_ADMIN => 'admin.dashboard',
            self::ROLE_VENDOR => 'vendor.dashboard',
            default => 'member.home',
        };
    }

    public function hasActiveMembership(): bool
    {
        return $this->membership?->isActive() ?? false;
    }

    public function membershipIsActive(): bool
    {
        return $this->hasActiveMembership();
    }

    public function membershipExpiresAt(): ?string
    {
        return $this->membership?->expires_at;
    }

    public function ensureCardToken(): string
    {
        if ($this->card_token) {
            return $this->card_token;
        }

        $token = Str::uuid()->toString();

        $this->forceFill(['card_token' => $token])->save();

        return $token;
    }

    public function ensureMemberCode(): string
    {
        if ($this->member_code) {
            return $this->member_code;
        }

        $code = 'MMB-' . str_pad((string) ($this->id ?? 0), 5, '0', STR_PAD_LEFT);

        $this->forceFill(['member_code' => $code])->save();

        return $code;
    }

    public function avatarUrl(): ?string
    {
        if (! $this->avatar) {
            return null;
        }

        return '/storage/' . $this->avatar;
    }
}