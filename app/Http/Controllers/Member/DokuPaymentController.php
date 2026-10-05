<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\PaymentGateway\DokuService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DokuPaymentController extends Controller
{
    /**
     * DOKU Webhook HTTP Notification Listener.
     * Hardened against double payments (pessimistic lock) & amount tampering.
     */
    public function notification(
        Request $request,
        DokuService $doku,
        PaymentService $payments
    ): JsonResponse {
        Log::info('DOKU Webhook Notification Received', [
            'headers' => $request->headers->all(),
            'body' => $request->all(),
        ]);

        // 1. Verify DOKU HMAC signature
        if (! $doku->verifyNotificationSignature($request)) {
            Log::warning('DOKU Webhook Signature Invalid');

            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $payload = $request->all();
        $invoiceNumber = $payload['order']['invoice_number'] ?? null;
        $trxStatus = strtoupper($payload['transaction']['status'] ?? '');
        $channelId = $payload['channel']['id'] ?? $payload['service']['id'] ?? 'DOKU';

        if (! $invoiceNumber) {
            return response()->json(['message' => 'Missing invoice number'], 400);
        }

        // 2. Database transaction with pessimistic lock (pembatasan race condition / anti double payment)
        return DB::transaction(function () use ($invoiceNumber, $trxStatus, $channelId, $payload, $payments) {
            /** @var Payment|null $payment */
            $payment = Payment::where('invoice_number', $invoiceNumber)
                ->lockForUpdate()
                ->first();

            if (! $payment) {
                Log::warning("DOKU Webhook: Payment with invoice {$invoiceNumber} not found");

                return response()->json(['message' => 'Payment not found'], 404);
            }

            // 3. Idempotency Check: if already approved, return HTTP 200 without re-extending
            if ($payment->status === Payment::STATUS_APPROVED) {
                Log::info("DOKU Webhook: Payment {$invoiceNumber} already approved. Skipping duplicate webhook.");

                return response()->json(['message' => 'Payment already approved'], 200);
            }

            // 4. Amount Integrity Check: prevent tampering
            if (isset($payload['order']['amount']) && (int) $payload['order']['amount'] !== (int) $payment->amount) {
                Log::error("DOKU Webhook: Amount mismatch for {$invoiceNumber}. Expected {$payment->amount}, got {$payload['order']['amount']}");

                return response()->json(['message' => 'Amount mismatch'], 400);
            }

            // 5. Handle Payment Success
            if ($trxStatus === 'SUCCESS') {
                // PaymentService::approve menggabungkan catatan lama (promo/diskon) dengan catatan baru.
                $payment->forceFill([
                    'paid_at' => now(),
                ])->save();

                // Approves payment and safely extends membership (calculating 30-day blocks without wiping existing active days)
                $payments->approve($payment, null, "Paid via DOKU ({$channelId}) at ".now()->toIso8601String());

                Log::info("DOKU Payment {$invoiceNumber} approved successfully for member {$payment->member_id}");

                return response()->json(['message' => 'SUCCESS'], 200);
            }

            // 6. Handle Payment Failure / Expiry
            if (in_array($trxStatus, ['FAILED', 'EXPIRED'], true)) {
                $payment->update([
                    'status' => $trxStatus === 'EXPIRED' ? Payment::STATUS_EXPIRED : Payment::STATUS_REJECTED,
                    'notes' => ($payment->notes ? $payment->notes.' | ' : '')."DOKU status: {$trxStatus}",
                ]);

                return response()->json(['message' => 'SUCCESS'], 200);
            }

            return response()->json(['message' => 'RECEIVED'], 200);
        });
    }
}
