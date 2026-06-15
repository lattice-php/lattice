<?php
declare(strict_types=1);

namespace Workbench\App\Seeders;

use Illuminate\Database\Seeder;
use Orchestra\Testbench\Factories\UserFactory;
use Workbench\App\Factories\GroupFactory;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesOrder;

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

        $products = Product::factory()
            ->count(100)
            ->withImages()
            ->withSalesPricesFor($wholesaleGroup, $vipGroup)
            ->create();

        $customer = $retailGroup->businessPartners()->firstOrFail();

        SalesOrder::factory()
            ->count(2)
            ->forBusinessPartner($customer)
            ->withLines($products)
            ->create();
    }
}
