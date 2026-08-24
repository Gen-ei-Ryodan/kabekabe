<?php

namespace Database\Factories;

use App\Models\MembershipPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MembershipPlan>
 */
class MembershipPlanFactory extends Factory
{
    protected $model = MembershipPlan::class;

    public function definition(): array
    {
        return [
            'name' => 'Plan ' . fake()->randomElement(['1 Bulan', '3 Bulan', '6 Bulan', '12 Bulan']),
            'duration_months' => fake()->randomElement([1, 3, 6, 12]),
            'price' => fake()->numberBetween(50000, 600000),
            'is_active' => true,
        ];
    }
}