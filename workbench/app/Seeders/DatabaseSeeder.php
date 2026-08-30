<?php
declare(strict_types=1);

namespace Workbench\App\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Lattice\Media\Models\Media;
use Orchestra\Testbench\Factories\UserFactory;
use Workbench\App\Factories\GroupFactory;
use Workbench\App\Factories\TaskFactory;
use Workbench\App\Models\Category;
use Workbench\App\Models\Group;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Models\Tag;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(ProjectPlanAssignmentSeeder::class);

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
        assert($retailGroup instanceof Group);
        assert($wholesaleGroup instanceof Group);
        assert($vipGroup instanceof Group);

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

        $tasksByStatus = [
            'todo' => [
                ['Draft the Q4 roadmap', 'Ada'],
                ['Fix login redirect loop', 'Grace'],
                ['Refresh the pricing page', null],
                ['Design empty states', 'Ada'],
                ['Audit npm dependencies', null],
            ],
            'doing' => [
                ['Migrate billing webhooks', 'Linus'],
                ['Write board package docs', 'Grace'],
                ['Stabilise browser suite', 'Ada'],
            ],
            'done' => [
                ['Ship dark mode', 'Linus'],
                ['Rotate API keys', 'Grace'],
                ['Upgrade to Pest 5', 'Ada'],
                ['Consolidate lang files', null],
            ],
        ];

        foreach ($tasksByStatus as $status => $tasks) {
            foreach ($tasks as $position => [$title, $assignee]) {
                TaskFactory::new()->status($status)->position($position)->create([
                    'title' => $title,
                    'assignee' => $assignee,
                ]);
            }
        }

        $mediaProduct = Product::factory()->create(['name' => __('workbench.pages.product-media.product')]);
        $images = Media::factory()->count(6)->create();
        Media::factory()->document()->count(2)->create();
        $mediaProduct->syncMedia($images->take(2)->pluck('id')->all(), 'gallery');
    }
}
