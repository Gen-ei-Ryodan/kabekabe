<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ImportRowsRequest;
use App\Http\Requests\ReviewPaymentRequest;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\User;
use App\Services\Import\ImportTemplateDownloader;
use App\Services\Import\PaymentImporter;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $payments,
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
            'plans' => MembershipPlan::query()
                ->where('is_active', true)
                ->orderBy('duration_months')
                ->get(['id', 'name', 'duration_months', 'price']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => ['required', 'integer', Rule::exists('users', 'id')->where('role', User::ROLE_MEMBER)],
            'plan_id' => ['required', 'integer', 'exists:membership_plans,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $member = User::findOrFail($validated['member_id']);
        $plan = MembershipPlan::findOrFail($validated['plan_id']);

        DB::transaction(function () use ($member, $plan, $request, $validated) {
            $payment = $this->payments->createPending($member, $plan);

            $this->payments->approve($payment, $request->user(), $validated['notes'] ?? null);
        });

        return redirect()
            ->route('admin.payments.index')
            ->with('success', 'Payment recorded and membership updated.');
    }

    public function importTemplate(ImportTemplateDownloader $templates): StreamedResponse
    {
        return $templates->download(
            'payments-import-template.xlsx',
            ['Member Code', 'Plan', 'Period Months', 'Amount', 'Paid At'],
            ['MMB-00001', '', 12, 500000, now()->toDateString()],
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