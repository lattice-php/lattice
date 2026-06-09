<?php

declare(strict_types=1);

namespace Workbench\App\Seeders;

use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Workbench\App\Models\Product;

class WorkbenchProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::query()->upsert(
            $this->products(),
            ['sku'],
            ['name', 'price', 'status', 'featured', 'created_at', 'updated_at'],
        );

        $this->seedRelations();
    }

    private function seedRelations(): void
    {
        $ids = Product::query()->orderBy('id')->pluck('id')->all();

        foreach (array_slice($ids, 0, 20, true) as $index => $id) {
            Product::query()->find($id)?->relatedProducts()->sync(array_values(array_filter([
                $ids[$index + 1] ?? null,
                $ids[$index + 2] ?? null,
            ])));
        }
    }

    /**
     * @return array<int, array{name: string, sku: string, price: string, status: string, featured: bool, created_at: string, updated_at: string}>
     */
    private function products(): array
    {
        $faker = fake();
        $faker->seed(20260608);
        $statuses = ['draft', 'active', 'archived'];
        $createdAt = CarbonImmutable::now()->subYear();

        return array_map(
            function (int $number) use ($faker, $statuses, $createdAt): array {
                return [
                    'name' => str($faker->words(3, true))->title()->toString(),
                    'sku' => sprintf('workbench-product-%03d', $number),
                    'price' => number_format($faker->randomFloat(2, 9, 999), 2, '.', ''),
                    'status' => $statuses[($number - 1) % count($statuses)],
                    'featured' => $faker->boolean(),
                    'created_at' => $createdAt->toDateTimeString(),
                    'updated_at' => CarbonImmutable::parse(
                        $faker->dateTimeBetween($createdAt, 'now'),
                    )->toDateTimeString(),
                ];
            },
            range(1, 100),
        );
    }
}
