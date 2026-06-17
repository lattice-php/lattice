<?php
declare(strict_types=1);

namespace Workbench\App\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Orchestra\Testbench\Factories\UserFactory;
use Workbench\App\Factories\GroupFactory;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Models\Tag;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        UserFactory::new()->create([
            'name' => 'Workbench User',
            'email' => 'workbench@example.com',
            'locale' => 'en',
        ]);

        UserFactory::times(10)->create();

        $retailGroup = GroupFactory::new()
            ->withCustomers(10)
            ->create(['name' => 'Retail']);
        $wholesaleGroup = GroupFactory::new()
            ->withCustomers(10)
            ->create(['name' => 'Wholesale']);
        $vipGroup = GroupFactory::new()
            ->withCustomers(10)
            ->create(['name' => 'VIP']);

        $tags = collect([
            ['name' => 'New', 'color' => 'blue'],
            ['name' => 'Sale', 'color' => 'red'],
            ['name' => 'Popular', 'color' => 'green'],
            ['name' => 'Limited', 'color' => 'yellow'],
            ['name' => 'Premium', 'color' => 'purple'],
            ['name' => 'Clearance', 'color' => 'orange'],
        ])->map(fn (array $tag): Tag => Tag::factory()->create([
            'name' => $tag['name'],
            'slug' => Str::slug($tag['name']),
            'color' => $tag['color'],
        ]));

        $products = Product::factory()
            ->count(250)
            ->withImages()
            ->withSalesPricesFor($wholesaleGroup, $vipGroup)
            ->create();

        $products->each(fn (Product $product) => $product->tags()->attach(
            $tags->random(fake()->numberBetween(0, 3))->pluck('id'),
        ));

        $customer = $retailGroup->businessPartners()->firstOrFail();

        SalesOrder::factory()
            ->count(2)
            ->forBusinessPartner($customer)
            ->withLines($products)
            ->create();
    }
}
