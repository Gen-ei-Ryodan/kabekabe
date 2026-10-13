<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HomeBanner;
use App\Models\HomePopup;
use App\Models\PartnerAd;
use App\Models\Promo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class HomeBannerController extends Controller
{
    public function index(Request $request): Response
    {
        $query = HomeBanner::query()->where('type', HomeBanner::TYPE_PROMO)->with('promo.partner:id,name');

        $status = $request->string('status')->toString();

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $this->autoTakeDown();

        $banners = $query->with('promo.partner')->orderBy('sort_order')
            ->get()
            ->map(function (HomeBanner $banner) {
                $startDate = $banner->promo?->start_date;
                $endDate = $banner->promo?->end_date;
                $ad = PartnerAd::where('promo_id', $banner->promo_id)
                    ->where('type', PartnerAd::TYPE_BANNER)
                    ->whereIn('status', ['active', 'paid', 'approved'])
                    ->latest()
                    ->first();
                if ($ad) {
                    $startDate = $ad->start_date ?? $startDate;
                    $endDate = $ad->end_date ?? $endDate;
                }

                $statusBadge = 'Aktif';
                if (! $banner->is_active) {
                    $statusBadge = 'Tidak Aktif';
                } elseif ($endDate && $endDate->isPast()) {
                    $statusBadge = 'Kedaluwarsa';
                } elseif ($startDate && $startDate->isFuture()) {
                    $statusBadge = 'Mendatang';
                }

                return [
                    'id' => $banner->id,
                    'image_url' => $banner->imageUrl(),
                    'target_title' => $banner->promo_title ?: $banner->promo?->title,
                    'promo_title' => $banner->promo_title,
                    'promo_id' => $banner->promo_id,
                    'sort_order' => $banner->sort_order,
                    'is_active' => $banner->is_active,
                    'start_date' => $startDate?->format('d M Y'),
                    'end_date' => $endDate?->format('d M Y'),
                    'date_range' => ($startDate && $endDate)
                        ? ($startDate->format('d M Y') . ' — ' . $endDate->format('d M Y'))
                        : ($endDate ? ('Hingga ' . $endDate->format('d M Y')) : '-'),
                    'status_badge' => $statusBadge,
                    'promo' => $banner->promo
                        ? ['id' => $banner->promo->id, 'title' => $banner->promo->title, 'partner' => ['name' => $banner->promo->partner?->name]]
                        : null,
                ];
            })
            ->all();

        $partnerAds = PartnerAd::query()
            ->with(['partner:id,name', 'promo:id,title'])
            ->latest('created_at')
            ->get()
            ->map(function (PartnerAd $ad) {
                $slotFull = false;
                $slotFullMessage = null;

                if ($ad->start_date && $ad->end_date) {
                    if ($ad->type === PartnerAd::TYPE_POPUP) {
                        $conflictingPopup = HomePopup::where('is_active', true)
                            ->whereHas('promo', function ($q) use ($ad) {
                                $q->where(function ($sub) use ($ad) {
                                    $sub->whereBetween('start_date', [$ad->start_date, $ad->end_date])
                                        ->orWhereBetween('end_date', [$ad->start_date, $ad->end_date]);
                                });
                            })->exists();

                        $conflictingAdPopup = PartnerAd::where('id', '!=', $ad->id)
                            ->where('type', PartnerAd::TYPE_POPUP)
                            ->whereIn('status', ['approved', 'paid', 'active'])
                            ->where(function ($q) use ($ad) {
                                $q->whereBetween('start_date', [$ad->start_date, $ad->end_date])
                                    ->orWhereBetween('end_date', [$ad->start_date, $ad->end_date]);
                            })->exists();

                        if ($conflictingPopup || $conflictingAdPopup) {
                            $slotFull = true;
                            $slotFullMessage = 'Slot pada tanggal tersebut sudah penuh (Maks 1 Pop-up)';
                        }
                    } else {
                        $conflictingAdBanners = PartnerAd::where('id', '!=', $ad->id)
                            ->where('type', PartnerAd::TYPE_BANNER)
                            ->whereIn('status', ['approved', 'paid', 'active'])
                            ->where(function ($q) use ($ad) {
                                $q->whereBetween('start_date', [$ad->start_date, $ad->end_date])
                                    ->orWhereBetween('end_date', [$ad->start_date, $ad->end_date]);
                            })->count();

                        $activeBannerCount = HomeBanner::where('type', HomeBanner::TYPE_PROMO)->where('is_active', true)->count();

                        if ($conflictingAdBanners >= 3 || $activeBannerCount >= 3) {
                            $slotFull = true;
                            $slotFullMessage = 'Slot pada tanggal tersebut sudah penuh (Maks 3 Banner Unggulan)';
                        }
                    }
                }

                return [
                    'id' => $ad->id,
                    'partner_name' => $ad->partner?->name,
                    'type' => $ad->type,
                    'type_label' => $ad->type === PartnerAd::TYPE_POPUP ? 'Pop-up Pembuka (3 Hari)' : 'Banner Unggulan (5 Hari)',
                    'promo_title' => $ad->promo_title ?: $ad->promo?->title,
                    'image_url' => $ad->imageUrl(),
                    'start_date' => $ad->start_date?->format('d M Y'),
                    'end_date' => $ad->end_date?->format('d M Y'),
                    'status' => $ad->status,
                    'slot_full' => $slotFull,
                    'slot_full_message' => $slotFullMessage,
                    'notes' => $ad->notes,
                    'admin_feedback' => $ad->admin_feedback,
                    'created_at' => $ad->created_at?->format('d M Y H:i'),
                    'paid_at' => $ad->paid_at?->format('d M Y H:i'),
                ];
            });

        $drawer = $this->drawerPayload($request);
        $paidAdsCount = PartnerAd::query()->where('status', 'paid')->count();

        return Inertia::render('Admin/Banners/Index', [
            'banners' => $banners,
            'partner_ads' => $partnerAds,
            'paid_ads_count' => $paidAdsCount,
            'initial_tab' => $request->string('tab')->toString() ?: 'banners',
            'filters' => ['status' => $status],
            'promos' => $this->promoSelect(),
            'drawer' => $drawer,
            'popup' => $this->popupPayload(),
            'popup_promos' => $this->promoSelect(),
        ]);
    }

    private function drawerPayload(Request $request): ?array
    {
        $mode = $request->string('drawer')->toString();

        if (! in_array($mode, ['create', 'edit'], true)) {
            return null;
        }

        $drawer = ['mode' => $mode];

        if ($mode === 'edit') {
            $banner = HomeBanner::query()
                ->with('promo:id,title,partner_id')
                ->find($request->integer('id'));

            if ($banner) {
                $drawer['banner'] = $banner;
            }
        }

        return $drawer;
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Banners/Index', [
            'drawer' => ['mode' => 'create'],
            'promos' => $this->promoSelect(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateBanner($request);

        HomeBanner::create($validated);

        return redirect()
            ->route('admin.banners.index')
            ->with('success', 'Home banner created successfully.');
    }

    public function edit(HomeBanner $banner): Response
    {
        return Inertia::render('Admin/Banners/Index', [
            'drawer' => [
                'mode' => 'edit',
                'banner' => $banner->load('promo:id,title,partner_id'),
            ],
            'promos' => $this->promoSelect(),
        ]);
    }

    public function update(Request $request, HomeBanner $banner): RedirectResponse
    {
        $validated = $this->validateBanner($request, $banner);

        $banner->update($validated);

        return redirect()
            ->route('admin.banners.index')
            ->with('success', 'Home banner updated successfully.');
    }

    public function toggle(Request $request, HomeBanner $banner): RedirectResponse
    {
        $activate = $request->boolean('is_active');

        if ($activate && ! $banner->is_active) {
            $active = HomeBanner::query()
                ->where('type', HomeBanner::TYPE_PROMO)
                ->where('is_active', true)
                ->where('id', '!=', $banner->id)
                ->count();

            if ($active >= 4) {
                throw ValidationException::withMessages([
                    'is_active' => 'Maksimal 4 banner aktif dikelola admin (Slot 1 otomatis dari Pop-up Pembuka).',
                ]);
            }
        }

        $banner->update(['is_active' => $activate]);

        return back()->with('success', $activate ? 'Home banner activated.' : 'Home banner deactivated.');
    }

    public function destroy(HomeBanner $banner): RedirectResponse
    {
        $banner->delete();

        return redirect()
            ->route('admin.banners.index')
            ->with('success', 'Home banner deleted.');
    }

    public function updatePopup(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'promo_id' => ['required', 'integer', Rule::exists('promos', 'id')],
            'promo_title' => ['nullable', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048', 'dimensions:max_width=2000,max_height=2000'],
            'remove_image' => ['nullable', 'boolean'],
        ]);

        $popup = HomePopup::query()->first();
        $data = [
            'promo_id' => $validated['promo_id'],
            'promo_title' => $validated['promo_title'] ?? null,
            'is_active' => $validated['is_active'],
        ];

        if ($request->hasFile('image')) {
            if ($popup?->image_path) {
                Storage::disk('public')->delete($popup->image_path);
            }
            $data['image_path'] = $request->file('image')->store('home-popups', 'public');
        } elseif ($request->boolean('remove_image') && $popup?->image_path) {
            Storage::disk('public')->delete($popup->image_path);
            $data['image_path'] = null;
        }

        $popup ??= new HomePopup;
        $popup->fill($data);
        $popup->save();

        return redirect()->route('admin.banners.index')->with('success', 'Opening popup settings saved.');
    }

    private function popupPayload(): ?array
    {
        $popup = HomePopup::query()->with('promo.partner')->first();
        if (! $popup) return null;

        $startDate = $popup->promo?->start_date;
        $endDate = $popup->promo?->end_date;
        $ad = PartnerAd::where('promo_id', $popup->promo_id)
            ->where('type', PartnerAd::TYPE_POPUP)
            ->whereIn('status', ['active', 'paid', 'approved'])
            ->latest()
            ->first();
        if ($ad) {
            $startDate = $ad->start_date ?? $startDate;
            $endDate = $ad->end_date ?? $endDate;
        }

        $statusBadge = 'Aktif';
        if (! $popup->is_active) {
            $statusBadge = 'Tidak Aktif';
        } elseif ($endDate && $endDate->isPast()) {
            $statusBadge = 'Kedaluwarsa';
        } elseif ($startDate && $startDate->isFuture()) {
            $statusBadge = 'Mendatang';
        }

        return [
            'id' => $popup->id,
            'promo_id' => $popup->promo_id,
            'promo_title' => $popup->promo_title,
            'image_path' => $popup->image_path,
            'image_url' => $popup->imageUrl(),
            'is_active' => $popup->is_active,
            'start_date' => $startDate?->format('d M Y'),
            'end_date' => $endDate?->format('d M Y'),
            'date_range' => ($startDate && $endDate)
                ? ($startDate->format('d M Y') . ' — ' . $endDate->format('d M Y'))
                : ($endDate ? ('Hingga ' . $endDate->format('d M Y')) : '-'),
            'status_badge' => $statusBadge,
            'promo' => $popup->promo ? [
                'title' => $popup->promo->title,
                'partner' => ['name' => $popup->promo->partner?->name],
            ] : null,
        ];
    }

    private function validateBanner(Request $request, ?HomeBanner $banner = null): array
    {
        $validated = $request->validate([
            'promo_id' => ['required', 'integer', Rule::exists('promos', 'id')],
            'promo_title' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['required', 'integer', 'min:1'],
            'is_active' => ['required', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
        ]);

        $validated['type'] = HomeBanner::TYPE_PROMO;
        $validated['agenda_id'] = null;

        unset($validated['image'], $validated['remove_image']);

        if ($request->hasFile('image')) {
            if ($banner?->image_path) {
                Storage::disk('public')->delete($banner->image_path);
            }

            $validated['image_path'] = $request->file('image')->store('banners', 'public');
        } elseif ($request->boolean('remove_image') && $banner?->image_path) {
            Storage::disk('public')->delete($banner->image_path);
            $validated['image_path'] = null;
        }

        if ($request->boolean('is_active')) {
            $active = HomeBanner::query()
                ->where('type', HomeBanner::TYPE_PROMO)
                ->where('is_active', true);

            if ($banner !== null) {
                $active->where('id', '!=', $banner->id);
            }

            if ($active->count() >= 3) {
                throw ValidationException::withMessages([
                    'is_active' => 'Maksimal 3 banner unggulan aktif di slider beranda (Slot 1 otomatis dari Pop-up Pembuka).',
                ]);
            }
        }

        return $validated;
    }

    public function approveAd(PartnerAd $ad): RedirectResponse
    {
        $this->autoTakeDown();

        // Cek kapasitas slot sebelum ACC
        if ($ad->start_date && $ad->end_date) {
            if ($ad->type === PartnerAd::TYPE_POPUP) {
                $conflictingPopup = HomePopup::where('is_active', true)
                    ->whereHas('promo', function ($q) use ($ad) {
                        $q->where(function ($sub) use ($ad) {
                            $sub->whereBetween('start_date', [$ad->start_date, $ad->end_date])
                                ->orWhereBetween('end_date', [$ad->start_date, $ad->end_date]);
                        });
                    })->exists();

                $conflictingAdPopup = PartnerAd::where('id', '!=', $ad->id)
                    ->where('type', PartnerAd::TYPE_POPUP)
                    ->whereIn('status', ['approved', 'paid', 'active'])
                    ->where(function ($q) use ($ad) {
                        $q->whereBetween('start_date', [$ad->start_date, $ad->end_date])
                            ->orWhereBetween('end_date', [$ad->start_date, $ad->end_date]);
                    })->exists();

                if ($conflictingPopup || $conflictingAdPopup) {
                    return back()->with('error', 'Slot pada rentang tanggal tersebut sudah penuh (Maksimal 1 Pop-up).');
                }
            } else {
                $conflictingAdBanners = PartnerAd::where('id', '!=', $ad->id)
                    ->where('type', PartnerAd::TYPE_BANNER)
                    ->whereIn('status', ['approved', 'paid', 'active'])
                    ->where(function ($q) use ($ad) {
                        $q->whereBetween('start_date', [$ad->start_date, $ad->end_date])
                            ->orWhereBetween('end_date', [$ad->start_date, $ad->end_date]);
                    })->count();

                $activeBannerCount = HomeBanner::where('type', HomeBanner::TYPE_PROMO)->where('is_active', true)->count();

                if ($conflictingAdBanners >= 3 || $activeBannerCount >= 3) {
                    return back()->with('error', 'Slot pada rentang tanggal tersebut sudah penuh (Maksimal 3 Banner Unggulan).');
                }
            }
        }

        $ad->update([
            'status' => PartnerAd::STATUS_APPROVED,
            'approved_at' => now(),
        ]);

        return back()->with('success', 'Pengajuan iklan partner disetujui.');
    }

    public function rejectAd(Request $request, PartnerAd $ad): RedirectResponse
    {
        $ad->update([
            'status' => PartnerAd::STATUS_REJECTED,
            'admin_feedback' => $request->input('reason'),
        ]);

        return back()->with('success', 'Pengajuan iklan partner ditolak.');
    }

    public function markPaidAd(PartnerAd $ad): RedirectResponse
    {
        $ad->update([
            'status' => PartnerAd::STATUS_PAID,
            'paid_at' => now(),
        ]);

        return back()->with('success', 'Status iklan diperbarui menjadi Sudah Dibayar.');
    }

    public function publishAd(PartnerAd $ad): RedirectResponse
    {
        $this->autoTakeDown();

        if ($ad->type === PartnerAd::TYPE_POPUP) {
            $popup = HomePopup::first() ?? new HomePopup;
            $popup->fill([
                'promo_id' => $ad->promo_id,
                'promo_title' => $ad->promo_title,
                'image_path' => $ad->image_path,
                'is_active' => true,
            ]);
            $popup->save();

            $ad->update(['status' => 'active']);

            return back()->with('success', 'Iklan partner berhasil ditayangkan sebagai Popup Pembuka Beranda!');
        }

        $activeBannerCount = HomeBanner::query()
            ->where('type', HomeBanner::TYPE_PROMO)
            ->where('is_active', true)
            ->count();

        if ($activeBannerCount >= 3) {
            return back()
                ->with('error', 'Slot banner unggulan penuh (3/3). Nonaktifkan banner lama terlebih dahulu.');
        }

        $maxOrder = HomeBanner::query()->max('sort_order') ?? 0;
        HomeBanner::create([
            'promo_id' => $ad->promo_id,
            'agenda_id' => null,
            'type' => HomeBanner::TYPE_PROMO,
            'promo_title' => $ad->promo_title,
            'image_path' => $ad->image_path,
            'sort_order' => $maxOrder + 1,
            'is_active' => true,
        ]);

        $ad->update(['status' => 'active']);

        return back()->with('success', 'Iklan partner berhasil ditayangkan sebagai Banner Beranda!');
    }

    private function autoTakeDown(): void
    {
        // Deactivate expired popups
        $popups = HomePopup::where('is_active', true)->with('promo')->get();
        foreach ($popups as $popup) {
            $endDate = $popup->promo?->end_date;
            $ad = PartnerAd::where('promo_id', $popup->promo_id)
                ->where('type', PartnerAd::TYPE_POPUP)
                ->where('status', 'active')
                ->latest()
                ->first();
            if ($ad && $ad->end_date) {
                $endDate = $ad->end_date;
            }
            if ($endDate && $endDate->isPast()) {
                $popup->update(['is_active' => false]);
                if ($ad) {
                    $ad->update(['status' => 'completed']);
                }
            }
        }

        // Deactivate expired banners
        $banners = HomeBanner::where('type', HomeBanner::TYPE_PROMO)
            ->where('is_active', true)
            ->with('promo')
            ->get();
        foreach ($banners as $banner) {
            $endDate = $banner->promo?->end_date;
            $ad = PartnerAd::where('promo_id', $banner->promo_id)
                ->where('type', PartnerAd::TYPE_BANNER)
                ->where('status', 'active')
                ->latest()
                ->first();
            if ($ad && $ad->end_date) {
                $endDate = $ad->end_date;
            }
            if ($endDate && $endDate->isPast()) {
                $banner->update(['is_active' => false]);
                if ($ad) {
                    $ad->update(['status' => 'completed']);
                }
            }
        }
    }

    private function promoSelect(): array
    {
        return Promo::query()
            ->visibleToMembers()
            ->get(['id', 'title', 'partner_id'])
            ->map(fn (Promo $promo) => [
                'id' => $promo->id,
                'title' => $promo->title,
                'partner' => $promo->partner?->name,
            ])
            ->all();
    }
}
