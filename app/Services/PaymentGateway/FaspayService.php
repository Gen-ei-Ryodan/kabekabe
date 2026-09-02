<?php

namespace App\Services\PaymentGateway;

use App\Models\Payment;
use Illuminate\Support\Str;

/**
 * Faspay payment gateway integration (dummy/stub).
 * Real integration is pending — this service simulates responses
 * so the UI flow can be tested and designed before wiring Faspay API.
 */
class FaspayService
{
    public const CHANNEL_VIRTUAL_ACCOUNT = 'va';
    public const CHANNEL_EWALLET = 'ewallet';
    public const CHANNEL_QRIS = 'qris';

    public const STATUS_PENDING = 'pending';
    public const STATUS_PAID = 'paid';
    public const STATUS_FAILED = 'failed';
    public const STATUS_EXPIRED = 'expired';

    public function __construct(
        private readonly string $merchantId = 'DUMMY_FASPAY_MERCHANT',
        private readonly string $merchantKey = 'DUMMY_KEY',
    ) {}

    public function createInvoice(Payment $payment, string $channel = self::CHANNEL_QRIS): array
    {
        $trxId = 'FASPAY-' . strtoupper(Str::random(12));

        return [
            'success' => true,
            'trx_id' => $trxId,
            'merchant_id' => $this->merchantId,
            'amount' => $payment->amount,
            'channel' => $channel,
            'status' => self::STATUS_PENDING,
            'payment_url' => route('admin.payments.faspay.dummy', ['payment' => $payment->id, 'channel' => $channel]),
            'expired_at' => now()->addHours(24)->toIso8601String(),
            'invoice_number' => $payment->invoice_number,
        ];
    }

    public function checkStatus(string $trxId): array
    {
        return [
            'success' => true,
            'trx_id' => $trxId,
            'status' => self::STATUS_PENDING,
            'amount' => 0,
            'paid_at' => null,
        ];
    }

    public function handleCallback(array $payload): array
    {
        return [
            'received' => true,
            'trx_id' => $payload['trx_id'] ?? null,
            'status' => $payload['status'] ?? self::STATUS_PENDING,
            'processed_at' => now()->toIso8601String(),
        ];
    }
}