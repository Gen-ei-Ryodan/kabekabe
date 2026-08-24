<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateMemberRequest;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\User;
use App\Services\MembershipService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MemberController extends Controller
{
    public function __construct(
        private readonly MembershipService $memberships,
    ) {}

    public function index(Request $request): Response
    {
        $query = User::query()->where('role', User::ROLE_MEMBER)->with('membership');

        $search = $request->string('search')->toString();

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('member_code', 'like', "%{$search}%");
            });
        }

        $status = $request->string('status')->toString();

        if ($status === 'active') {
            $query->whereHas('membership', fn ($q) => $q->where('status', 'active')->where('expires_at', '>', now()));
        } elseif ($status === 'inactive') {
            $query->where(function ($q) {
                $q->whereDoesntHave('membership')
                    ->orWhereHas('membership', fn ($m) => $m->where('status', 'inactive')->orWhere('expires_at', '<=', now()));
            });
        }

        $members = $query->orderByDesc('created_at')->paginate(12)->withQueryString();

        $members->getCollection()->transform(fn (User $m) => $this->memberPayload($m));

        $drawer = $this->drawerPayload($request);

        if ($drawer !== null) {
            $members->appends($request->except(['drawer', 'id']));
        }

        return Inertia::render('Admin/Members/Index', [
            'members' => $members,
            'filters' => ['search' => $search, 'status' => $status],
            'drawer' => $drawer,
        ]);
    }

    private function drawerPayload(Request $request): ?array
    {
        $mode = $request->string('drawer')->toString();

        if (! in_array($mode, ['create', 'edit', 'show'], true)) {
            return null;
        }

        $drawer = ['mode' => $mode];

        if ($mode !== 'create') {
            $member = User::query()->where('role', User::ROLE_MEMBER)->find($request->integer('id'));

            if ($member) {
                $member->load('membership.plan');
                $drawer['member'] = $this->memberPayload($member);

                if ($mode === 'show') {
                    $drawer['membership'] = $member->membership;
                    $drawer['payments'] = $member->payments()->with('plan:id,name,duration_months')->latest()->limit(10)->get();
                    $drawer['transactions'] = $member->memberTransactions()->with('partner:id,name')->latest('transacted_at')->limit(10)->get();
                }
            }
        }

        return $drawer;
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Members/Create');
    }

    public function store(StoreMemberRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $member = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => User::ROLE_MEMBER,
            'phone' => $validated['phone'] ?? null,
            'whatsapp' => $validated['whatsapp'] ?? null,
            'company' => $validated['company'] ?? null,
        ]);

        $this->memberships->activate($member, (int) $validated['membership_period']);

        return redirect()
            ->route('admin.members.index')
            ->with('success', "Member {$member->name} created successfully.");
    }

    public function show(User $member): Response
    {
        abort_unless($member->isMember(), 404);

        $member->load('membership.plan');

        return Inertia::render('Admin/Members/Show', [
            'member' => $this->memberPayload($member),
            'membership' => $member->membership,
            'payments' => $member->payments()->with('plan:id,name,duration_months')->latest()->limit(10)->get(),
            'transactions' => $member->memberTransactions()->with('partner:id,name')->latest('transacted_at')->limit(10)->get(),
        ]);
    }

    public function edit(User $member): Response
    {
        abort_unless($member->isMember(), 404);

        return Inertia::render('Admin/Members/Edit', [
            'member' => $this->memberPayload($member),
        ]);
    }

    public function update(UpdateMemberRequest $request, User $member): RedirectResponse
    {
        $validated = $request->validated();

        $member->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'whatsapp' => $validated['whatsapp'] ?? null,
            'company' => $validated['company'] ?? null,
            'password' => $validated['password'] ?? $member->password,
        ]);

        return redirect()
            ->route('admin.members.index')
            ->with('success', 'Member updated successfully.');
    }

    public function toggleStatus(Request $request, User $member): RedirectResponse
    {
        abort_unless($member->isMember(), 404);

        $action = $request->string('action')->toString();

        if ($action === 'deactivate') {
            $this->memberships->deactivate($member);
            $message = "Member's membership deactivated.";
        } else {
            $this->memberships->activate($member, (int) $request->integer('months', 12));
            $message = "Member's membership activated.";
        }

        return back()->with('success', $message);
    }

    public function destroy(User $member): RedirectResponse
    {
        abort_unless($member->isMember(), 404);

        $name = $member->name;

        $member->delete();

        return redirect()
            ->route('admin.members.index')
            ->with('success', "Member {$name} deleted.");
    }

    private function memberPayload(User $m): array
    {
        return [
            'id' => $m->id,
            'name' => $m->name,
            'email' => $m->email,
            'member_code' => $m->member_code,
            'phone' => $m->phone,
            'whatsapp' => $m->whatsapp,
            'company' => $m->company,
            'avatar_url' => $m->avatarUrl(),
            'created_at' => $m->created_at?->format('d M Y'),
            'membership_status' => $m->hasActiveMembership() ? 'active' : 'inactive',
            'expires_at' => $m->membership?->expires_at?->format('d M Y'),
        ];
    }
}