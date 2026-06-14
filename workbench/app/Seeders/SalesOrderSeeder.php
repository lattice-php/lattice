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
            $number = sprintf('SO-%04d', $i);

            $order = SalesOrder::query()->firstOrCreate(
                ['number' => $number],
                [
                    'business_partner_id' => $partner->id,
                    'status' => SalesOrderStatus::Draft,
                ],
            );

            if (! $order->wasRecentlyCreated) {
                continue;
            }

            foreach ($products as $product) {
                $price = $this->priceResolver->lowestFor($partner, $product);

                if ($price === null) {
                    continue;
                }

                SalesOrderLine::query()->create([
                    'sales_order_id' => $order->id,
                    'product_id' => $product->id,
                    'quantity' => fake()->numberBetween(1, 5),
                    'unit_price' => $price,
                ]);
            }
        }
    }
}
