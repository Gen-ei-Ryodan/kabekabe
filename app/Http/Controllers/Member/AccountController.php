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

        $settings = array_merge([
            'notify_promo' => true,
            'notify_membership' => true,
            'notify_community' => true,
        ], $user->notification_settings ?? []);

        return Inertia::render('Member/Account/Edit', [
            'account' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'whatsapp' => $user->whatsapp,
                'company' => $user->company,
                'avatar_url' => $user->avatarUrl(),
                'member_code' => $user->member_code,
            ],
            'settings' => $settings,
        ]);
    }

    public function update(UpdateAccountRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();

        if ($request->boolean('password') && $request->has('current_password')) {
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
            'whatsapp' => $validated['whatsapp'] ?? null,
            'company' => $validated['company'] ?? null,
            'avatar' => $validated['avatar'] ?? $user->avatar,
            'notification_settings' => [
                'notify_promo' => (bool) ($validated['notify_promo'] ?? false),
                'notify_membership' => (bool) ($validated['notify_membership'] ?? false),
                'notify_community' => (bool) ($validated['notify_community'] ?? false),
            ],
        ]);

        return back()->with('success', 'Profile updated successfully.');
    }
}