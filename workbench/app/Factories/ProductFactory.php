<?php
declare(strict_types=1);

namespace Workbench\App\Factories;

use Bambamboole\ExtendedFaker\Repository\ProductRepository;
use Illuminate\Database\Eloquent\Factories\Factory;
use Workbench\App\Models\Product;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => (new ProductRepository)->getRandomProduct('en_US')->name,
            'sku' => fake()->unique()->bothify('PRD-####'),
            'price' => fake()->randomFloat(2, 10, 250),
            'status' => fake()->randomElement(['draft', 'active', 'archived']),
            'featured' => fake()->boolean(),
        ];
    }
}
