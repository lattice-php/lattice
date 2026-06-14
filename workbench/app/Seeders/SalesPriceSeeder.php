<?php
declare(strict_types=1);

namespace Workbench\App\Seeders;

use Illuminate\Database\Seeder;
use Workbench\App\Models\Group;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesPrice;

class SalesPriceSeeder extends Seeder
{
    public function run(): void
    {
        $wholesale = Group::query()->where('name', 'Wholesale')->firstOrFail();
        $vip = Group::query()->where('name', 'VIP')->firstOrFail();

        $faker = fake();
        $faker->seed(20260608);

        Product::query()->each(function (Product $product) use ($wholesale, $vip, $faker): void {
            $base = $faker->randomFloat(2, 20, 500);

            SalesPrice::query()->updateOrCreate(
                ['product_id' => $product->id, 'group_id' => null],
                ['amount' => number_format($base, 2, '.', '')],
            );

            SalesPrice::query()->updateOrCreate(
                ['product_id' => $product->id, 'group_id' => $wholesale->id],
                ['amount' => number_format($base * 0.85, 2, '.', '')],
            );

            SalesPrice::query()->updateOrCreate(
                ['product_id' => $product->id, 'group_id' => $vip->id],
                ['amount' => number_format($base * 0.70, 2, '.', '')],
            );
        });
    }
}
