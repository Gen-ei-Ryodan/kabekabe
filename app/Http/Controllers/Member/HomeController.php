<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\HomeBanner;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $user = auth()->user();
        $user->load('membership');
        $user->ensureCardToken();
        $user->ensureMemberCode();

        return Inertia::render('Member/Home', [
            'member' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'member_code' => $user->member_code,
                'card_token' => $user->card_token,
                'avatar_url' => $user->avatarUrl(),
                'joined_at' => $user->created_at?->format('d M Y'),
                'membership_status' => $user->hasActiveMembership() ? 'active' : 'inactive',
                'membership_status_label' => $user->hasActiveMembership() ? 'ACTIVE' : 'INACTIVE',
                'expires_at' => $user->membership?->expires_at?->format('d M Y'),
                'expires_at_full' => $user->membership?->expires_at?->toISOString(),
                'is_expiring_soon' => $user->membership?->isExpiringSoon(),
            ],
            'banners' => HomeBanner::query()
                ->active()
                ->with(['promo.partner:id,name', 'agenda'])
                ->orderBy('sort_order')
                ->get()
                ->map(fn (HomeBanner $banner) => [
                    'id' => $banner->id,
                    'type' => $banner->type,
                    'promo' => $banner->type === HomeBanner::TYPE_PROMO && $banner->promo && $banner->promo->isActive()
                        ? [
                            'id' => $banner->promo->id,
                            'title' => $banner->promo->title,
                            'discount_type' => $banner->promo->discount_type,
                            'discount_value' => $banner->promo->discount_value,
                            'min_purchase' => $banner->promo->min_purchase,
                            'start_date' => $banner->promo->start_date?->toISOString(),
                            'end_date' => $banner->promo->end_date?->toISOString(),
                            'partner' => ['name' => $banner->promo->partner?->name],
                        ]
                        : null,
                    'agenda' => $banner->type === HomeBanner::TYPE_AGENDA
                        && $banner->agenda
                        && $banner->agenda->is_published
                        && $banner->agenda->published_at
                        && $banner->agenda->published_at->lte(now())
                        ? [
                            'id' => $banner->agenda->id,
                            'title' => $banner->agenda->title,
                            'event_date' => $banner->agenda->event_date?->toISOString(),
                            'location' => $banner->agenda->location,
                            'type' => $banner->agenda->type,
                        ]
                        : null,
                ])
                ->filter(fn (array $banner) => $banner['promo'] !== null || $banner['agenda'] !== null)
                ->take(3)
                ->values(),
            'notifications_unread' => $user->appNotifications()->unread()->count(),
        ]);
    }
}