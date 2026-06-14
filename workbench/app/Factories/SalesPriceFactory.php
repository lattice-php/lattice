<?php
declare(strict_types=1);

namespace Workbench\App\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesPrice;

/** @extends Factory<SalesPrice> */
class SalesPriceFactory extends Factory
{
    protected $model = SalesPrice::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'group_id' => null,
            'amount' => fake()->randomFloat(2, 5, 500),
        ];
    }
}
