<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PasswordOtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordOtpController extends Controller
{
    /**
     * Display the OTP verification view for the forgot-password flow.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $email = $request->session()->get('password_reset_email');

        if (! $email) {
            return redirect()->route('password.request');
        }

        return Inertia::render('Auth/ForgotPasswordOtp', [
            'email' => $email,
            'status' => session('status'),
        ]);
    }

    /**
     * Verify the OTP code the user received by email.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $email = $request->session()->get('password_reset_email');

        if (! $email) {
            return redirect()->route('password.request');
        }

        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ], [
            'otp.required' => 'Kode OTP wajib diisi.',
            'otp.size' => 'Kode OTP harus terdiri dari 6 digit.',
        ], [
            'otp' => 'kode OTP',
        ]);

        $user = User::query()->where('email', $email)->first();

        if (! app(PasswordOtpService::class)->verify($user, $request->string('otp')->toString(), PasswordOtpService::PURPOSE_RESET)) {
            throw ValidationException::withMessages([
                'otp' => 'Kode OTP salah atau sudah kedaluwarsa. Silakan minta kode baru.',
            ]);
        }

        $request->session()->put('password_reset_verified', true);

        return redirect()->route('password.reset');
    }

    /**
     * Resend a new OTP code for the forgot-password flow.
     */
    public function resend(Request $request): RedirectResponse
    {
        $email = $request->session()->get('password_reset_email');

        if (! $email) {
            return redirect()->route('password.request');
        }

        $user = User::query()->where('email', $email)->first();

        if ($user) {
            app(PasswordOtpService::class)->issue(
                $user,
                PasswordOtpService::PURPOSE_RESET,
                'Kode OTP Reset Password',
                'Ini adalah kode OTP baru untuk proses reset password akun KBKB Anda.',
            );
        }

        $request->session()->forget('password_reset_verified');

        return back()->with('status', 'Kode OTP baru sudah dikirim (jika email terdaftar).');
    }
}
