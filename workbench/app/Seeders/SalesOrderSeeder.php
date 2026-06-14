<?php
declare(strict_types=1);

namespace Workbench\App\Seeders;

use Illuminate\Database\Seeder;
use Workbench\App\Enums\SalesOrderStatus;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Models\SalesOrderLine;
use Workbench\App\Pricing\PriceResolver;

class SalesOrderSeeder extends Seeder
{
    public function __construct(private readonly PriceResolver $priceResolver) {}

    public function run(): void
    {
        $partner = BusinessPartner::query()->orderBy('id')->firstOrFail();
        $products = Product::query()->orderBy('id')->limit(2)->get();

        for ($i = 1; $i <= 2; $i++) {
            $order = SalesOrder::query()->create([
                'business_partner_id' => $partner->id,
                'number' => sprintf('SO-%04d', $i),
                'status' => SalesOrderStatus::Draft,
            ]);

            foreach ($products as $product) {
                SalesOrderLine::query()->create([
                    'sales_order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => fake()->numberBetween(1, 5),
                    'unit_price' => $this->priceResolver->lowestFor($partner, $product) ?? $product->price,
                ]);
            }
        }
    }
}
