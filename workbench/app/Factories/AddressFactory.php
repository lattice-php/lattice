<?php
declare(strict_types=1);

namespace Workbench\App\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Workbench\App\Models\Address;
use Workbench\App\Models\BusinessPartner;

/** @extends Factory<Address> */
class AddressFactory extends Factory
{
    protected $model = Address::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'business_partner_id' => BusinessPartner::factory(),
            'label' => fake()->randomElement(['HQ', 'Warehouse', 'Billing']),
            'line1' => fake()->streetAddress(),
            'line2' => null,
            'city' => fake()->city(),
            'postal_code' => fake()->postcode(),
            'country' => fake()->countryCode(),
        ];
    }
}
