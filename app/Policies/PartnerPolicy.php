<?php

namespace App\Policies;

use App\Models\Partner;
use App\Models\User;

class PartnerPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [User::ROLE_ADMIN, User::ROLE_VENDOR, User::ROLE_MEMBER], true);
    }

    public function view(User $user, Partner $partner): bool
    {
        return $user->isAdmin() || $user->isMember() || $partner->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Partner $partner): bool
    {
        return $user->isAdmin() || $partner->user_id === $user->id;
    }

    public function delete(User $user): bool
    {
        return $user->isAdmin();
    }
}