<?php

namespace App\Services;

use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

/**
 * Penomoran OTP (6 digit) untuk alur keamanan password:
 * - lupa password (forgot password) member/admin/vendor
 * - konfirmasi ganti password dari halaman member
 */
class PasswordOtpService
{
    /** Tujuan OTP: verifikasi lupa password. */
    public const PURPOSE_RESET = 'password_reset';

    /** Tujuan OTP: konfirmasi ganti password di halaman akun member. */
    public const PURPOSE_CHANGE = 'change_password';

    /** Masa berlaku kode OTP dalam menit. */
    public const TTL_MINUTES = 10;

    /**
     * Buat kode OTP baru untuk user, simpan ke database, dan kirim via email.
     */
    public function issue(User $user, string $purpose, string $heading, string $body): string
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $user->forceFill([
            'otp_code' => $code,
            'otp_expires_at' => now()->addMinutes(self::TTL_MINUTES),
            'otp_purpose' => $purpose,
        ])->save();

        Mail::to($user->email)->send(new OtpMail($code, $heading, $body));

        return $code;
    }

    /**
     * Cocokkan kode OTP dengan tujuan yang benar dan belum kedaluwarsa.
     */
    public function verify(?User $user, ?string $code, string $purpose): bool
    {
        if (! $user || blank($code) || blank($user->otp_code)) {
            return false;
        }

        if ($user->otp_purpose !== $purpose) {
            return false;
        }

        if (! $user->otp_expires_at || $user->otp_expires_at->isPast()) {
            return false;
        }

        return hash_equals($user->otp_code, $code);
    }

    /**
     * Apakah user punya OTP aktif untuk tujuan tertentu (untuk menampilkan UI resend).     */
    public function hasActiveCode(?User $user, string $purpose): bool
    {
        return $user
            && $user->otp_code
            && $user->otp_purpose === $purpose
            && $user->otp_expires_at
            && $user->otp_expires_at->isFuture();
    }

    /**
     * Hapus kode OTP setelah berhasil dipakai / direset.
     */
    public function clear(User $user): void
    {
        $user->forceFill([
            'otp_code' => null,
            'otp_expires_at' => null,
            'otp_purpose' => null,
        ])->save();
    }
}
