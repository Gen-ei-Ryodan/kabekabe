<?php

namespace App\Http\Controllers\Vendor;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Models\Promo;
use App\Models\Transaction;
use App\Models\User;
use App\Services\TransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function __construct(
        private readonly TransactionService $transactions,
    ) {}

    public function index(Request $request): Response
    {
        $partner = auth()->user()->partner;

        abort_if($partner === null, 403);

        $transactions = Transaction::query()
            ->where('partner_id', $partner->id)
            ->with('member:id,name,member_code')
            ->when($request->string('from')->toString(), fn ($q, $from) => $q->whereDate('transacted_at', '>=', $from))
            ->when($request->string('to')->toString(), fn ($q, $to) => $q->whereDate('transacted_at', '<=', $to))
            ->when($request->string('search')->toString(), fn ($q, $s) => $q->where(function ($q2) use ($s) {
                $q2->where('transaction_number', 'like', "%{$s}%")
                    ->orWhereHas('member', fn ($m) => $m->where('name', 'like', "%{$s}%")->orWhere('member_code', 'like', "%{$s}%"));
            }))
            ->orderByDesc('transacted_at')
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Vendor/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => [
                'from' => $request->string('from')->toString(),
                'to' => $request->string('to')->toString(),
                'search' => $request->string('search')->toString(),
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $partner = auth()->user()->partner;

        abort_if($partner === null, 403);

        $promos = Promo::query()
            ->where('partner_id', $partner->id)
            ->where('status', Promo::STATUS_APPROVED)
            ->where('is_active', true)
            ->where('start_date', '<=', now()->toDateString())
            ->where('end_date', '>=', now()->toDateString())
            ->get();

        $scan = $request->string('scan')->toString() ?: $request->string('member_code')->toString();

        return Inertia::render('Vendor/Transactions/Create', [
            'promos' => $promos,
            'member' => $this->resolveScannedMember($scan),
        ]);
    }

    private function resolveScannedMember(string $scan): ?array
    {
        if ($scan === '') {
            return null;
        }

        $member = User::query()
            ->where('role', User::ROLE_MEMBER)
            ->where(function ($q) use ($scan) {
                $q->where('card_token', $scan)->orWhere('member_code', $scan);
            })
            ->with('membership')
            ->first();

        if ($member === null) {
            return ['found' => false];
        }

        $member->ensureMemberCode();

        $active = $member->hasActiveMembership();

        return [
            'found' => true,
            'active' => $active,
            'name' => $member->name,
            'member_code' => $member->member_code,
            'avatar_url' => $member->avatarUrl(),
            'company' => $member->company,
            'status_label' => $active ? 'ACTIVE' : 'INACTIVE',
            'expires_at' => $member->membership?->expires_at?->format('d M Y'),
        ];
    }

    public function store(StoreTransactionRequest $request): RedirectResponse
    {
        $partner = $request->user()->partner;

        abort_if($partner === null, 403);

        $member = User::query()->where('member_code', $request->input('member_code'))->firstOrFail();

        $promo = $request->filled('promo_id')
            ? Promo::query()->where('partner_id', $partner->id)->findOrFail($request->integer('promo_id'))
            : null;

        $proofPath = null;

        if ($request->hasFile('proof')) {
            $proofPath = $request->file('proof')->store('transaction-proofs', 'public');
        }

        try {
            $this->transactions->record(
                $partner,
                $member,
                $promo,
                $request->integer('total'),
                $request->input('note'),
                $proofPath,
                $request->input('transaction_number'),
            );
        } catch (\DomainException $e) {
            if ($proofPath) {
                Storage::disk('public')->delete($proofPath);
            }

            return back()->withErrors(['member_code' => $e->getMessage()]);
        }

        return redirect()
            ->route('vendor.transactions.index')
            ->with('success', 'Transaction recorded successfully.');
    }
}