<?php

namespace Database\Factories;

use App\Models\CommunityInfo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommunityInfo>
 */
class CommunityInfoFactory extends Factory
{
    protected $model = CommunityInfo::class;

    public function definition(): array
    {
        return [
            'type' => fake()->randomElement(CommunityInfo::TYPES),
            'title' => fake()->sentence(6),
            'content' => fake()->paragraphs(3, true),
            'event_date' => fake()->dateTimeBetween('-1 week', '+2 months'),
            'location' => fake()->city() . ', ' . fake()->country(),
            'is_published' => true,
            'published_at' => now()->subDay(),
        ];
    }

    public function published(): static
    {
        return $this->state(fn () => [
            'is_published' => true,
            'published_at' => now()->subDay(),
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn () => [
            'is_published' => false,
            'published_at' => null,
        ]);
    }
}