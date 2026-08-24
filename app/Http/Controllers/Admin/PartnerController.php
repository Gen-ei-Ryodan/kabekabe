<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePartnerRequest;
use App\Http\Requests\UpdatePartnerRequest;
use App\Models\Partner;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PartnerController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Partner::query()->with('user:id,name,email');

        $search = $request->string('search')->toString();

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        $partners = $query->orderBy('name')->paginate(12)->withQueryString();

        $drawer = $this->drawerPayload($request);

        if ($drawer !== null) {
            $partners->appends($request->except(['drawer', 'id']));
        }

        return Inertia::render('Admin/Partners/Index', [
            'partners' => $partners,
            'filters' => ['search' => $search],
            'drawer' => $drawer,
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
            $partner = Partner::query()->with('user:id,name,email')->find($request->integer('id'));

            if ($partner) {
                $drawer['partner'] = $partner;
            }
        }

        return $drawer;
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Partners/Create');
    }

    public function store(StorePartnerRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $vendor = User::create([
            'name' => $validated['vendor_name'],
            'email' => $validated['vendor_email'],
            'password' => $validated['vendor_password'],
            'role' => User::ROLE_VENDOR,
        ]);

        $partner = $vendor->partner()->create([
            'name' => $validated['name'],
            'slug' => Partner::slugFor($validated['name']),
            'category' => $validated['category'],
            'description' => $validated['description'] ?? null,
            'address' => $validated['address'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'logo' => $request->hasFile('logo') ? $request->file('logo')->store('partner-logos', 'public') : null,
            'is_active' => true,
        ]);

        return redirect()
            ->route('admin.partners.index')
            ->with('success', "Partner {$partner->name} created successfully.");
    }

    public function edit(Partner $partner): Response
    {
        return Inertia::render('Admin/Partners/Edit', [
            'partner' => $partner->load('user:id,name,email'),
        ]);
    }

    public function update(UpdatePartnerRequest $request, Partner $partner): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('logo')) {
            if ($partner->logo) {
                Storage::disk('public')->delete($partner->logo);
            }

            $validated['logo'] = $request->file('logo')->store('partner-logos', 'public');
        }

        $partner->update($validated);

        return redirect()
            ->route('admin.partners.index')
            ->with('success', 'Partner updated successfully.');
    }

    public function toggle(Request $request, Partner $partner): RedirectResponse
    {
        $partner->update(['is_active' => $request->boolean('is_active')]);

        return back()->with('success', $partner->is_active ? 'Partner activated.' : 'Partner deactivated.');
    }

    public function destroy(Partner $partner): RedirectResponse
    {
        $name = $partner->name;

        $partner->delete();

        return redirect()
            ->route('admin.partners.index')
            ->with('success', "Partner {$name} deleted.");
    }
}