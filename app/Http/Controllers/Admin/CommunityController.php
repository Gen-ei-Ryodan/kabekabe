<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommunityInfoRequest;
use App\Http\Requests\UpdateCommunityInfoRequest;
use App\Models\CommunityInfo;
use App\Models\EventAttendance;
use App\Models\EventNonMember;
use App\Models\Payment;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CommunityController extends Controller
{
    public function __construct(
        private readonly PaymentService $payments,
    ) {}

    public function index(Request $request): Response
    {
        $query = CommunityInfo::query()->with('creator:id,name');

        $type = $request->string('type')->toString();
        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();

        if (in_array($type, CommunityInfo::TYPES, true)) {
            $query->where('type', $type);
        }

        if ($search !== '') {
            $query->where('title', 'like', "%{$search}%");
        }

        if ($status === 'published') {
            $query->where('is_published', true);
        } elseif ($status === 'unpublished') {
            $query->where('is_published', false);
        }

        $infos = $query->orderByDesc('created_at')->paginate(12)->withQueryString();

        $drawer = $this->drawerPayload($request);

        if ($drawer !== null) {
            $infos->appends($request->except(['drawer', 'id']));
        }

        return Inertia::render('Admin/Community/Index', [
            'infos' => $infos,
            'filters' => ['type' => $type, 'search' => $search, 'status' => $status],
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
            $info = CommunityInfo::query()->find($request->integer('id'));

            if ($info) {
                $drawer['info'] = $info;
            }
        }

        return $drawer;
    }

    public function create(): Response
    {
        return Inertia::render('Admin/Community/Create');
    }

    public function store(StoreCommunityInfoRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $isPublished = (bool) ($validated['is_published'] ?? false);

        CommunityInfo::create([
            'type' => $validated['type'],
            'title' => $validated['title'],
            'content' => $validated['content'],
            'image' => $request->hasFile('image') ? $request->file('image')->store('community-images', 'public') : null,
            'event_date' => $validated['event_date'] ?? null,
            'location' => $validated['location'] ?? null,
            'fee' => $validated['fee'] ?? null,
            'is_published' => $isPublished,
            'published_at' => $isPublished ? now() : null,
            'created_by' => $request->user()->id,
        ]);

        return redirect()
            ->route('admin.community.index')
            ->with('success', 'Event created successfully.');
    }

    public function show(CommunityInfo $info): Response
    {
        $info->load([
            'creator:id,name',
            'attendances.member:id,name,member_code',
            'nonMembers',
            'payments' => fn ($q) => $q->with('member:id,name,member_code')->latest(),
        ]);

        $billedMemberIds = $info->payments->pluck('member_id')->toArray();

        return Inertia::render('Admin/Community/Show', [
            'event' => [
                'id' => $info->id,
                'type' => $info->type,
                'title' => $info->title,
                'content' => $info->content,
                'image_url' => $info->imageUrl(),
                'event_date' => $info->event_date?->toDateTimeString(),
                'location' => $info->location,
                'fee' => $info->fee,
                'is_published' => $info->is_published,
                'published_at' => $info->published_at?->toDateTimeString(),
                'created_by' => $info->creator?->name,
                'member_attendees' => $info->attendances->map(fn (EventAttendance $a) => [
                    'id' => $a->id,
                    'member_id' => $a->member_id,
                    'name' => $a->member?->name,
                    'member_code' => $a->member?->member_code,
                    'scanned_at' => $a->scanned_at?->toDateTimeString(),
                    'billed' => in_array($a->member_id, $billedMemberIds, true),
                ]),
                'non_member_attendees' => $info->nonMembers->map(fn (EventNonMember $n) => [
                    'id' => $n->id,
                    'name' => $n->name,
                    'phone' => $n->phone,
                    'email' => $n->email,
                    'attended' => $n->attended,
                    'attended_at' => $n->attended_at?->toDateTimeString(),
                ]),
                'payments' => $info->payments->map(fn (Payment $p) => [
                    'id' => $p->id,
                    'invoice_number' => $p->invoice_number,
                    'amount' => $p->amount,
                    'status' => $p->status,
                    'member_name' => $p->member?->name,
                    'member_code' => $p->member?->member_code,
                    'paid_at' => $p->paid_at?->toDateTimeString(),
                ]),
            ],
            'members' => User::query()
                ->where('role', User::ROLE_MEMBER)
                ->orderBy('name')
                ->get(['id', 'name', 'member_code']),
        ]);
    }

    public function edit(CommunityInfo $info): Response
    {
        return Inertia::render('Admin/Community/Edit', [
            'info' => $info,
        ]);
    }

    public function update(UpdateCommunityInfoRequest $request, CommunityInfo $info): RedirectResponse
    {
        $validated = $request->validated();

        $isPublished = (bool) ($validated['is_published'] ?? false);

        if ($request->hasFile('image')) {
            if ($info->image) {
                Storage::disk('public')->delete($info->image);
            }

            $validated['image'] = $request->file('image')->store('community-images', 'public');
        }

        $info->update([
            'type' => $validated['type'],
            'title' => $validated['title'],
            'content' => $validated['content'],
            'image' => $validated['image'] ?? $info->image,
            'event_date' => $validated['event_date'] ?? null,
            'location' => $validated['location'] ?? null,
            'fee' => $validated['fee'] ?? null,
            'is_published' => $isPublished,
            'published_at' => $isPublished ? ($info->published_at ?? now()) : null,
        ]);

        return redirect()
            ->route('admin.community.index')
            ->with('success', 'Event updated successfully.');
    }

    public function destroy(CommunityInfo $info): RedirectResponse
    {
        $info->delete();

        return redirect()
            ->route('admin.community.index')
            ->with('success', 'Event deleted.');
    }

    public function scanAttendance(Request $request, CommunityInfo $info): RedirectResponse
    {
        $token = $request->string('token')->toString();

        $member = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->where('card_token', $token)
            ->first();

        if (! $member) {
            return back()->with('error', 'Member card not found. Please scan a valid member QR code.');
        }

        if ($this->recordMemberAttendance($info, $member)) {
            return back()->with('success', "Attendance recorded for {$member->name}.");
        }

        return back()->with('error', "{$member->name} is already recorded as attended.");
    }

    public function storeAttendance(Request $request, CommunityInfo $info): RedirectResponse
    {
        $memberId = $request->integer('member_id');

        if ($memberId) {
            $member = User::query()->where('role', User::ROLE_MEMBER)->find($memberId);

            if (! $member) {
                return back()->with('error', 'Member not found.');
            }

            if ($this->recordMemberAttendance($info, $member)) {
                return back()->with('success', "Attendance recorded for {$member->name}.");
            }

            return back()->with('error', "{$member->name} is already recorded as attended.");
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        EventNonMember::create([
            'event_id' => $info->id,
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'attended' => true,
            'attended_at' => now(),
        ]);

        return back()->with('success', 'Non-member attendance recorded.');
    }

    private function recordMemberAttendance(CommunityInfo $info, User $member): bool
    {
        $exists = EventAttendance::query()
            ->where('event_id', $info->id)
            ->where('member_id', $member->id)
            ->exists();

        if ($exists) {
            return false;
        }

        EventAttendance::create([
            'event_id' => $info->id,
            'member_id' => $member->id,
            'scanned_at' => now(),
        ]);

        return true;
    }

    public function storePayment(Request $request, CommunityInfo $info): RedirectResponse
    {
        $memberId = $request->integer('member_id');
        $member = User::query()->where('role', User::ROLE_MEMBER)->find($memberId);

        if (! $member) {
            return back()->with('error', 'Member not found.');
        }

        $fee = $info->fee ?? 0;

        if ($fee <= 0) {
            return back()->with('error', 'Event does not have a contribution fee set.');
        }

        $existing = Payment::query()
            ->where('event_id', $info->id)
            ->where('member_id', $member->id)
            ->exists();

        if ($existing) {
            return back()->with('error', 'This member already has a bill for this event.');
        }

        DB::transaction(function () use ($info, $member, $fee, $request) {
            $plan = $member->payments()->latest()->first()?->plan;
            $invoiceNumber = 'INV-' . now()->format('YmdHis') . '-' . strtoupper(substr(uniqid(), -4));

            Payment::create([
                'invoice_number' => $invoiceNumber,
                'member_id' => $member->id,
                'plan_id' => $plan?->id,
                'event_id' => $info->id,
                'period_months' => $plan?->duration_months ?? 0,
                'amount' => $fee,
                'status' => Payment::STATUS_APPROVED,
                'paid_at' => now(),
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
                'notes' => "Urunan Kegiatan: {$info->title}",
            ]);
        });

        return back()->with('success', "Contribution bill created for {$member->name}.");
    }

    public function storeNonMember(Request $request, CommunityInfo $info): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        EventNonMember::create([
            'event_id' => $info->id,
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'attended' => false,
        ]);

        return back()->with('success', 'Non-member participant added.');
    }
}
