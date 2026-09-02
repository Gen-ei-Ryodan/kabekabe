<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Transaction::query()
            ->with(['partner:id,name,category', 'member:id,name,member_code'])
            ->when($request->string('from')->toString(), fn ($q, $from) => $q->whereDate('transacted_at', '>=', $from))
            ->when($request->string('to')->toString(), fn ($q, $to) => $q->whereDate('transacted_at', '<=', $to))
            ->when($request->string('search')->toString(), fn ($q, $s) => $q->where(function ($q2) use ($s) {
                $q2->where('transaction_number', 'like', "%{$s}%")
                    ->orWhereHas('member', fn ($m) => $m->where('name', 'like', "%{$s}%")->orWhere('member_code', 'like', "%{$s}%"));
            }))
            ->when($request->integer('partner_id'), fn ($q, $id) => $q->where('partner_id', $id))
            ->when($request->integer('member_id'), fn ($q, $id) => $q->where('member_id', $id));

        $transactions = $query->orderByDesc('transacted_at')->paginate(15)->withQueryString();

        $drawer = $this->drawerPayload($request);

        if ($drawer !== null) {
            $transactions->appends($request->except(['drawer', 'id']));
        }

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => [
                'from' => $request->string('from')->toString(),
                'to' => $request->string('to')->toString(),
                'search' => $request->string('search')->toString(),
                'partner_id' => $request->integer('partner_id') ?: null,
                'member_id' => $request->integer('member_id') ?: null,
            ],
            'partners' => Partner::query()->orderBy('name')->get(['id', 'name']),
            'members' => User::query()->where('role', User::ROLE_MEMBER)->orderBy('name')->get(['id', 'name', 'member_code']),
            'drawer' => $drawer,
        ]);
    }

    private function drawerPayload(Request $request): ?array
    {
        $mode = $request->string('drawer')->toString();

        if ($mode !== 'show') {
            return null;
        }

        $transaction = Transaction::query()
            ->with(['partner:id,name,category,address,phone,email', 'member:id,name,member_code,company', 'promo:id,title'])
            ->find($request->integer('id'));

        if (! $transaction) {
            return null;
        }

        return [
            'mode' => 'show',
            'transaction' => $transaction,
        ];
    }

    public function show(Transaction $transaction): Response
    {
        return Inertia::render('Admin/Transactions/Show', [
            'transaction' => $transaction->load(['partner:id,name,category,address,phone,email', 'member:id,name,member_code,company', 'promo:id,title']),
        ]);
    }
}