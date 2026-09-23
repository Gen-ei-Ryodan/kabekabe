<?php

namespace App\Services;

use App\Mail\AccountApprovedMail;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Throwable;

class ApprovalNotifier
{
    /**
     * Siapkan password awal (jika user belum pernah login/mengganti password)
     * lalu kirim email notifikasi persetujuan ke user.
     *
     * @return bool true jika email berhasil dikirim
     */
    public function notifyApproved(User $user): bool
    {
        $initialPassword = null;

        if ($user->must_change_password) {
            // Password awal: huruf + angka (memenuhi aturan strong password).
            $initialPassword = 'KBKB'.random_int(1000, 9999);
            $user->forceFill(['password' => Hash::make($initialPassword)])->save();
        }

        try {
            Mail::to($user->email)->send(new AccountApprovedMail($user, $initialPassword));

            return true;
        } catch (Throwable $e) {
            report($e);

            return false;
        }
    }
}
