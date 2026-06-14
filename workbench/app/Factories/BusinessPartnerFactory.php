<?php
declare(strict_types=1);

namespace Workbench\App\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Workbench\App\Models\BusinessPartner;

/** @extends Factory<BusinessPartner> */
class BusinessPartnerFactory extends Factory
{
    protected $model = BusinessPartner::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'email' => fake()->unique()->companyEmail(),
        ];
    }
}
