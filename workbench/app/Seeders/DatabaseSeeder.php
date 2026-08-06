<?php
declare(strict_types=1);

namespace Workbench\App\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Lattice\Media\Models\Media;
use Orchestra\Testbench\Factories\UserFactory;
use Workbench\App\Factories\GroupFactory;
use Workbench\App\Models\Category;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Models\Tag;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $electronics = Category::factory()->create(['name' => 'Electronics']);
        $laptops = Category::factory()->childOf($electronics)->create(['name' => 'Laptops']);
        Category::factory()->childOf($laptops)->create(['name' => 'Ultrabooks']);
        Category::factory()->childOf($electronics)->create(['name' => 'Phones']);
        $clothing = Category::factory()->create(['name' => 'Clothing']);
        Category::factory()->childOf($clothing)->create(['name' => 'Men']);
        Category::factory()->childOf($clothing)->create(['name' => 'Women']);
        Category::factory()->create(['name' => 'Books']);

        UserFactory::new()->create([
            'name' => 'Workbench User',
            'email' => 'workbench@example.com',
            'locale' => 'en',
        ]);

        UserFactory::times(2000)->create();

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

        $mediaProduct = Product::factory()->create(['name' => __('workbench.pages.product-media.product')]);
        $images = Media::factory()->count(6)->create();
        Media::factory()->document()->count(2)->create();
        $mediaProduct->syncMedia($images->take(2)->pluck('id')->all(), 'gallery');
    }
}
