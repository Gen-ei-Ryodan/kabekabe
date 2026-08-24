<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin() || $user->isMember();
    }

    public function view(User $user, Payment $payment): bool
    {
        return $user->isAdmin() || $payment->member_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isMember();
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