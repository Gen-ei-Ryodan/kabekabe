<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\RejectPromoRequest;
use App\Http\Requests\UpdatePromoRequest;
use App\Models\Promo;
use App\Services\PromoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PromoController extends Controller
{
    public function __construct(
        private readonly PromoService $promos,
    ) {}

    public function index(Request $request): Response
    {
        $this->promos->deactivateExpired();

        $query = Promo::query()->with(['partner:id,name,category,logo', 'latestAd']);

        $status = $request->string('status')->toString();
        $search = $request->string('search')->toString();
        $tab = $request->string('tab')->toString() ?: 'aktif';

        // Apply tab filter
        if ($tab === 'aktif') {
            $query->where('status', 'approved')->where('is_active', true);
        } elseif ($tab === 'pending') {
            $query->where('status', 'pending');
        } elseif ($tab === 'tidak_aktif') {
            $query->where(function ($q) {
                $q->where('is_active', false)->orWhere('status', 'rejected');
            });
        } elseif (in_array($status, ['pending', 'approved', 'rejected'], true)) {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('partner', fn ($p) => $p->where('name', 'like', "%{$search}%"));
            });
        }

        $promos = $query->orderByRaw("CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 WHEN 'rejected' THEN 2 ELSE 3 END")
            ->orderByRaw('COALESCE(sort_number, 999999) ASC')
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        $drawer = $this->drawerPayload($request);

        if ($drawer !== null) {
            $promos->appends($request->except(['drawer', 'id']));
        }

        return Inertia::render('Admin/Promos/Index', [
            'promos' => $promos,
            'filters' => [
                'status' => $status,
                'search' => $search,
                'tab' => $tab,
            ],
            'drawer' => $drawer,
        ]);
    }

    private function formatPromoForEdit(Promo $promo): array
    {
        $promo->loadMissing(['partner:id,name,category', 'latestAd']);

        $latestAd = $promo->latestAd;
        $adStart = $latestAd?->start_date?->format('Y-m-d');
        $adEnd = $latestAd?->end_date?->format('Y-m-d');

        $promoArray = $promo->toArray();

        // Jika promo memiliki pengajuan iklan terkait, sesuaikan tanggal mulai & berakhir dengan periode iklan yang diajukan mitra
        if ($adStart && $adEnd) {
            $promoArray['start_date'] = $adStart;
            $promoArray['end_date'] = $adEnd;
        } else {
            $promoArray['start_date'] = $promo->start_date?->format('Y-m-d');
            $promoArray['end_date'] = $promo->end_date?->format('Y-m-d');
        }

        $promoArray['latest_ad'] = $latestAd ? [
            'id' => $latestAd->id,
            'type' => $latestAd->type,
            'type_label' => $latestAd->type === \App\Models\PartnerAd::TYPE_POPUP ? 'Pop-up Pembuka (3 Hari)' : 'Banner Unggulan (5 Hari)',
            'start_date' => $adStart,
            'end_date' => $adEnd,
            'status' => $latestAd->status,
        ] : null;

        return $promoArray;
    }

    private function drawerPayload(Request $request): ?array
    {
        $mode = $request->string('drawer')->toString();

        if ($mode !== 'edit') {
            return null;
        }

        $promo = Promo::query()->find($request->integer('id'));

        if (! $promo) {
            return null;
        }

        return [
            'mode' => 'edit',
            'promo' => $this->formatPromoForEdit($promo),
        ];
    }

    public function edit(Promo $promo): Response
    {
        return Inertia::render('Admin/Promos/Edit', [
            'promo' => $this->formatPromoForEdit($promo),
        ]);
    }

    public function update(UpdatePromoRequest $request, Promo $promo): RedirectResponse
    {
        $promo->update($request->validated());

        if ($promo->latestAd) {
            $promo->latestAd->update([
                'start_date' => $promo->start_date,
                'end_date' => $promo->end_date,
            ]);
        }

        return redirect()
            ->route('admin.promos.index')
            ->with('success', 'Promo updated successfully.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'integer', 'exists:promos,id'],
            'items.*.sort_number' => ['required', 'integer', 'min:1'],
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['items'] as $item) {
                Promo::where('id', $item['id'])->update(['sort_number' => $item['sort_number']]);
            }
        });

        return back()->with('success', 'Urutan promo berhasil diperbarui.');
    }

    public function updateSort(Request $request, Promo $promo): RedirectResponse
    {
        $validated = $request->validate([
            'sort_number' => ['nullable', 'integer', 'min:1'],
        ]);

        $promo->update([
            'sort_number' => $validated['sort_number'] ?? null,
        ]);

        return back()->with('success', 'Nomor urut promo berhasil diperbarui.');
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
        $isActive = $request->has('is_active') ? $request->boolean('is_active') : ! $promo->is_active;

        if ($isActive) {
            $promo->status = Promo::STATUS_APPROVED;
            $promo->rejection_reason = null;
            $promo->is_active = true;

            // Jika promo memiliki pengajuan iklan terkait, utamakan periode iklan yang diajukan partner
            if ($promo->latestAd) {
                if ($promo->latestAd->start_date) {
                    $promo->start_date = $promo->latestAd->start_date;
                }
                if ($promo->latestAd->end_date && $promo->latestAd->end_date->isFuture()) {
                    $promo->end_date = $promo->latestAd->end_date;
                }
            }

            // Jika end_date sudah lampau atau kosong, perpanjang minimal 30 hari agar tidak langsung mati oleh deactivateExpired()
            if (! $promo->end_date || $promo->end_date->isPast()) {
                $promo->start_date = $promo->start_date && $promo->start_date->isPast() ? $promo->start_date : now()->toDateString();
                $promo->end_date = now()->addDays(30)->toDateString();
            }

            $promo->save();

            return back()->with('success', "Promo \"{$promo->title}\" berhasil diaktifkan (berlaku s/d {$promo->end_date->format('d M Y')}).");
        }

        $promo->update(['is_active' => false]);

        return back()->with('success', "Promo \"{$promo->title}\" berhasil dinonaktifkan.");
    }
}
