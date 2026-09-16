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
        $query = Partner::query()->with('user:id,name,email,approval_status');

        $search = $request->string('search')->toString();
        $category = $request->string('category')->toString();
        $status = $request->string('status')->toString();

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($status === 'pending') {
            $query->where(function ($q) {
                $q->where('status', 'inactive')
                    ->whereHas('user', fn ($u) => $u->where('approval_status', User::APPROVAL_PENDING));
            });
        } elseif ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        if ($category !== '') {
            $query->where('category', $category);
        }

        $partners = $query->orderByRaw('COALESCE(sort_number, 999999) ASC')
            ->orderBy('name')
            ->paginate(12)
            ->withQueryString();

        $drawer = $this->drawerPayload($request);

        if ($drawer !== null) {
            $partners->appends($request->except(['drawer', 'id']));
        }

        $pendingCount = Partner::query()
            ->whereHas('user', fn ($u) => $u->where('approval_status', User::APPROVAL_PENDING))
            ->count();

        return Inertia::render('Admin/Partners/Index', [
            'partners' => $partners,
            'pending_count' => $pendingCount,
            'filters' => ['search' => $search, 'category' => $category, 'status' => $status],
            'categories' => Partner::query()->select('category')->distinct()->orderBy('category')->pluck('category'),
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
            $partner = Partner::query()->with('user:id,name,nickname,email,approval_status,birth_date,birth_place,hobbies,gender,marital_status,religion,place_of_worship_address,phone,address,city,district')->find($request->integer('id'));

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

    public function show(Partner $partner): Response
    {
        return Inertia::render('Admin/Partners/Show', [
            'partner' => $partner->load('user:id,name,email'),
            'transactions' => $partner->transactions()->with('member:id,name')->latest('transacted_at')->limit(10)->get(),
            'promos' => $partner->promos()->latest()->limit(10)->get(),
        ]);
    }

    public function store(StorePartnerRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $isMember = (bool) ($validated['is_member'] ?? false);

        $vendorUser = User::create([
            'name' => $validated['vendor_name'],
            'nickname' => $validated['nickname'] ?? null,
            'email' => $validated['vendor_email'],
            'password' => $validated['vendor_password'],
            'role' => User::ROLE_VENDOR,
            'phone' => $validated['phone'] ?? $validated['member_phone'] ?? null,
            'whatsapp' => $validated['phone'] ?? $validated['member_phone'] ?? null,
            'gender' => $isMember ? null : ($validated['gender'] ?? null),
            'birth_date' => $isMember ? ($validated['member_birth_date'] ?? null) : ($validated['birth_date'] ?? null),
            'birth_place' => $isMember ? null : ($validated['birth_place'] ?? null),
            'hobbies' => $isMember ? null : ($validated['hobbies'] ?? null),
            'marital_status' => $isMember ? null : ($validated['marital_status'] ?? null),
            'religion' => $isMember ? null : ($validated['religion'] ?? null),
            'place_of_worship_address' => $isMember ? null : ($validated['place_of_worship_address'] ?? null),
            'address' => $isMember ? ($validated['address'] ?? null) : ($validated['member_address'] ?? $validated['address'] ?? null),
            'district' => $isMember ? ($validated['district'] ?? null) : ($validated['member_district'] ?? $validated['district'] ?? null),
            'city' => $isMember ? ($validated['city'] ?? null) : ($validated['member_city'] ?? $validated['city'] ?? null),
            'approval_status' => User::APPROVAL_APPROVED,
        ]);

        $partner = $vendorUser->partner()->create([
            'name' => $validated['name'],
            'trade_name' => $validated['trade_name'] ?? null,
            'slug' => Partner::slugFor(($validated['trade_name'] ?? null) ?: $validated['name']),
            'category' => $validated['category'],
            'industry' => $validated['industry'] ?? null,
            'employee_count' => $validated['employee_count'] ?? null,
            'established_since' => $validated['established_since'] ?? null,
            'pic_name' => $validated['pic_name'] ?? $validated['vendor_name'],
            'pic_phone' => $validated['pic_phone'] ?? null,
            'description' => $validated['description'] ?? null,
            'address' => $validated['address'] ?? null,
            'district' => $validated['district'] ?? null,
            'city' => $validated['city'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'email' => $validated['email'] ?? null,
            'logo' => $request->hasFile('logo') ? $request->file('logo')->store('partner-logos', 'public') : null,
            'joined_at' => $validated['joined_at'] ?? now(),
            'expires_at' => $validated['expires_at'] ?? now()->addYear(),
            'is_active' => true,
            'status' => Partner::STATUS_ACTIVE,
            'is_member' => $isMember,
            'member_id_number' => $isMember ? ($validated['member_id_number'] ?? null) : null,
            'member_name' => $isMember ? ($validated['member_name'] ?? null) : $validated['vendor_name'],
            'member_birth_date' => $isMember ? ($validated['member_birth_date'] ?? null) : ($validated['birth_date'] ?? null),
            'total_belanja' => $validated['total_belanja'] ?? null,
            'diskon1' => $validated['diskon1'] ?? null,
            'diskon2' => $validated['diskon2'] ?? null,
            'diskon3' => $validated['diskon3'] ?? null,
            'sort_number' => $validated['sort_number'] ?? null,
        ]);

        return redirect()
            ->route('admin.partners.index')
            ->with('success', "Partner {$partner->name} created successfully.");
    }

    public function edit(Partner $partner): Response
    {
        return Inertia::render('Admin/Partners/Edit', [
            'partner' => $partner->load('user:id,name,nickname,email,approval_status,birth_date,birth_place,hobbies,gender,marital_status,religion,place_of_worship_address,phone,address,city,district'),
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

        $partnerFields = [
            'name', 'trade_name', 'category', 'industry', 'employee_count', 'established_since',
            'pic_name', 'pic_phone', 'district', 'city', 'joined_at', 'expires_at',
            'description', 'address', 'phone', 'email', 'sort_number',
            'total_belanja', 'diskon1', 'diskon2', 'diskon3', 'is_member',
            'member_id_number', 'member_name', 'member_birth_date',
        ];
        if (isset($validated['logo'])) {
            $partnerFields[] = 'logo';
        }

        $partner->update(array_intersect_key($validated, array_flip($partnerFields)));

        if ($partner->user) {
            $userUpdate = [];
            if (array_key_exists('pic_name', $validated) && $validated['pic_name']) {
                $userUpdate['name'] = $validated['pic_name'];
            }
            if (array_key_exists('nickname', $validated)) $userUpdate['nickname'] = $validated['nickname'];
            if (array_key_exists('gender', $validated)) $userUpdate['gender'] = $validated['gender'];
            if (array_key_exists('birth_place', $validated)) $userUpdate['birth_place'] = $validated['birth_place'];
            if (array_key_exists('birth_date', $validated)) $userUpdate['birth_date'] = $validated['birth_date'];
            if (array_key_exists('marital_status', $validated)) $userUpdate['marital_status'] = $validated['marital_status'];
            if (array_key_exists('religion', $validated)) $userUpdate['religion'] = $validated['religion'];
            if (array_key_exists('place_of_worship_address', $validated)) $userUpdate['place_of_worship_address'] = $validated['place_of_worship_address'];
            if (array_key_exists('member_phone', $validated) && $validated['member_phone']) $userUpdate['phone'] = $validated['member_phone'];
            if (array_key_exists('member_address', $validated) && $validated['member_address']) $userUpdate['address'] = $validated['member_address'];
            if (array_key_exists('member_district', $validated) && $validated['member_district']) $userUpdate['district'] = $validated['member_district'];
            if (array_key_exists('member_city', $validated) && $validated['member_city']) $userUpdate['city'] = $validated['member_city'];
            if (array_key_exists('hobbies', $validated)) $userUpdate['hobbies'] = $validated['hobbies'];

            if (! empty($userUpdate)) {
                $partner->user->update($userUpdate);
            }
        }

        return redirect()
            ->route('admin.partners.index')
            ->with('success', 'Partner updated successfully.');
    }

    public function toggle(Request $request, Partner $partner): RedirectResponse
    {
        $partner->update(['is_active' => $request->boolean('is_active')]);

        return back()->with('success', $partner->is_active ? 'Partner activated.' : 'Partner deactivated.');
    }

    public function approve(Partner $partner): RedirectResponse
    {
        $partner->forceFill([
            'status' => Partner::STATUS_ACTIVE,
            'is_active' => true,
            'joined_at' => $partner->joined_at ?? now(),
            'expires_at' => $partner->expires_at ?? now()->addYear(),
        ])->save();

        if ($partner->user) {
            $partner->user->forceFill(['approval_status' => \App\Models\User::APPROVAL_APPROVED])->save();
        }

        return back()->with('success', "Pendaftaran partner {$partner->name} berhasil disetujui.");
    }

    public function reject(Partner $partner): RedirectResponse
    {
        $partner->forceFill([
            'status' => Partner::STATUS_INACTIVE,
            'is_active' => false,
        ])->save();

        if ($partner->user) {
            $partner->user->forceFill(['approval_status' => \App\Models\User::APPROVAL_REJECTED])->save();
        }

        return back()->with('success', "Pendaftaran partner {$partner->name} ditolak.");
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
