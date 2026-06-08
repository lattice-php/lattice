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
            ['name', 'price', 'status', 'created_at', 'updated_at'],
        );
    }

    /**
     * @return array<int, array{name: string, sku: string, price: string, status: string, created_at: string, updated_at: string}>
     */
    private function products(): array
    {
        $faker = fake();
        $faker->seed(20260608);
        $statuses = ['draft', 'active', 'archived'];

        return array_map(
            function (int $number) use ($faker, $statuses): array {
                $createdAt = CarbonImmutable::parse('2025-02-01 10:00:00')->addHours($number);

                return [
                    'name' => str($faker->words(3, true))->title()->toString(),
                    'sku' => sprintf('workbench-product-%03d', $number),
                    'price' => number_format($faker->randomFloat(2, 9, 999), 2, '.', ''),
                    'status' => $statuses[($number - 1) % count($statuses)],
                    'created_at' => $createdAt->toDateTimeString(),
                    'updated_at' => $createdAt->addMinutes($number)->toDateTimeString(),
                ];
            },
            range(1, 100),
        );
    }
}
