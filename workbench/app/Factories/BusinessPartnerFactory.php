<?php
declare(strict_types=1);

namespace Workbench\App\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Workbench\App\Models\Address;
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

    public function withAddresses(): static
    {
        return $this->afterCreating(function (BusinessPartner $businessPartner): void {
            $shipping = Address::factory()
                ->for($businessPartner)
                ->create(['label' => 'Shipping']);
            $billing = Address::factory()
                ->for($businessPartner)
                ->create(['label' => 'Billing']);

            $businessPartner->update([
                'default_shipping_address_id' => $shipping->getKey(),
                'default_billing_address_id' => $billing->getKey(),
            ]);
        });
    }
}
