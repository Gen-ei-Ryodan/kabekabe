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

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $validated['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'religion' => $validated['religion'] ?? null,
            'address' => $validated['address'] ?? null,
            'whatsapp' => $validated['whatsapp'] ?? null,
            'company' => $validated['company'] ?? null,
            'avatar' => $validated['avatar'] ?? $user->avatar,
        ]);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }
}