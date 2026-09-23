<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateAccountRequest;
use App\Services\PasswordOtpService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function edit(): Response
    {
        $user = auth()->user();

        return Inertia::render('Member/Account/Edit', [
            'account' => [
                'name' => $user->name,
                'email' => $user->email,
                'religion' => $user->religion,
                'address' => $user->address,
                'phone' => $user->phone,
                'whatsapp' => $user->whatsapp,
                'company' => $user->company,
                'avatar_url' => $user->avatarUrl(),
                'member_code' => $user->member_code,
                'avatar_changes_count' => (int) ($user->avatar_changes_count ?? 0),
                'can_change_avatar' => ((int) ($user->avatar_changes_count ?? 0)) < 1,
            ],
            'password_otp_sent' => app(PasswordOtpService::class)
                ->hasActiveCode($user, PasswordOtpService::PURPOSE_CHANGE),
        ]);
    }

    /**
     * Kirim kode OTP ke email member sebagai konfirmasi sebelum ganti password disimpan.
     */
    public function sendPasswordOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'current_password.current_password' => 'Password saat ini tidak sesuai.',
            'password.required' => 'Password baru wajib diisi.',
            'password.confirmed' => 'Konfirmasi password baru tidak cocok.',
        ]);

        app(PasswordOtpService::class)->issue(
            $request->user(),
            PasswordOtpService::PURPOSE_CHANGE,
            'Kode OTP Ganti Password',
            'Konfirmasi penggantian password akun KBKB Anda dengan memasukkan kode 6 digit di bawah ini.',
        );

        return back()->with('success', 'Kode OTP sudah dikirim ke email Anda. Masukkan kode tersebut lalu klik Simpan Perubahan.');
    }

    public function update(UpdateAccountRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if ($request->filled('password')) {
            // Validasi OTP (wajib & cocok) sudah dilakukan di UpdateAccountRequest.
            $user->update(['password' => Hash::make($request->input('password'))]);
            app(PasswordOtpService::class)->clear($user);
        }

        $avatarPath = $user->avatar;
        $changesCount = (int) ($user->avatar_changes_count ?? 0);

        if ($request->hasFile('avatar')) {
            if ($changesCount >= 1) {
                return back()->withErrors([
                    'avatar' => 'Foto profil hanya boleh diganti satu kali di awal. Untuk penggantian selanjutnya, silakan lakukan pengajuan ke Admin.',
                ]);
            }

            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $changesCount++;
        }

        $user->update([
            // Nama tidak dapat diubah sendiri oleh member
            'email' => $validated['email'],
            'religion' => $validated['religion'] ?? null,
            'address' => $validated['address'] ?? null,
            'whatsapp' => $validated['whatsapp'] ?? null,
            'company' => $validated['company'] ?? null,
            'avatar' => $avatarPath,
            'avatar_changes_count' => $changesCount,
        ]);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }
}
