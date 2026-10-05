<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PasswordOtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Verifikasi OTP 6 digit ke email PIC partner setelah registrasi.
 * Partner belum dianggap terverifikasi (dan belum bisa login) sebelum OTP sukses;
 * setelah OTP sukses status tetap pending menunggu approval admin.
 */
class VerifyOtpController extends Controller
{
    public function __construct(private readonly PasswordOtpService $otp) {}

    public function show(Request $request): Response|RedirectResponse
    {
        $user = $this->pendingUser($request);

        if (! $user) {
            return redirect()->route('partner.register.show');
        }

        return Inertia::render('Partner/VerifyOtp', [
            'email' => $user->email,
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $user = $this->pendingUser($request);

        if (! $user) {
            return redirect()->route('partner.register.show');
        }

        if (! $this->otp->verify($user, $request->input('otp'), PasswordOtpService::PURPOSE_PARTNER_REGISTER)) {
            throw ValidationException::withMessages([
                'otp' => 'Kode OTP salah atau kedaluwarsa.',
            ]);
        }

        $this->otp->clear($user);
        $user->forceFill(['email_verified_at' => now()])->save();

        $request->session()->forget('partner_otp_user_id');

        return redirect()
            ->route('partner.register.thankyou')
            ->with('status', 'Email berhasil diverifikasi. Pendaftaran partner Anda sedang menunggu persetujuan Admin.');
    }

    public function resend(Request $request): RedirectResponse
    {
        $user = $this->pendingUser($request);

        if (! $user) {
            return redirect()->route('partner.register.show');
        }

        $this->otp->issue(
            $user,
            PasswordOtpService::PURPOSE_PARTNER_REGISTER,
            'Verifikasi Email Partner KBKB',
            'Masukkan kode OTP 6 digit untuk menyelesaikan pendaftaran partner Anda.'
        );

        return back()->with('status', "Kode OTP baru dikirim ke {$user->email}.");
    }

    private function pendingUser(Request $request): ?User
    {
        $id = $request->session()->get('partner_otp_user_id');

        if (! $id) {
            return null;
        }

        return User::query()
            ->whereKey($id)
            ->where('role', User::ROLE_VENDOR)
            ->first();
    }
}
