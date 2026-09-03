<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommunityInfo;
use App\Models\HomeBanner;
use App\Models\HomePopup;
use App\Models\Promo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class HomeBannerController extends Controller
{
    public function index(Request $request): Response
    {
        $query = HomeBanner::query()->with(['promo.partner:id,name', 'agenda']);

        $type = $request->string('type')->toString();
        $status = $request->string('status')->toString();

        if (in_array($type, [HomeBanner::TYPE_PROMO, HomeBanner::TYPE_AGENDA], true)) {
            $query->where('type', $type);
        }

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        $banners = $query->orderBy('sort_order')
            ->get()
            ->map(fn (HomeBanner $banner) => [
                'id' => $banner->id,
                'type' => $banner->type,
                'image_url' => $banner->imageUrl(),
                'label' => $banner->type === HomeBanner::TYPE_PROMO ? 'Promo' : 'Agenda',
                'target_title' => $banner->type === HomeBanner::TYPE_PROMO
                    ? $banner->promo?->title
                    : $banner->agenda?->title,
                'promo_id' => $banner->promo_id,
                'agenda_id' => $banner->agenda_id,
                'sort_order' => $banner->sort_order,
                'is_active' => $banner->is_active,
                'promo' => $banner->promo
                    ? ['id' => $banner->promo->id, 'title' => $banner->promo->title, 'partner' => ['name' => $banner->promo->partner?->name]]
                    : null,
                'agenda' => $banner->agenda
                    ? ['id' => $banner->agenda->id, 'title' => $banner->agenda->title, 'event_date' => $banner->agenda->event_date?->toISOString()]
                    : null,
            ])
            ->all();

        $drawer = $this->drawerPayload($request);

        return Inertia::render('Admin/Banners/Index', [
            'banners' => $banners,
            'filters' => ['type' => $type, 'status' => $status],
            'promos' => $this->promoSelect(),
            'agendas' => $this->agendaSelect(),
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
                ->with(['promo:id,title,partner_id', 'agenda:id,title'])
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
            'agendas' => $this->agendaSelect(),
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
                'banner' => $banner->load(['promo:id,title,partner_id', 'agenda:id,title']),
            ],
            'promos' => $this->promoSelect(),
            'agendas' => $this->agendaSelect(),
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
                ->where('is_active', true)
                ->where('id', '!=', $banner->id)
                ->count();

            if ($active >= 3) {
                throw ValidationException::withMessages([
                    'is_active' => 'Maximum of 3 active banners.',
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
            'is_active' => ['required', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
        ]);

        $popup = HomePopup::query()->first();
        $data = [
            'promo_id' => $validated['promo_id'],
            'is_active' => $validated['is_active'],
        ];

        if ($request->hasFile('image')) {
            if ($popup?->image_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($popup->image_path);
            }
            $data['image_path'] = $request->file('image')->store('home-popups', 'public');
        } elseif ($request->boolean('remove_image') && $popup?->image_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($popup->image_path);
            $data['image_path'] = null;
        }

        $popup ??= new HomePopup();
        $popup->fill($data);
        $popup->save();

        return redirect()->route('admin.banners.index')->with('success', 'Opening popup settings saved.');
    }

    private function popupPayload(): ?array
    {
        $popup = HomePopup::query()->with('promo.partner')->first();

        return $popup ? [
            'id' => $popup->id,
            'promo_id' => $popup->promo_id,
            'image_path' => $popup->image_path,
            'image_url' => $popup->imageUrl(),
            'is_active' => $popup->is_active,
            'promo' => $popup->promo ? [
                'title' => $popup->promo->title,
                'partner' => ['name' => $popup->promo->partner?->name],
            ] : null,
        ] : null;
    }

    private function validateBanner(Request $request, ?HomeBanner $banner = null): array
    {
        $validated = $request->validate([
            'type' => ['required', 'in:promo,agenda'],
            'promo_id' => ['nullable', 'integer', 'required_if:type,promo', Rule::exists('promos', 'id')],
            'agenda_id' => ['nullable', 'integer', 'required_if:type,agenda', Rule::exists('community_infos', 'id')->where('is_published', true)],
            'sort_order' => ['required', 'integer', 'min:1'],
            'is_active' => ['required', 'boolean'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
        ]);

        // Keep only the foreign key matching the banner type.
        $validated['promo_id'] = $validated['type'] === HomeBanner::TYPE_PROMO ? ($validated['promo_id'] ?? null) : null;
        $validated['agenda_id'] = $validated['type'] === HomeBanner::TYPE_AGENDA ? ($validated['agenda_id'] ?? null) : null;

        unset($validated['image'], $validated['remove_image']);

        if ($request->hasFile('image')) {
            if ($banner?->image_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($banner->image_path);
            }

            $validated['image_path'] = $request->file('image')->store('banners', 'public');
        } elseif ($request->boolean('remove_image') && $banner?->image_path) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($banner->image_path);
            $validated['image_path'] = null;
        }

        if ($request->boolean('is_active')) {
            $active = HomeBanner::query()->where('is_active', true);

            if ($banner !== null) {
                $active->where('id', '!=', $banner->id);
            }

            if ($active->count() >= 3) {
                throw ValidationException::withMessages([
                    'is_active' => 'Maximum of 3 active banners.',
                ]);
            }
        }

        return $validated;
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

    private function agendaSelect(): array
    {
        return CommunityInfo::query()
            ->published()
            ->orderByDesc('event_date')
            ->get(['id', 'title', 'event_date', 'type'])
            ->all();
    }
}
