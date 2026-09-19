<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'appName' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'member_code' => $user->member_code,
                    'avatar_url' => $user->avatarUrl(),
                    'notifications_unread' => $user->isMember()
                        ? $user->appNotifications()->unread()->count()
                        : 0,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'pending_approvals' => ($user && $user->isAdmin()) ? [
                'members' => \App\Models\User::query()->where('role', \App\Models\User::ROLE_MEMBER)->where('approval_status', \App\Models\User::APPROVAL_PENDING)->count(),
                'partners' => \App\Models\Partner::query()->whereHas('user', fn ($u) => $u->where('approval_status', \App\Models\User::APPROVAL_PENDING))->count(),
                'paid_ads' => \App\Models\PartnerAd::query()->where('status', 'paid')->count(),
            ] : null,
        ];
    }
}