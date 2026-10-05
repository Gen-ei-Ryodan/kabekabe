<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Identitas personal tunggal di balik akun Member dan/atau Partner.
 * 1 identity boleh menaungi 1 member dan/atau banyak partner.
 */
#[Fillable(['name', 'email', 'phone', 'whatsapp', 'birth_date', 'birth_place', 'gender', 'religion', 'marital_status', 'address', 'city', 'district', 'hobbies'])]
class MasterIdentity extends Model
{
    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'hobbies' => 'array',
        ];
    }

    public function members(): HasMany
    {
        return $this->hasMany(User::class, 'master_identity_id')->where('role', User::ROLE_MEMBER);
    }

    public function partners(): HasMany
    {
        return $this->hasMany(Partner::class, 'master_identity_id');
    }

    /**
     * Cari identity berdasar email, buat baru jika belum ada.
     * Email yang sama antara member & partner otomatis berbagi 1 identity.
     */
    public static function forEmail(?string $email, array $attributes = []): ?self
    {
        if (blank($email)) {
            return null;
        }

        $attributes['email'] = $email;

        return self::firstOrCreate(['email' => $email], $attributes);
    }
}
