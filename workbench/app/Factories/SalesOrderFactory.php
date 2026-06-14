<?php
declare(strict_types=1);

namespace Workbench\App\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\SalesOrder;

/** @extends Factory<SalesOrder> */
class SalesOrderFactory extends Factory
{
    protected $model = SalesOrder::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'business_partner_id' => BusinessPartner::factory(),
            'number' => 'SO-'.fake()->unique()->numberBetween(1000, 9999),
            'status' => 'draft',
        ];
    }
}
