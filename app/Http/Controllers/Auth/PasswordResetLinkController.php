<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PasswordOtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    public const PORTALS = ['member', 'partner', 'admin'];

    /**
     * Display the password reset link request view.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
            'portal' => static::portal($request->query('portal')),
        ]);
    }

    /**
     * Handle an incoming password reset request by sending an OTP code to the email.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'portal' => ['nullable', Rule::in(self::PORTALS)],
        ], [
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
            'portal.in' => 'Portal tidak valid.',
        ]);

        $email = $request->string('email')->toString();
        $portal = static::portal($request->input('portal'));
        $role = User::roleForPortal($portal);

        $user = User::query()
            ->where('email', $email)
            ->where('role', $role)
            ->first();

        if (! $user) {
            $portalLabel = strtoupper($portal);
            throw \Illuminate\Validation\ValidationException::withMessages([
                'email' => "Email tidak terdaftar sebagai akun $portalLabel.",
            ]);
        }

        $portalUpper = strtoupper($portal);
        app(PasswordOtpService::class)->issue(
            $user,
            PasswordOtpService::PURPOSE_RESET,
            "Kode OTP Reset Password $portalUpper",
            "Gunakan kode 6 digit di bawah ini untuk melanjutkan proses reset password akun $portalUpper KBKB Anda.",
        );

        $request->session()->put('password_reset_email', $email);
        $request->session()->put('password_reset_role', $role);
        $request->session()->forget('password_reset_verified');

        return redirect()
            ->route('password.otp')
            ->with('status', 'Kode OTP telah dikirim ke email Anda.');
    }

    private static function portal(mixed $value): string
    {
        return in_array($value, self::PORTALS, true) ? (string) $value : 'member';
    }
}
