<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Services\PasswordOtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
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
            'email' => $partner->email ?? $partner->user?->email,
            // Biodata sudah ada di Master Identity partner → form isian tidak diulang.
            'biodata' => $this->biodata($partner),
        ]);
    }

    /**
     * Biodata partner dari Master Identity (fallback: profile partner / user vendor).
     */
    private function biodata(Partner $partner): array
    {
        $identity = $partner->masterIdentity ?? $partner->user?->masterIdentity;
        $user = $partner->user;
        $pick = fn (string $key) => $identity?->{$key} ?? $user?->{$key};

        $biodata = [
            'name' => $identity?->name ?? $partner->pic_name ?? $user?->name ?? $partner->name,
            'phone' => $identity?->phone ?? $user?->phone ?? $partner->pic_phone ?? $partner->phone,
            'gender' => $pick('gender'),
            'birth_date' => $pick('birth_date'),
            'birth_place' => $pick('birth_place'),
            'marital_status' => $pick('marital_status'),
            'religion' => $pick('religion'),
            'place_of_worship_address' => $pick('place_of_worship_address'),
            'address' => $identity?->address ?? $user?->address,
            'district' => $identity?->district ?? $user?->district,
            'city' => $identity?->city ?? $user?->city,
            'hobbies' => $identity?->hobbies ?? $user?->hobbies ?? [],
        ];

        if (! empty($biodata['birth_date'])) {
            $biodata['birth_date'] = Carbon::parse($biodata['birth_date'])->toDateString();
        }

        return $biodata;
    }

    private function findPartner(string $email): ?Partner
    {
        return Partner::query()
            ->whereRaw('lower(email) = ?', [strtolower($email)])
            ->orWhereHas('user', fn ($q) => $q->whereRaw('lower(email) = ?', [strtolower($email)]))
            ->first();
    }
}
