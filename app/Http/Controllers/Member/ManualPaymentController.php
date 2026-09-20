<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\MembershipDiscountCode;
use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ManualPaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $payments,
    ) {}

    /**
     * Request manual QRIS checkout for membership plan.
     */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan_id' => ['required', 'integer', 'exists:membership_plans,id'],
            'promo_code' => ['nullable', 'string', 'max:50'],
        ]);

        $member = $request->user();
        $plan = MembershipPlan::where('is_active', true)->findOrFail($validated['plan_id']);

        $planPrice = (int) $plan->price;
        $discountAmount = 0;
        $discountCode = null;

        if (! empty($validated['promo_code'])) {
            $discountCode = MembershipDiscountCode::where('code', strtoupper(trim($validated['promo_code'])))->first();
            if ($discountCode && $discountCode->isValid()) {
                $discountAmount = $discountCode->calculateDiscount($planPrice);
            }
        }

        $finalPrice = max(0, $planPrice - $discountAmount);

        // Jika 100% Free: langsung aktivasi membership tanpa transfer
        if ($finalPrice === 0 && $discountAmount > 0) {
            $payment = $this->payments->createPending($member, $plan);
            $payment->forceFill([
                'amount' => 0,
                'paid_at' => now(),
                'notes' => "Aktivasi Promo 100% Bebas Biaya ({$discountCode->code})",
            ])->save();

            $this->payments->approve($payment, null, "Aktivasi Membership via Voucher {$discountCode->code}");
            $discountCode->increment('used_count');

            return response()->json([
                'success' => true,
                'is_free' => true,
                'payment_id' => $payment->id,
                'invoice_number' => $payment->invoice_number,
                'amount' => 0,
                'message' => 'Selamat! Keanggotaan Anda telah aktif gratis via voucher diskon.',
            ]);
        }

        // Buat record pembayaran pending untuk verifikasi manual
        $payment = $this->payments->createPending($member, $plan);
        $notes = "Manual QRIS Payment | Paket: {$plan->name}";
        if ($discountAmount > 0) {
            $notes .= " | Voucher ({$discountCode->code}): -Rp" . number_format($discountAmount, 0, ',', '.');
        }

        $payment->forceFill([
            'amount' => $finalPrice,
            'paid_at' => null,
            'notes' => $notes,
        ])->save();

        if ($discountCode) {
            $discountCode->increment('used_count');
        }

        return response()->json([
            'success' => true,
            'is_free' => false,
            'payment_id' => $payment->id,
            'invoice_number' => $payment->invoice_number,
            'amount' => (int) $payment->amount,
            'plan_name' => $plan->name,
            'duration_months' => $plan->duration_months,
            'qris_image_url' => asset('images/qris-kbkb.svg'),
            'created_at' => $payment->created_at->translatedFormat('d M Y H:i'),
        ]);
    }

    /**
     * Upload payment proof for manual QRIS payment.
     */
    public function uploadProof(Request $request, Payment $payment): JsonResponse
    {
        $user = $request->user();
        if ($payment->member_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak.',
            ], 403);
        }

        if ($payment->status !== Payment::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Status invoice ini tidak dapat diunggah bukti lagi (' . $payment->status . ').',
            ], 422);
        }

        $request->validate([
            'proof' => ['required', 'file', 'image', 'max:5120'], // max 5MB
        ]);

        $file = $request->file('proof');
        $path = $file->store('proofs', 'public');

        $payment->forceFill([
            'proof_path' => $path,
            'paid_at' => now(),
            'notes' => trim(($payment->notes ? $payment->notes . ' | ' : '') . 'Bukti transfer diunggah member pada ' . now()->translatedFormat('d M Y H:i:s')),
        ])->save();

        return response()->json([
            'success' => true,
            'message' => 'Bukti pembayaran berhasil diunggah! Pembayaran Anda akan segera diverifikasi oleh tim admin KBKB.',
            'proof_url' => $payment->proofUrl(),
            'payment' => [
                'id' => $payment->id,
                'invoice_number' => $payment->invoice_number,
                'amount' => $payment->amount,
                'paid_at' => $payment->paid_at?->translatedFormat('d M Y H:i'),
                'payment_proof_url' => $payment->proofUrl(),
            ],
        ]);
    }

    /**
     * Cancel an uncompleted pending payment.
     */
    public function cancel(Request $request, Payment $payment): JsonResponse
    {
        $user = $request->user();
        if ($payment->member_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        if ($payment->status === Payment::STATUS_PENDING && ! $payment->proof_path) {
            $payment->update([
                'status' => Payment::STATUS_EXPIRED,
                'notes' => ($payment->notes ? $payment->notes . ' | ' : '') . 'Dibatalkan oleh member.',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pesanan pembayaran berhasil dibatalkan.',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Transaksi tidak dapat dibatalkan.',
        ], 422);
    }
}
