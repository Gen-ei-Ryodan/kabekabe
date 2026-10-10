<?php

namespace App\Http\Middleware;

use App\Models\Partner;
use App\Models\PartnerAd;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        $partnerUser = Auth::guard('partner')->user();

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
                'partner' => $partnerUser ? [
                    'id' => $partnerUser->id,
                    'name' => $partnerUser->name,
                    'email' => $partnerUser->email,
                    'role' => $partnerUser->role,
                ] : null,
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'pending_approvals' => ($user && $user->isAdmin()) ? [
                'members' => User::query()->where('role', User::ROLE_MEMBER)->where('approval_status', User::APPROVAL_PENDING)->count(),
                'partners' => Partner::query()->whereHas('user', fn ($u) => $u->where('approval_status', User::APPROVAL_PENDING))->count(),
                'paid_ads' => PartnerAd::query()->where('status', 'paid')->count(),
            ] : null,
        ];
    }
}
