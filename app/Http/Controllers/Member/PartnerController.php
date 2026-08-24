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
        $query = Partner::query()->active()->withCount(['promos' => fn ($q) => $q->where('status', 'approved')]);

        $category = $request->string('category')->toString();

        if ($category !== '' && $category !== 'all') {
            $query->where('category', $category);
        }

        $partners = $query->orderBy('name')->paginate(12)->withQueryString();

        return Inertia::render('Member/Partners/Index', [
            'partners' => $partners,
            'categories' => Partner::query()->active()->distinct()->pluck('category'),
            'filters' => ['category' => $category],
            'promos' => Promo::query()
                ->visibleToMembers()
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