<?php
declare(strict_types=1);

namespace Workbench\App\Factories;

use Bambamboole\ExtendedFaker\Dto\ImageDto;
use Bambamboole\ExtendedFaker\Dto\ProductDto;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Workbench\App\Models\File;
use Workbench\App\Models\Group;
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
        $product = $this->fakeProduct();

        return [
            'name' => $product->name,
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

    public function withImages(int $count = 1): static
    {
        return $this->afterCreating(function (Product $product) use ($count): void {
            for ($sortOrder = 1; $sortOrder <= $count; $sortOrder++) {
                $image = $this->fakeProduct()->image;

                if (! $image instanceof ImageDto) {
                    continue;
                }

                $file = $this->createImageFile($product, $image, $sortOrder);

                $product->images()->attach($file->getKey(), ['sort_order' => $sortOrder]);
            }
        });
    }

    public function withSalesPricesFor(Group ...$groups): static
    {
        return $this->afterCreating(function (Product $product) use ($groups): void {
            $baseAmount = (float) ($product->salesPrices()
                ->whereNull('group_id')
                ->value('amount') ?? fake()->randomFloat(2, 10, 500));

            foreach ($groups as $group) {
                SalesPrice::factory()->create([
                    'product_id' => $product->getKey(),
                    'group_id' => $group->getKey(),
                    'amount' => number_format($baseAmount * fake()->randomFloat(2, 0.65, 0.9), 2, '.', ''),
                ]);
            }
        });
    }

    private function fakeProduct(): ProductDto
    {
        $product = fake()->format('product');

        if (! $product instanceof ProductDto) {
            throw new RuntimeException('Extended Faker product must return a product DTO.');
        }

        return $product;
    }

    private function createImageFile(Product $product, ImageDto $image, int $sortOrder): File
    {
        $contents = file_get_contents($image->absolutePath);

        if ($contents === false) {
            throw new RuntimeException("Unable to read product image fixture [{$image->path}].");
        }

        $extension = pathinfo($image->path, PATHINFO_EXTENSION) ?: 'webp';
        $name = $product->sku.'-'.$sortOrder.'.'.$extension;
        $path = 'workbench/products/'.$name;

        Storage::disk('s3')->put($path, $contents, 'public');

        return File::query()->create([
            'disk' => 's3',
            'path' => $path,
            'name' => $name,
            'mime_type' => $image->mimeType,
            'size' => $image->size,
        ]);
    }

    public function withoutDefaultPrice(): static
    {
        return $this->newInstance(['afterCreating' => collect()]);
    }
}
