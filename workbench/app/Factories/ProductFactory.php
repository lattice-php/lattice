<?php
declare(strict_types=1);

namespace Workbench\App\Factories;

use Bambamboole\ExtendedFaker\Repository\ProductRepository;
use Illuminate\Database\Eloquent\Factories\Factory;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesPrice;

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
            'status' => fake()->randomElement(['draft', 'active', 'archived']),
            'featured' => fake()->boolean(),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (Product $product): void {
            SalesPrice::factory()->create([
                'product_id' => $product->getKey(),
                'group_id' => null,
                'amount' => number_format(fake()->randomFloat(2, 10, 500), 2, '.', ''),
            ]);
        });
    }

    public function withoutDefaultPrice(): static
    {
        return $this->newInstance(['afterCreating' => collect()]);
    }
}
