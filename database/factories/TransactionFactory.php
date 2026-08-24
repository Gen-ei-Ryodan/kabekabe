<?php

namespace Database\Factories;

use App\Models\Partner;
use App\Models\Promo;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Transaction>
 */
class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        $total = fake()->numberBetween(100000, 5000000);
        $discountPercent = fake()->numberBetween(5, 30);

        return [
            'transaction_number' => 'TRX-' . strtoupper(Str::random(10)),
            'partner_id' => Partner::factory(),
            'member_id' => User::factory()->member(),
            'promo_id' => Promo::factory(),
            'total_amount' => $total,
            'discount_percent' => $discountPercent,
            'discount_amount' => (int) round($total * $discountPercent / 100),
            'net_amount' => $total - (int) round($total * $discountPercent / 100),
            'note' => fake()->sentence(),
            'transacted_at' => now()->subDays(fake()->numberBetween(0, 30)),
        ];
    }

    public function withActiveMember(): static
    {
        $member = User::factory()->member()->create();
        $member->membership()->create([
            'status' => 'active',
            'started_at' => now()->subMonth(),
            'expires_at' => now()->addMonths(6),
        ]);

        return $this->state(fn () => ['member_id' => $member->id]);
    }
}