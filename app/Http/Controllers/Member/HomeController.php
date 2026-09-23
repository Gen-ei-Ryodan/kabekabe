<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\CommunityInfo;
use App\Models\HomeBanner;
use App\Models\HomePopup;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
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

        $vendorRankingByCount = Transaction::query()
            ->select('partner_id', DB::raw('COUNT(*) as total'))
            ->groupBy('partner_id')
            ->orderBy('total', 'desc')
            ->limit(5)
            ->with('partner:id,name,logo')
            ->get()
            ->map(fn (Transaction $t) => [
                'partner_id' => $t->partner_id,
                'name' => $t->partner?->name,
                'logo_url' => $t->partner?->logo_url,
                'total' => (int) $t->total,
            ]);

        $vendorRankingByAmount = Transaction::query()
            ->select('partner_id', DB::raw('SUM(total_amount) as total_amount'))
            ->groupBy('partner_id')
            ->orderBy('total_amount', 'desc')
            ->limit(5)
            ->with('partner:id,name,logo')
            ->get()
            ->map(fn (Transaction $t) => [
                'partner_id' => $t->partner_id,
                'name' => $t->partner?->name,
                'logo_url' => $t->partner?->logo_url,
                'total_amount' => (int) $t->total_amount,
            ]);

        $activePopup = HomePopup::query()->with('promo.partner:id,name')->first();
        $popupBanner = null;
        if ($activePopup && $activePopup->is_active && $activePopup->promo && $activePopup->promo->isActive()) {
            $popupBanner = [
                'id' => 'popup-'.$activePopup->id,
                'type' => HomeBanner::TYPE_PROMO,
                'image_url' => $activePopup->imageUrl() ?? $activePopup->promo->promo_image_url,
                'promo' => [
                    'id' => $activePopup->promo->id,
                    'title' => $activePopup->promo_title ?: $activePopup->promo->title,
                    'discount_type' => $activePopup->promo->discount_type,
                    'discount_value' => $activePopup->promo->discount_value,
                    'min_purchase' => $activePopup->promo->min_purchase,
                    'start_date' => $activePopup->promo->start_date?->toISOString(),
                    'end_date' => $activePopup->promo->end_date?->toISOString(),
                    'partner' => ['name' => $activePopup->promo->partner?->name],
                ],
            ];
        }

        $adminBanners = HomeBanner::query()
            ->active()
            ->where('type', HomeBanner::TYPE_PROMO)
            ->with('promo.partner:id,name')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (HomeBanner $banner) => [
                'id' => $banner->id,
                'type' => $banner->type,
                'image_url' => $banner->imageUrl() ?? $banner->promo?->promo_image_url,
                'promo' => $banner->type === HomeBanner::TYPE_PROMO && $banner->promo && $banner->promo->isActive()
                    ? [
                        'id' => $banner->promo->id,
                        'title' => $banner->promo_title ?: $banner->promo->title,
                        'discount_type' => $banner->promo->discount_type,
                        'discount_value' => $banner->promo->discount_value,
                        'min_purchase' => $banner->promo->min_purchase,
                        'start_date' => $banner->promo->start_date?->toISOString(),
                        'end_date' => $banner->promo->end_date?->toISOString(),
                        'partner' => ['name' => $banner->promo->partner?->name],
                    ]
                    : null,
            ])
            ->filter(fn (array $banner) => $banner['promo'] !== null)
            ->values();

        $allBanners = collect();
        if ($popupBanner) {
            $allBanners->push($popupBanner);
        }
        foreach ($adminBanners as $b) {
            if ($allBanners->count() >= 5) {
                break;
            }
            if ($popupBanner && isset($b['promo']['id']) && $b['promo']['id'] === $popupBanner['promo']['id']) {
                continue;
            }
            $allBanners->push($b);
        }

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
            'vendor_ranking' => $vendorRankingByCount,
            'vendor_ranking_by_count' => $vendorRankingByCount,
            'vendor_ranking_by_amount' => $vendorRankingByAmount,
            'banners' => $allBanners,
            'agendas' => CommunityInfo::query()
                ->published()
                ->whereIn('type', CommunityInfo::TYPES)
                ->orderByRaw('CASE WHEN event_date IS NULL THEN 1 ELSE 0 END')
                ->orderBy('event_date')
                ->limit(3)
                ->get(['id', 'title', 'event_date', 'location', 'type', 'image'])
                ->map(fn (CommunityInfo $agenda) => [
                    'id' => $agenda->id,
                    'title' => $agenda->title,
                    'event_date' => $agenda->event_date?->toISOString(),
                    'location' => $agenda->location,
                    'type' => $agenda->type,
                    'image_url' => $agenda->imageUrl(),
                ])
                ->values(),
            'popup' => ($popup = HomePopup::query()->with('promo.partner')->where('is_active', true)->first())
                && $popup->promo
                && $popup->promo->isActive()
                ? [
                    'id' => $popup->id,
                    'image_url' => $popup->imageUrl(),
                    'promo' => [
                        'id' => $popup->promo->id,
                        'title' => $popup->promo->title,
                        'description' => $popup->promo->description,
                        'discount_type' => $popup->promo->discount_type,
                        'discount_value' => $popup->promo->discount_value,
                        'partner' => ['name' => $popup->promo->partner?->name],
                    ],
                ]
                : null,
            'notifications_unread' => $user->appNotifications()->unread()->count(),
        ]);
    }
}
