<?php

namespace App\Services\Import;

use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\User;
use App\Services\MembershipService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PaymentImporter
{
    public function __construct(
        private readonly SpreadsheetRowReader $rows,
        private readonly MembershipService $memberships,
    ) {}

    /**
     * @return array{imported: int, failed: int, errors: list<string>}
     */
    public function import(User $admin, string $path): array
    {
        $result = ['imported' => 0, 'failed' => 0, 'errors' => []];

        foreach ($this->rows->rows($path) as $index => $row) {
            $line = $index + 2; // +1 header, +1 human numbering

            try {
                $this->importRow($admin, $row);
                $result['imported']++;
            } catch (\Throwable $e) {
                $result['failed']++;
                $identifier = $row['member_code'] ?? '?';
                $result['errors'][] = "Row {$line} ({$identifier}): ".$e->getMessage();
            }
        }

        return $result;
    }

    private function importRow(User $admin, array $row): void
    {
        DB::transaction(function () use ($admin, $row): void {
            $code = strtoupper(trim((string) ($row['member_code'] ?? '')));

            if ($code === '') {
                throw new \InvalidArgumentException('Member code is required.');
            }

            /** @var User|null $member */
            $member = User::query()->where('role', User::ROLE_MEMBER)->where('member_code', $code)->first();

            if (! $member) {
                throw new \InvalidArgumentException("Member with code {$code} not found.");
            }

            $plan = $this->resolvePlan($row);

            $periodMonths = isset($row['period_months']) && $row['period_months'] !== ''
                ? (int) $row['period_months']
                : $plan->duration_months;

            if ($periodMonths < 1) {
                throw new \InvalidArgumentException('Period months must be at least 1.');
            }

            $amount = isset($row['amount']) && $row['amount'] !== ''
                ? (int) round((float) str_replace([',', '.00'], '', $row['amount']))
                : $plan->price;

            $paidAt = isset($row['paid_at']) && $row['paid_at'] !== ''
                ? Carbon::parse($row['paid_at'])
                : Carbon::now();

            $membership = $this->memberships->ensureMembership($member);
            $previous = $membership->expires_at;

            $payment = $member->payments()->create([
                'invoice_number' => 'INV-'.now()->format('Ymd').'-'.strtoupper(Str::random(6)),
                'plan_id' => $plan->id,
                'period_months' => $periodMonths,
                'amount' => $amount,
                'status' => Payment::STATUS_APPROVED,
                'paid_at' => $paidAt,
                'approved_by' => $admin->id,
                'approved_at' => Carbon::now(),
                'notes' => 'Imported',
            ]);

            $updated = $this->memberships->extend($member, $periodMonths);

            $payment->forceFill([
                'previous_expires_at' => $previous,
                'new_expires_at' => $updated->expires_at,
            ])->save();
        });
    }

    private function resolvePlan(array $row): MembershipPlan
    {
        $name = trim((string) ($row['plan'] ?? ''));

        if ($name !== '') {
            /** @var MembershipPlan|null $plan */
            $plan = MembershipPlan::query()
                ->whereRaw('LOWER(name) = ?', [strtolower($name)])
                ->first();

            if (! $plan) {
                throw new \InvalidArgumentException("Plan \"{$name}\" not found.");
            }

            return $plan;
        }

        if (isset($row['period_months']) && $row['period_months'] !== '') {
            /** @var MembershipPlan|null $plan */
            $plan = MembershipPlan::query()
                ->where('duration_months', (int) $row['period_months'])
                ->first();

            if ($plan) {
                return $plan;
            }
        }

        /** @var MembershipPlan|null $plan */
        $plan = MembershipPlan::query()->orderBy('duration_months')->first();

        if (! $plan) {
            throw new \InvalidArgumentException('No membership plan exists yet.');
        }

        return $plan;
    }
}
