<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\MembershipPlan;
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
     * Initiate payment checkout (DOKU Checkout or Direct VA).
     */
    public function checkout(
        Request $request,
        DokuService $doku,
        PaymentService $payments
    ): JsonResponse {
        $validated = $request->validate([
            'plan_id' => ['required', 'integer', 'exists:membership_plans,id'],
            'channel' => ['nullable', 'string', 'in:all,bca,mandiri,bri,bni,permata'],
        ]);

        $member = $request->user();
        $plan = MembershipPlan::where('is_active', true)->findOrFail($validated['plan_id']);

        // Calculate pass-through admin fee to ensure merchant receives net Rp100.000/month
        $adminFee = $doku->getAdminFee();
        $planPrice = (int) $plan->price;
        $totalAmount = $planPrice + $adminFee;

        // Create pending payment record with total amount (plan price + admin fee)
        $payment = $payments->createPending($member, $plan);
        $paymentNotes = "Harga Paket: Rp" . number_format($planPrice, 0, ',', '.') . " | Biaya Layanan Gateway: Rp" . number_format($adminFee, 0, ',', '.');
        $payment->forceFill([
            'amount' => $totalAmount,
            'notes' => $paymentNotes,
        ])->save();

        $channel = $validated['channel'] ?? 'all';

        if ($channel !== 'all') {
            // Direct Virtual Account
            $result = $doku->createVirtualAccount($payment, $channel);

            if (! $result['success']) {
                $payment->update(['status' => Payment::STATUS_REJECTED, 'notes' => $result['message']]);

                return response()->json([
                    'success' => false,
                    'message' => $result['message'] ?? 'Gagal membuat nomor Virtual Account.',
                ], 422);
            }

            return response()->json([
                'success' => true,
                'type' => 'va',
                'payment_id' => $payment->id,
                'invoice_number' => $payment->invoice_number,
                'plan_price' => $planPrice,
                'admin_fee' => $adminFee,
                'amount' => $payment->amount,
                'bank' => $result['bank'],
                'va_number' => $result['va_number'],
                'how_to_pay_page' => $result['how_to_pay_page'] ?? null,
                'expired_date' => $result['expired_date_utc'] ?? null,
            ]);
        }

        // DOKU Checkout Hosted / Popup
        $result = $doku->createCheckout($payment);

        if (! $result['success']) {
            $payment->update(['status' => Payment::STATUS_REJECTED, 'notes' => $result['message']]);

            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Gagal membuat tagihan DOKU Checkout.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'type' => 'checkout',
            'payment_id' => $payment->id,
            'invoice_number' => $payment->invoice_number,
            'plan_price' => $planPrice,
            'admin_fee' => $adminFee,
            'amount' => $payment->amount,
            'payment_url' => $result['url'],
            'token_id' => $result['token_id'] ?? null,
            'expired_date' => $result['expired_datetime'] ?? null,
        ]);
    }

    /**
     * Poll status of a specific payment.
     */
    public function checkStatus(Request $request, Payment $payment): JsonResponse
    {
        if ($payment->member_id !== $request->user()->id) {
            abort(403);
        }

        return response()->json([
            'payment_id' => $payment->id,
            'invoice_number' => $payment->invoice_number,
            'status' => $payment->status,
            'is_paid' => $payment->status === Payment::STATUS_APPROVED,
            'paid_at' => $payment->paid_at?->format('d M Y H:i'),
        ]);
    }

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
                $paymentNotes = ($payment->notes ? $payment->notes . ' | ' : '') . "Paid via DOKU ({$channelId}) at " . now()->toIso8601String();
                $payment->forceFill([
                    'paid_at' => now(),
                    'notes' => $paymentNotes,
                ])->save();

                // Approves payment and safely extends membership (calculating 30-day blocks without wiping existing active days)
                $payments->approve($payment, null, $paymentNotes);

                Log::info("DOKU Payment {$invoiceNumber} approved successfully for member {$payment->member_id}");

                return response()->json(['message' => 'SUCCESS'], 200);
            }

            // 6. Handle Payment Failure / Expiry
            if (in_array($trxStatus, ['FAILED', 'EXPIRED'], true)) {
                $payment->update([
                    'status' => $trxStatus === 'EXPIRED' ? Payment::STATUS_EXPIRED : Payment::STATUS_REJECTED,
                    'notes' => ($payment->notes ? $payment->notes . ' | ' : '') . "DOKU status: {$trxStatus}",
                ]);

                return response()->json(['message' => 'SUCCESS'], 200);
            }

            return response()->json(['message' => 'RECEIVED'], 200);
        });
    }
}
