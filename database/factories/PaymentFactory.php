<?php

namespace Database\Factories;

use App\Models\MembershipPlan;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        $plan = MembershipPlan::query()->first() ?? MembershipPlan::factory()->create();

        return [
            'invoice_number' => 'INV-' . strtoupper(Str::random(10)),
            'member_id' => User::factory()->member(),
            'plan_id' => $plan->id,
            'period_months' => $plan->duration_months,
            'amount' => $plan->price,
            'status' => Payment::STATUS_PENDING,
            'paid_at' => now(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'status' => Payment::STATUS_PENDING,
            'approved_at' => null,
            'approved_by' => null,
            'previous_expires_at' => null,
            'new_expires_at' => null,
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => Payment::STATUS_APPROVED,
            'approved_at' => now(),
            'approved_by' => User::factory()->admin(),
            'previous_expires_at' => now()->subDay(),
            'new_expires_at' => now()->addMonths(3),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn () => [
            'status' => Payment::STATUS_REJECTED,
            'approved_at' => now(),
            'approved_by' => User::factory()->admin(),
            'notes' => 'Bukti transfer tidak terbaca',
        ]);
    }
}