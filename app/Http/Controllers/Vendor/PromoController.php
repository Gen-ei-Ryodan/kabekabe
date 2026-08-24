<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePromoRequest;
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
        $partner = auth()->user()->partner;

        abort_if($partner === null, 403);

        $status = $request->string('status')->toString();

        $query = Promo::query()->where('partner_id', $partner->id);

        if (in_array($status, ['pending', 'approved', 'rejected'], true)) {
            $query->where('status', $status);
        }

        return Inertia::render('Vendor/Promos/Index', [
            'promos' => $query->orderByDesc('updated_at')->paginate(10)->withQueryString(),
            'filters' => ['status' => $status],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Vendor/Promos/Create');
    }

    public function store(StorePromoRequest $request): RedirectResponse
    {
        $partner = $request->user()->partner;

        abort_if($partner === null, 403);

        $promo = $partner->promos()->create($request->validated());

        $this->promos->submit($promo, $request->user());

        return redirect()
            ->route('vendor.promos.index')
            ->with('success', 'Promo submitted and awaiting admin approval.');
    }

    public function edit(Promo $promo): Response
    {
        abort_unless($this->userCanEdit(auth()->user(), $promo), 403);

        return Inertia::render('Vendor/Promos/Edit', [
            'promo' => $promo,
        ]);
    }

    public function update(UpdatePromoRequest $request, Promo $promo): RedirectResponse
    {
        $promo->update($request->validated());

        $this->promos->submit($promo, $request->user());

        return redirect()
            ->route('vendor.promos.index')
            ->with('success', 'Promo updated and resubmitted for approval.');
    }

    public function destroy(Request $request, Promo $promo): RedirectResponse
    {
        abort_unless($request->user()->can('delete', $promo), 403);

        $promo->delete();

        return redirect()
            ->route('vendor.promos.index')
            ->with('success', 'Promo deleted.');
    }

    private function userCanEdit(\App\Models\User $user, Promo $promo): bool
    {
        return $user->isVendor()
            && $promo->partner->user_id === $user->id
            && $promo->status === Promo::STATUS_REJECTED;
    }
}