<?php

namespace App\Policies;

use App\Models\Promo;
use App\Models\User;

class PromoPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [User::ROLE_ADMIN, User::ROLE_VENDOR], true);
    }

    public function view(User $user, Promo $promo): bool
    {
        return $user->isAdmin()
            || ($user->isVendor() && $promo->partner->user_id === $user->id);
    }

    public function create(User $user): bool
    {
        return $user->isVendor();
    }

    public function update(User $user, Promo $promo): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isVendor()
            && $promo->partner->user_id === $user->id
            && $promo->status === Promo::STATUS_REJECTED;
    }

    public function delete(User $user, Promo $promo): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isVendor()
            && $promo->partner->user_id === $user->id
            && in_array($promo->status, [Promo::STATUS_PENDING, Promo::STATUS_REJECTED], true);
    }

    public function approve(User $user): bool
    {
        return $user->isAdmin();
    }

    public function reject(User $user): bool
    {
        return $user->isAdmin();
    }
}