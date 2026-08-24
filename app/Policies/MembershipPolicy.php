<?php

namespace App\Policies;

use App\Models\Membership;
use App\Models\User;

class MembershipPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isMember();
    }

    public function view(User $user, Membership $membership): bool
    {
        return $user->isAdmin() || $membership->member_id === $user->id;
    }

    public function update(User $user): bool
    {
        return $user->isAdmin();
    }
}