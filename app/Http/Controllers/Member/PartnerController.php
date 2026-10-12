<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Models\Promo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PartnerController extends Controller
{
    public function index(Request $request): Response
    {
        $category = $request->string('category')->toString();
        $search = $request->string('search')->toString();

        // Normalize 'FNB' to 'F&B'
        $normalizedCategory = str_replace('FNB', 'F&B', $category);

        $query = Partner::query()->active()->withCount(['promos' => fn ($q) => $q->where('status', 'approved')]);
        $promoQuery = Promo::query()->visibleToMembers();

        // Filter out null/empty, normalize FNB to F&B, get unique values
        $availableCategories = Partner::query()->active()
            ->whereNotNull('category')
            ->where('category', '!=', '')
            ->distinct()
            ->pluck('category')
            ->map(fn ($cat) => $cat === 'FNB' ? 'F&B' : $cat)
            ->unique()
            ->values();

        if ($normalizedCategory !== '' && $normalizedCategory !== 'all') {
            if ($normalizedCategory === 'F&B' || $category === 'FNB') {
                $query->whereIn('category', ['F&B', 'FNB']);
                $promoQuery->whereHas('partner', fn ($q) => $q->whereIn('category', ['F&B', 'FNB']));
            } else {
                $query->where('category', $category);
                $promoQuery->whereHas('partner', fn ($q) => $q->where('category', $category));
            }
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('trade_name', 'like', "%{$search}%");
            });
            $promoQuery->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('partner', function ($p) use ($search) {
                        $p->where('name', 'like', "%{$search}%")
                            ->orWhere('trade_name', 'like', "%{$search}%");
                    });
            });
        }

        $partners = $query->orderByRaw('COALESCE(sort_number, 999999) ASC')
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Member/Partners/Index', [
            'partners' => $partners,
            'categories' => $availableCategories,
            'filters' => ['category' => $category, 'search' => $search],
            'promos' => $promoQuery
                ->orderByRaw('COALESCE(sort_number, 999999) ASC')
                ->latest('end_date')
                ->paginate(9)
                ->withQueryString(),
        ]);
    }

    public function show(Partner $partner): Response
    {
        abort_unless($partner->is_active, 404);

        return Inertia::render('Member/Partners/Show', [
            'partner' => $partner->load([
                'promos' => fn ($q) => $q->where('status', 'approved')->where('is_active', true)->where('start_date', '<=', now()->toDateString())->where('end_date', '>=', now()->toDateString()),
            ]),
        ]);
    }
}
