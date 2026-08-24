<?php

namespace Database\Factories;

use App\Models\Partner;
use App\Models\Promo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Promo>
 */
class PromoFactory extends Factory
{
    protected $model = Promo::class;

    public function definition(): array
    {
        return [
            'partner_id' => Partner::factory(),
            'title' => 'Diskon ' . fake()->numberBetween(5, 50) . '%',
            'description' => fake()->sentence(),
            'discount_type' => Promo::TYPE_PERCENT,
            'discount_value' => fake()->numberBetween(5, 50),
            'min_purchase' => fake()->numberBetween(0, 500000),
            'start_date' => now()->subDay(),
            'end_date' => now()->addDays(15),
            'terms' => fake()->sentence(),
            'status' => Promo::STATUS_APPROVED,
            'is_active' => true,
            'submitted_at' => now(),
            'reviewed_at' => now(),
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'status' => Promo::STATUS_PENDING,
            'submitted_at' => now(),
            'reviewed_at' => null,
            'reviewed_by' => null,
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn () => [
            'status' => Promo::STATUS_APPROVED,
            'submitted_at' => now(),
            'reviewed_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn () => [
            'status' => Promo::STATUS_REJECTED,
            'submitted_at' => now(),
            'reviewed_at' => now(),
            'rejection_reason' => 'Melebihi batas diskon maksimal',
        ]);
    }
}