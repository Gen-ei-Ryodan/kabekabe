<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportRowsRequest;
use App\Http\Requests\ReviewPaymentRequest;
use App\Models\Membership;
use App\Models\Payment;
use App\Models\User;
use App\Services\Import\ImportTemplateDownloader;
use App\Services\Import\PaymentImporter;
use App\Services\MembershipService;
use App\Services\NotificationService;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $payments,
        private readonly MembershipService $memberships,
        private readonly NotificationService $notifications,
    ) {}

    public function index(Request $request): Response
    {
        $query = Payment::query()->with(['member:id,name,member_code,company', 'plan:id,name,duration_months']);

        $status = $request->string('status')->toString() ?: 'pending';
        $search = $request->string('search')->toString();

        if (in_array($status, ['pending', 'approved', 'rejected', 'expired'], true)) {
            $query->where('status', $status);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                    ->orWhereHas('member', fn ($m) => $m->where('name', 'like', "%{$search}%")->orWhere('member_code', 'like', "%{$search}%"));
            });
        }

        $payments = $query->orderByRaw("CASE status WHEN 'pending' THEN 0 WHEN 'approved' THEN 1 WHEN 'rejected' THEN 2 WHEN 'expired' THEN 3 ELSE 4 END")
            ->orderByDesc('created_at')
            ->paginate(12)
            ->withQueryString();

        $drawer = $this->drawerPayload($request);

        if ($drawer !== null) {
            $payments->appends($request->except(['drawer', 'id']));
        }

        return Inertia::render('Admin/Payments/Index', [
            'payments' => $payments,
            'filters' => ['status' => $status, 'search' => $search],
            'drawer' => $drawer,
        ]);
    }

    private function drawerPayload(Request $request): ?array
    {
        $mode = $request->string('drawer')->toString();

        if ($mode !== 'show') {
            return null;
        }

        $payment = Payment::query()
            ->with(['member:id,name,member_code,company,phone', 'plan:id,name,duration_months', 'approver:id,name'])
            ->find($request->integer('id'));

        if (! $payment) {
            return null;
        }

        return [
            'mode' => 'show',
            'payment' => $payment,
        ];
    }

    public function create(): Response
    {
        $members = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->with('membership')
            ->orderBy('name')
            ->get(['id', 'name', 'member_code']);

        $members->each(function (User $member) {
            $member->membership_status = $member->hasActiveMembership() ? 'active' : 'inactive';
            $plan = $member->membership?->getLatestPlan();
            $member->membership_plan = $plan ? [
                'name' => $plan->name,
                'price' => $plan->price,
                'duration_months' => $plan->duration_months,
            ] : null;
        });

        return Inertia::render('Admin/Payments/Create', [
            'members' => $members,
        ]);
    }

    /**
     * Catat pembayaran (menu Catat Pembayaran).
     * Tanggal masa aktif diisi admin, membership langsung aktif/di-set sesuai input.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => ['required', 'integer', Rule::exists('users', 'id')->where('role', User::ROLE_MEMBER)],
            'plan_id' => ['nullable', 'integer', 'exists:membership_plans,id'],
            'amount' => ['required', 'integer', 'min:0'],
            'started_at' => ['required', 'date'],
            'expires_at' => ['required', 'date', 'after_or_equal:started_at'],
            'method' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $member = User::findOrFail($validated['member_id']);

        DB::transaction(function () use ($member, $request, $validated) {
            $this->recordApprovedPayment($member, $validated, $request->user(), now());
        });

        $this->notifications->send(
            $member,
            'Pembayaran Disetujui',
            'Membership Anda aktif hingga '.Carbon::parse($validated['expires_at'])->endOfDay()->translatedFormat('d F Y').'.',
            'membership',
            '/member/history',
        );

        return redirect()
            ->route('admin.payments.index')
            ->with('success', 'Payment recorded and membership updated.');
    }

    /**
     * Riwayat pembayaran manual oleh admin dari halaman detail member.
     * Dengan tanggal masa aktif -> perpanjang membership; tanpa tanggal -> catatan riwayat saja.
     */
    public function storeManual(Request $request, User $member): RedirectResponse
    {
        abort_unless($member->isMember(), 404);

        $validated = $request->validate([
            'paid_at' => ['required', 'date'],
            'amount' => ['required', 'integer', 'min:0'],
            'method' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'started_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:started_at'],
        ]);

        $hasPeriod = ! empty($validated['started_at']) || ! empty($validated['expires_at']);

        DB::transaction(function () use ($member, $validated, $request) {
            $this->recordApprovedPayment($member, $validated, $request->user(), $validated['paid_at']);
        });

        $message = "Pembayaran manual untuk {$member->name} tercatat.";

        if ($hasPeriod) {
            $message .= ' Status & masa aktif membership ikut diperbarui.';
        }

        return back()->with('success', $message);
    }

    /**
     * Simpan pembayaran berstatus approved + (opsional) set membership aktif
     * sesuai rentang tanggal yang diisi admin.
     */
    private function recordApprovedPayment(User $member, array $validated, User $admin, string|Carbon $paidAt): void
    {
        $started = $validated['started_at'] ?? null;
        $expires = $validated['expires_at'] ?? null;
        $hasPeriod = ! empty($started) || ! empty($expires);

        $member->payments()->create([
            'invoice_number' => $this->payments->nextInvoiceNumber(),
            'plan_id' => $validated['plan_id'] ?? null,
            'period_months' => $started && $expires
                ? (int) Carbon::parse($started)->diffInDays(Carbon::parse($expires))
                : 0,
            'amount' => $validated['amount'],
            'status' => Payment::STATUS_APPROVED,
            'paid_at' => $paidAt,
            'method' => $validated['method'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'approved_by' => $admin->id,
            'approved_at' => now(),
        ]);

        if (! $hasPeriod) {
            return;
        }

        $membership = $this->memberships->ensureMembership($member);

        $membership->forceFill([
            'status' => $membership->expires_at && $membership->expires_at->isPast() && empty($expires)
                ? Membership::STATUS_INACTIVE
                : Membership::STATUS_ACTIVE,
            'started_at' => $started ?? $membership->started_at,
            'expires_at' => $expires ?? $membership->expires_at,
        ])->save();

        $member->setRelation('membership', $membership->fresh());
    }

    public function importTemplate(ImportTemplateDownloader $templates): StreamedResponse
    {
        return $templates->download(
            'payments-import-template.xlsx',
            ['Member Code', 'Plan', 'Period Months', 'Amount', 'Paid At'],
            ['70302609001', '', 12, 500000, now()->toDateString()],
        );
    }

    public function import(ImportRowsRequest $request, PaymentImporter $importer): RedirectResponse
    {
        $result = $importer->import($request->user(), $request->file('file')->getRealPath());

        if ($result['imported'] === 0) {
            return back()->with('error', 'Import failed. '.$result['errors'][0]);
        }

        $message = "{$result['imported']} payment(s) imported.";

        if ($result['failed'] > 0) {
            $message .= " {$result['failed']} row(s) skipped. First error: {$result['errors'][0]}";
        }

        return back()->with('success', $message);
    }

    public function show(Payment $payment): Response
    {
        return Inertia::render('Admin/Payments/Show', [
            'payment' => $payment->load(['member:id,name,member_code,company,phone', 'plan:id,name,duration_months', 'approver:id,name']),
        ]);
    }

    public function approve(ReviewPaymentRequest $request, Payment $payment): RedirectResponse
    {
        abort_unless($payment->isPending(), 422);

        $this->payments->approve($payment, $request->user(), $request->input('notes'));

        return redirect()
            ->route('admin.payments.index', ['status' => 'approved'])
            ->with('success', 'Payment approved and membership extended.');
    }

    public function reject(ReviewPaymentRequest $request, Payment $payment): RedirectResponse
    {
        abort_unless($payment->isPending(), 422);

        $this->payments->reject($payment, $request->user(), $request->input('notes') ?? 'Invalid payment proof.');

        return redirect()
            ->route('admin.payments.index', ['status' => 'rejected'])
            ->with('success', 'Payment rejected.');
    }
}
