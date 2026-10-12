<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePromoRequest;
use App\Http\Requests\UpdatePromoRequest;
use App\Models\Promo;
use App\Services\PromoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PromoController extends Controller
{
    public function __construct(
        private readonly PromoService $promos,
    ) {}

    private function vendorUser(): ?\App\Models\User
    {
        return Auth::guard('partner')->user() ?? auth()->user();
    }

    public function index(Request $request): Response
    {
        $partner = $this->vendorUser()?->partner;

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

    public function create(): Response|RedirectResponse
    {
        $partner = $this->vendorUser()?->partner;

        abort_if($partner === null, 403);

        if (! $partner->isActive()) {
            return redirect()
                ->route('vendor.promos.index')
                ->with('error', 'Status Partner Anda Tidak Aktif atau masa berlaku telah habis. Anda tidak dapat membuat promo baru.');
        }

        return Inertia::render('Vendor/Promos/Create');
    }

    public function store(StorePromoRequest $request): RedirectResponse
    {
        $partner = ($request->user('partner') ?? $this->vendorUser())?->partner;

        abort_if($partner === null, 403);

        if (! $partner->isActive()) {
            return redirect()
                ->route('vendor.promos.index')
                ->with('error', 'Status Partner Anda Tidak Aktif atau masa berlaku telah habis. Anda tidak dapat membuat promo.');
        }

        $data = $request->validated();

        // Handle file uploads
        foreach (['logo', 'promo_image', 'product_image'] as $field) {
            if ($request->hasFile($field)) {
                $data[$field] = $request->file($field)->store('promos', 'public');
            } else {
                unset($data[$field]);
            }
        }

        $promo = $partner->promos()->create($data);

        $this->promos->submit($promo, $request->user('partner') ?? $this->vendorUser());

        return redirect()
            ->route('vendor.promos.index')
            ->with('success', 'Promo submitted and awaiting admin approval.');
    }

    public function show(Promo $promo): Response
    {
        $user = $this->vendorUser();
        abort_unless($user && $user->can('view', $promo), 403);

        $promo->load('partner');

        return Inertia::render('Vendor/Promos/Show', [
            'promo' => $promo,
        ]);
    }

    public function edit(Promo $promo): Response
    {
        $user = $this->vendorUser();
        abort_unless($user && $user->can('update', $promo), 403);

        return Inertia::render('Vendor/Promos/Edit', [
            'promo' => array_merge($promo->toArray(), [
                'start_date' => $promo->start_date?->format('Y-m-d') ?? '',
                'end_date' => $promo->end_date?->format('Y-m-d') ?? '',
            ]),
        ]);
    }

    public function update(UpdatePromoRequest $request, Promo $promo): RedirectResponse
    {
        $data = $request->validated();

        // Handle file uploads
        foreach (['logo', 'promo_image', 'product_image'] as $field) {
            if ($request->hasFile($field)) {
                $data[$field] = $request->file($field)->store('promos', 'public');
            } else {
                unset($data[$field]);
            }
        }

        $promo->update($data);

        $this->promos->submit($promo, $request->user('partner') ?? $this->vendorUser());

        return redirect()
            ->route('vendor.promos.index')
            ->with('success', 'Promo updated and resubmitted for approval.');
    }

    public function destroy(Request $request, Promo $promo): RedirectResponse
    {
        $user = $request->user('partner') ?? $this->vendorUser();
        abort_unless($user && $user->can('delete', $promo), 403);

        $promo->delete();

        return redirect()
            ->route('vendor.promos.index')
            ->with('success', 'Promo deleted.');
    }
}
