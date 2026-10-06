<?php

namespace App\Http\Controllers\Partner;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\PasswordOtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

/**
 * Alur linking Member saat registrasi Partner ("Apakah Anda sudah memiliki akun Member?").
 * Calon partner meminta OTP ke email member, memverifikasikannya lebih dulu,
 * baru registrasi partner disimpan dan otomatis ter-link ke member tersebut
 * (partner.master_identity_id = master_identity_id milik member).
 */
class MemberLinkOtpController extends Controller
{
    public function __construct(private readonly PasswordOtpService $otp) {}

    /**
     * Kirim OTP 6 digit ke email member yang terdaftar.
     */
    public function request(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'member_email' => ['required', 'email', 'max:255'],
        ]);

        $member = $this->findMember($validated['member_email']);

        if (! $member) {
            throw ValidationException::withMessages([
                'member_email' => 'Email member belum terdaftar.',
            ]);
        }

        $this->otp->issue(
            $member,
            PasswordOtpService::PURPOSE_MEMBER_LINK,
            'Permintaan Linking Member KBKB',
            'Seorang calon partner meminta menghubungkan akun Anda. Masukkan kode OTP 6 digit untuk menyetujui.'
        );

        $request->session()->put('member_link_email', strtolower($validated['member_email']));
        $request->session()->put('member_link_user_id', $member->id);
        $request->session()->forget('member_link_verified_user_id');

        return response()->json([
            'ok' => true,
            'email' => $member->email,
        ]);
    }

    /**
     * Verifikasi OTP dari email member (sebelum submit registrasi partner).
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'otp' => ['required', 'string', 'size:6'],
        ]);

        $memberId = $request->session()->get('member_link_user_id');
        $member = $memberId ? User::query()->where('role', User::ROLE_MEMBER)->find($memberId) : null;

        if (! $member) {
            throw ValidationException::withMessages([
                'otp' => 'Permintaan OTP tidak ditemukan. Kirim ulang kode terlebih dahulu.',
            ]);
        }

        if (! $this->otp->verify($member, $request->input('otp'), PasswordOtpService::PURPOSE_MEMBER_LINK)) {
            throw ValidationException::withMessages([
                'otp' => 'Kode OTP salah atau kedaluwarsa.',
            ]);
        }

        $this->otp->clear($member);
        $request->session()->put('member_link_verified_user_id', $member->id);

        return response()->json([
            'ok' => true,
            'member' => $member->name,
            'email' => $member->email,
            // Biodata sudah ada di Master Identity member → form isian tidak diulang.
            'biodata' => $this->biodata($member),
        ]);
    }

    /**
     * Biodata member dari Master Identity (fallback: profile user member).
     */
    private function biodata(User $member): array
    {
        $identity = $member->masterIdentity;
        $pick = fn (string $key) => $identity?->{$key} ?? $member->{$key};

        $biodata = [
            'name' => $identity?->name ?? $member->name,
            'phone' => $identity?->phone ?? $member->phone ?? $member->whatsapp,
            'gender' => $pick('gender'),
            'birth_date' => $pick('birth_date'),
            'birth_place' => $pick('birth_place'),
            'marital_status' => $pick('marital_status'),
            'religion' => $pick('religion'),
            'address' => $identity?->address ?? $member->address,
            'district' => $identity?->district ?? $member->district,
            'city' => $identity?->city ?? $member->city,
            'hobbies' => $identity?->hobbies ?? $member->hobbies,
            'member_code' => $member->member_code,
        ];

        if (! empty($biodata['birth_date'])) {
            $biodata['birth_date'] = Carbon::parse($biodata['birth_date'])->toDateString();
        }

        return $biodata;
    }

    private function findMember(string $email): ?User
    {
        return User::query()
            ->where('role', User::ROLE_MEMBER)
            ->whereRaw('lower(email) = ?', [strtolower($email)])
            ->first();
    }
}
