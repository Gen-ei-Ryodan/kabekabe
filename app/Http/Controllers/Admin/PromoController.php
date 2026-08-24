<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RejectPromoRequest;
use App\Http\Requests\UpdatePromoRequest;
use App\Models\Promo;
use App\Services\PromoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PromoController extends Controller
{
    public function __construct(
        private readonly PromoService $promos,
    ) {}

    public function index(Request $request): Response
    {
        $query = Promo::query()->with('partner:id,name,category,logo');

        $status = $request->string('status')->toString();

        if (in_array($status, ['pending', 'approved', 'rejected'], true)) {
            $query->where('status', $status);
        }

        $promos = $query->orderByRaw("CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 WHEN 'rejected' THEN 2 ELSE 3 END")
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        $drawer = $this->drawerPayload($request);

        if ($drawer !== null) {
            $promos->appends($request->except(['drawer', 'id']));
        }

        return Inertia::render('Admin/Promos/Index', [
            'promos' => $promos,
            'filters' => ['status' => $status],
            'drawer' => $drawer,
        ]);
    }

    private function drawerPayload(Request $request): ?array
    {
        $mode = $request->string('drawer')->toString();

        if ($mode !== 'edit') {
            return null;
        }

        $promo = Promo::query()->with('partner:id,name,category')->find($request->integer('id'));

        if (! $promo) {
            return null;
        }

        return [
            'mode' => 'edit',
            'promo' => $promo,
        ];
    }

    public function edit(Promo $promo): Response
    {
        return Inertia::render('Admin/Promos/Edit', [
            'promo' => $promo->load('partner:id,name,category'),
        ]);
    }

    public function update(UpdatePromoRequest $request, Promo $promo): RedirectResponse
    {
        $promo->update($request->validated());

        return redirect()
            ->route('admin.promos.index')
            ->with('success', 'Promo updated successfully.');
    }

    public function approve(Request $request, Promo $promo): RedirectResponse
    {
        $this->promos->approve($promo, $request->user());

        return back()->with('success', 'Promo approved and now visible to members.');
    }

    public function reject(RejectPromoRequest $request, Promo $promo): RedirectResponse
    {
        $this->promos->reject($promo, $request->user(), $request->input('reason'));

        return back()->with('success', 'Promo rejected.');
    }

    public function toggle(Request $request, Promo $promo): RedirectResponse
    {
        abort_unless($promo->status === Promo::STATUS_APPROVED, 422);

        $promo->update(['is_active' => $request->boolean('is_active')]);

        return back()->with('success', $promo->is_active ? 'Promo activated.' : 'Promo deactivated.');
    }
}