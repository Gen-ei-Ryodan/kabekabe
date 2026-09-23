<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PasswordOtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset request by sending an OTP code to the email.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ], [
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
        ]);

        $email = $request->string('email')->toString();

        $user = User::query()->where('email', $email)->first();

        if ($user) {
            app(PasswordOtpService::class)->issue(
                $user,
                PasswordOtpService::PURPOSE_RESET,
                'Kode OTP Reset Password',
                'Gunakan kode 6 digit di bawah ini untuk melanjutkan proses reset password akun KBKB Anda.',
            );
        }

        // Selalu arahkan ke halaman verifikasi OTP tanpa mengungkap apakah email terdaftar.
        $request->session()->put('password_reset_email', $email);
        $request->session()->forget('password_reset_verified');

        return redirect()
            ->route('password.otp')
            ->with('status', 'Jika email terdaftar, kode OTP sudah dikirim ke email Anda.');
    }
}
