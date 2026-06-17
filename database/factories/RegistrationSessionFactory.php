<?php

namespace Database\Factories;

use App\Enums\PlacementAlgorithm;
use App\Enums\RegistrationSessionStatus;
use App\Models\RegistrationSession;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RegistrationSession>
 */
class RegistrationSessionFactory extends Factory
{
    protected $model = RegistrationSession::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'start_date' => now(),
            'end_date' => now()->addDays(7),
            'status' => RegistrationSessionStatus::Draft,
            'link_token' => fake()->regexify('[a-z0-9]{4}'),
            'placement_algorithm' => PlacementAlgorithm::GlobalBalance->value,
        ];
    }

    public function processing(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RegistrationSessionStatus::Processing,
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RegistrationSessionStatus::Closed,
        ]);
    }

    public function open(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => RegistrationSessionStatus::Open,
        ]);
    }
}
