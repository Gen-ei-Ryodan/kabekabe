<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportRowsRequest;
use App\Http\Requests\StoreMemberRequest;
use App\Http\Requests\UpdateMemberRequest;
use App\Models\Payment;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Import\ImportTemplateDownloader;
use App\Services\Import\MemberImporter;
use App\Services\MembershipService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MemberController extends Controller
{
    public function __construct(
        private readonly MembershipService $memberships,
    ) {}

    public function index(Request $request): Response
    {
        $query = User::query()->where('role', User::ROLE_MEMBER)->with('membership');

        $search = $request->string('search')->toString();
        $name = $request->string('name')->toString();
        $memberId = $request->string('member_id')->toString();

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('member_code', 'like', "%{$search}%");
            });
        }

        if ($name !== '') {
            $query->where('name', 'like', "%{$name}%");
        }

        if ($memberId !== '') {
            $query->where('member_code', 'like', "%{$memberId}%");
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

        $validFrom = $request->string('valid_from')->toString();
        $validTo = $request->string('valid_to')->toString();
        $joinedFrom = $request->string('joined_from')->toString();
        $joinedTo = $request->string('joined_to')->toString();

        if ($validFrom !== '' || $validTo !== '') {
            $query->whereHas('membership', function ($q) use ($validFrom, $validTo) {
                $q->when($validFrom !== '', fn ($membership) => $membership->whereDate('expires_at', '>=', $validFrom))
                    ->when($validTo !== '', fn ($membership) => $membership->whereDate('expires_at', '<=', $validTo));
            });
        }

        $query->when($joinedFrom !== '', fn ($q) => $q->whereDate('created_at', '>=', $joinedFrom))
            ->when($joinedTo !== '', fn ($q) => $q->whereDate('created_at', '<=', $joinedTo));

        $members = $query->orderByDesc('created_at')->paginate(12)->withQueryString();

        $members->getCollection()->transform(fn (User $m) => $this->memberPayload($m));

        $drawer = $this->drawerPayload($request);

        if ($drawer !== null) {
            $members->appends($request->except(['drawer', 'id']));
        }

        return Inertia::render('Admin/Members/Index', [
            'members' => $members,
            'filters' => [
                'search' => $search,
                'name' => $name,
                'member_id' => $memberId,
                'status' => $status,
                'valid_from' => $validFrom,
                'valid_to' => $validTo,
                'joined_from' => $joinedFrom,
                'joined_to' => $joinedTo,
            ],
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
            'gender' => $validated['gender'] ?? null,
            'birth_date' => $validated['birth_date'] ?? null,
            'religion' => $validated['religion'] ?? null,
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => User::ROLE_MEMBER,
            'phone' => $validated['phone'] ?? null,
            'whatsapp' => $validated['whatsapp'] ?? null,
            'company' => $validated['company'] ?? null,
        ]);

        $this->memberships->activateUntil($member, $validated['valid_until']);

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

    public function importTemplate(ImportTemplateDownloader $templates): StreamedResponse
    {
        return $templates->download(
            'members-import-template.xlsx',
            ['Name', 'Email', 'Password', 'Phone', 'WhatsApp', 'Company', 'Valid Until'],
            ['Budi Santoso', 'budi@example.com', '', '081234567890', '081234567890', 'PT Maju Jaya', now()->addMonths(6)->toDateString()],
        );
    }

    public function import(ImportRowsRequest $request, MemberImporter $importer): RedirectResponse
    {
        $result = $importer->import($request->user(), $request->file('file')->getRealPath());

        if ($result['imported'] === 0) {
            return back()->with('error', 'Import failed. '.$result['errors'][0]);
        }

        $message = "{$result['imported']} member(s) imported.";

        if ($result['failed'] > 0) {
            $message .= " {$result['failed']} row(s) skipped. First error: {$result['errors'][0]}";
        }

        return back()->with('success', $message);
    }

    public function update(UpdateMemberRequest $request, User $member): RedirectResponse
    {
        $validated = $request->validated();

        $member->update([
            'name' => $validated['name'],
            'gender' => $validated['gender'] ?? null,
            'birth_date' => $validated['birth_date'] ?? null,
            'religion' => $validated['religion'] ?? null,
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
            'gender' => $m->gender,
            'birth_date' => $m->birth_date?->toDateString(),
            'religion' => $m->religion,
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
