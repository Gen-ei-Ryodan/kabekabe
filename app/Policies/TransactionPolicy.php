<?php

namespace App\Policies;

use App\Models\Transaction;
use App\Models\User;

class TransactionPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, [User::ROLE_ADMIN, User::ROLE_VENDOR, User::ROLE_MEMBER], true);
    }

    public function view(User $user, Transaction $transaction): bool
    {
        return $user->isAdmin()
            || ($user->isVendor() && $transaction->partner->user_id === $user->id)
            || $transaction->member_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isVendor();
    }

    public function recordForActiveMember(User $user): bool
    {
        return $user->isVendor();
    }
}