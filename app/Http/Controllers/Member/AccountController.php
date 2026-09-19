<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateAccountRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
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
        ]);
    }

    public function update(UpdateAccountRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if ($request->filled('password') && $request->has('current_password')) {
            $user->update(['password' => $request->input('password')]);
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