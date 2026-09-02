<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use App\Services\PaymentGateway\FaspayService;
use App\Services\Whatsapp\WaBlastService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class IntegrationController extends Controller
{
    public function __construct(
        private readonly FaspayService $faspay,
        private readonly WaBlastService $waBlast,
    ) {}

    public function __invoke(): Response
    {
        return Inertia::render('Admin/Integrations/Index', [
            'faspay' => [
                'provider' => 'Faspay',
                'merchant_id' => config('services.faspay.merchant_id', 'DUMMY_FASPAY_MERCHANT'),
                'modes' => [
                    FaspayService::CHANNEL_VIRTUAL_ACCOUNT => 'Virtual Account',
                    FaspayService::CHANNEL_EWALLET => 'E-Wallet',
                    FaspayService::CHANNEL_QRIS => 'QRIS',
                ],
            ],
            'wa_blast' => [
                'provider' => 'WA Blast (stub)',
                'default_provider' => 'stub',
            ],
        ]);
    }

    public function faspayTest(Request $request)
    {
        $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'channel' => ['required', 'in:va,ewallet,qris'],
        ]);

        $payment = new Payment([
            'invoice_number' => 'TEST-' . now()->format('YmdHis'),
            'amount' => $request->integer('amount'),
        ]);

        $invoice = $this->faspay->createInvoice($payment, $request->string('channel')->toString());

        return back()->with('integration_result', [
            'type' => 'faspay',
            'invoice' => $invoice,
        ]);
    }

    public function waBlastSend(Request $request): RedirectResponse
    {
        $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'audience' => ['required', 'in:all_members,active_members,expired_members,all_admins'],
        ]);

        $query = match ($request->string('audience')->toString()) {
            'all_members' => User::query()->where('role', User::ROLE_MEMBER),
            'active_members' => User::query()->where('role', User::ROLE_MEMBER)->whereHas('membership', fn ($q) => $q->where('status', 'active')->where('expires_at', '>', now())),
            'expired_members' => User::query()->where('role', User::ROLE_MEMBER)->where(function ($q) {
                $q->whereDoesntHave('membership')->orWhereHas('membership', fn ($mq) => $mq->where('expires_at', '<=', now()));
            }),
            'all_admins' => User::query()->where('role', User::ROLE_ADMIN),
        };

        $recipients = $query->get();
        $result = $this->waBlast->broadcast($recipients, $request->string('message')->toString(), [
            'audience' => $request->string('audience')->toString(),
            'sent_by' => $request->user()?->id,
        ]);

        return back()->with('integration_result', [
            'type' => 'wa_blast',
            'result' => $result,
        ]);
    }

    public function faspayDummy(Payment $payment, Request $request)
    {
        $channel = $request->string('channel')->toString() ?: FaspayService::CHANNEL_QRIS;
        $invoice = $this->faspay->createInvoice($payment, $channel);

        return Inertia::render('Admin/Integrations/FaspayDummy', [
            'payment' => $payment->only(['id', 'invoice_number', 'amount']),
            'invoice' => $invoice,
        ]);
    }
}