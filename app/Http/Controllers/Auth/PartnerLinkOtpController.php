<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Services\PasswordOtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * Alur linking Partner saat registrasi Member ("Are you a Partner?").
 * Calon member meminta OTP ke email partner, memverifikasikannya lebih dulu,
 * baru registrasi member disimpan dan partner otomatis ter-link.
 */
class PartnerLinkOtpController extends Controller
{
    public function __construct(private readonly PasswordOtpService $otp) {}

    /**
     * Kirim OTP 6 digit ke email partner yang terdaftar.
     */
    public function request(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'partner_email' => ['required', 'email', 'max:255'],
        ]);

        $partner = $this->findPartner($validated['partner_email']);

        if (! $partner) {
            throw ValidationException::withMessages([
                'partner_email' => 'Email partner belum terdaftar.',
            ]);
        }

        if ($partner->member_user_id !== null) {
            throw ValidationException::withMessages([
                'partner_email' => 'Partner sudah terhubung dengan Member lain.',
            ]);
        }

        $user = $partner->user;

        if (! $user) {
            throw ValidationException::withMessages([
                'partner_email' => 'Email partner belum terdaftar.',
            ]);
        }

        $this->otp->issue(
            $user,
            PasswordOtpService::PURPOSE_PARTNER_LINK,
            'Permintaan Linking Partner KBKB',
            'Seorang calon member meminta menghubungkan akun Anda. Masukkan kode OTP 6 digit untuk menyetujui.'
        );

        $request->session()->put('partner_link_email', strtolower($validated['partner_email']));
        $request->session()->put('partner_link_partner_id', $partner->id);
        $request->session()->forget('partner_link_verified_partner_id');

        return response()->json([
            'ok' => true,
            'email' => $user->email,
        ]);
    }

    /**
     * Verifikasi OTP dari email partner (sebelum submit registrasi member).
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $partnerId = $request->session()->get('partner_link_partner_id');
        $partner = $partnerId ? Partner::query()->find($partnerId) : null;

        if (! $partner || ! $partner->user) {
            throw ValidationException::withMessages([
                'otp' => 'Permintaan OTP tidak ditemukan. Kirim ulang kode terlebih dahulu.',
            ]);
        }

        if ($partner->member_user_id !== null) {
            throw ValidationException::withMessages([
                'otp' => 'Partner sudah terhubung dengan Member lain.',
            ]);
        }

        if (! $this->otp->verify($partner->user, $request->input('otp'), PasswordOtpService::PURPOSE_PARTNER_LINK)) {
            throw ValidationException::withMessages([
                'otp' => 'Kode OTP salah atau kedaluwarsa.',
            ]);
        }

        $this->otp->clear($partner->user);
        $request->session()->put('partner_link_verified_partner_id', $partner->id);

        return response()->json([
            'ok' => true,
            'partner' => $partner->name,
        ]);
    }

    private function findPartner(string $email): ?Partner
    {
        return Partner::query()
            ->whereRaw('lower(email) = ?', [strtolower($email)])
            ->orWhereHas('user', fn ($q) => $q->whereRaw('lower(email) = ?', [strtolower($email)]))
            ->first();
    }
}
