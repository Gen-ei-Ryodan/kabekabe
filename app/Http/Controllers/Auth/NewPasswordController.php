<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PasswordOtpService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    /**
     * Display the password reset view (only after OTP verification).
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $email = $request->session()->get('password_reset_email');
        $verified = (bool) $request->session()->get('password_reset_verified');

        if (! $email || ! $verified) {
            return redirect()
                ->route('password.request')
                ->with('status', 'Silakan minta dan verifikasi kode OTP terlebih dahulu.');
        }

        return Inertia::render('Auth/ResetPassword', [
            'email' => $email,
        ]);
    }

    /**
     * Handle an incoming new password request (guarded by a verified OTP in session).
     */
    public function store(Request $request): RedirectResponse
    {
        $email = $request->session()->get('password_reset_email');
        $verified = (bool) $request->session()->get('password_reset_verified');

        if (! $email || ! $verified) {
            return redirect()
                ->route('password.request')
                ->with('status', 'Silakan minta dan verifikasi kode OTP terlebih dahulu.');
        }

        $request->validate([
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'password.required' => 'Password baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        $user = User::query()->where('email', $email)->first();

        if ($user) {
            $user->forceFill([
                'password' => Hash::make($request->password),
                'remember_token' => Str::random(60),
            ])->save();

            app(PasswordOtpService::class)->clear($user);

            event(new PasswordReset($user));
        }

        $request->session()->forget(['password_reset_email', 'password_reset_verified']);
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('login')
            ->with('status', 'Password berhasil direset. Silakan masuk dengan password baru Anda.');
    }
}
