<?php

namespace Database\Factories;

use App\Models\Membership;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Membership>
 */
class MembershipFactory extends Factory
{
    protected $model = Membership::class;

    public function definition(): array
    {
        return [
            'member_id' => User::factory()->member(),
            'status' => Membership::STATUS_ACTIVE,
            'started_at' => now()->subMonth(),
            'expires_at' => now()->addMonths(11),
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => [
            'status' => Membership::STATUS_ACTIVE,
            'started_at' => now()->subMonth(),
            'expires_at' => now()->addMonths(11),
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn () => [
            'status' => Membership::STATUS_INACTIVE,
            'expires_at' => now()->subDay(),
        ]);
    }

    public function expiringSoon(): static
    {
        return $this->state(fn () => [
            'status' => Membership::STATUS_ACTIVE,
            'expires_at' => now()->addDays(3),
        ]);
    }
}