<?php

namespace App\Services;

use App\Models\MemberScan;
use App\Models\Partner;
use App\Models\Promo;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionService
{
    public function __construct(
        private readonly MembershipService $memberships,
        private readonly NotificationService $notifications,
    ) {}

    /**
     * Record a transaction for a member at a partner.
     *
     * @param  array{member: User, promo: Promo|null, total: int, note: ?string, proof: mixed}  $payload
     */
    public function record(Partner $partner, User $member, ?Promo $promo, int $total, ?string $note = null, mixed $proofPath = null, ?string $transactionNumber = null): Transaction
    {
        if (! $this->memberships->isActive($member)) {
            throw new \DomainException('Member is inactive and cannot use benefits.');
        }

        $activeScan = MemberScan::query()
            ->where('member_id', $member->id)
            ->where('scanned_by_vendor_id', $partner->user_id)
            ->where('expires_at', '>', now())
            ->latest('scanned_at')
            ->first();

        if (! $activeScan) {
            throw new \DomainException('Input window has expired. Please scan the member card again or contact admin to edit.');
        }

        if ($promo !== null && $promo->partner_id !== $partner->id) {
            throw new \DomainException('Promo is not registered with this partner.');
        }

        $discountPercent = null;
        $discountAmount = 0;

        if ($promo !== null && $total >= $promo->min_purchase) {
            $discountPercent = $promo->discount_type === Promo::TYPE_PERCENT ? $promo->discount_value : null;
            $discountAmount = $promo->discountAmountFor($total);
        }

        $transaction = DB::transaction(function () use ($partner, $member, $promo, $total, $discountPercent, $discountAmount, $note, $proofPath, $transactionNumber) {
            return $partner->transactions()->create([
                'transaction_number' => $transactionNumber ?: $this->nextTransactionNumber(),
                'member_id' => $member->id,
                'promo_id' => $promo?->id,
                'total_amount' => $total,
                'discount_percent' => $discountPercent,
                'discount_amount' => $discountAmount,
                'net_amount' => $total - $discountAmount,
                'note' => $note,
                'proof_path' => $proofPath,
                'transacted_at' => now(),
            ]);
        });

        $this->notifications->send(
            $member,
            'Benefit Used',
            "Transaction {$transaction->transaction_number} at {$partner->name} was recorded with a discount of "
                . ($discountAmount > 0 ? 'Rp' . number_format($discountAmount, 0, ',', '.') : 'Rp0')
                . '.',
            'transaction',
            '/member/history',
        );

        return $transaction->fresh(['partner', 'member']);
    }

    private function nextTransactionNumber(): string
    {
        return 'TRX-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(4));
    }
}