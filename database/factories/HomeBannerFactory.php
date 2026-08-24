<?php

namespace Database\Factories;

use App\Models\HomeBanner;
use App\Models\Promo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<HomeBanner>
 */
class HomeBannerFactory extends Factory
{
    protected $model = HomeBanner::class;

    public function definition(): array
    {
        return [
            'type' => HomeBanner::TYPE_PROMO,
            'promo_id' => Promo::factory(),
            'agenda_id' => null,
            'sort_order' => fake()->numberBetween(1, 10),
            'is_active' => true,
        ];
    }

    public function agenda(): static
    {
        return $this->state(fn () => [
            'type' => HomeBanner::TYPE_AGENDA,
            'promo_id' => null,
            'agenda_id' => \App\Models\CommunityInfo::factory(),
        ]);
    }
}
