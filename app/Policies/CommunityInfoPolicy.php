<?php

namespace App\Policies;

use App\Models\CommunityInfo;
use App\Models\User;

class CommunityInfoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isMember() || $user->isAdmin();
    }

    public function view(User $user, CommunityInfo $info): bool
    {
        return $user->isAdmin() || $info->is_published;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, CommunityInfo $info): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, CommunityInfo $info): bool
    {
        return $user->isAdmin();
    }
}