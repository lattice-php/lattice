<?php
declare(strict_types=1);

namespace Workbench\App\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Workbench\App\Enums\SalesOrderStatus;
use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Models\SalesOrderLine;
use Workbench\App\Pricing\PriceResolver;

/** @extends Factory<SalesOrder> */
class SalesOrderFactory extends Factory
{
    protected $model = SalesOrder::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'business_partner_id' => BusinessPartner::factory(),
            'number' => 'SO-'.fake()->unique()->numberBetween(1000, 9999),
            'status' => SalesOrderStatus::Draft,
        ];
    }

    public function forBusinessPartner(BusinessPartner $businessPartner): static
    {
        return $this
            ->for($businessPartner, 'businessPartner')
            ->state([
                'shipping_address_id' => $businessPartner->default_shipping_address_id,
                'billing_address_id' => $businessPartner->default_billing_address_id,
            ]);
    }

    /**
     * @param  iterable<int, Product>  $products
     */
    public function withLines(iterable $products, int $count = 2): static
    {
        return $this->afterCreating(function (SalesOrder $salesOrder) use ($products, $count): void {
            $businessPartner = $salesOrder->businessPartner()->first();

            if (! $businessPartner instanceof BusinessPartner) {
                return;
            }

            foreach (collect($products)->take($count) as $product) {
                $price = app(PriceResolver::class)->lowestFor($businessPartner, $product);

                if ($price === null) {
                    continue;
                }

                SalesOrderLine::factory()
                    ->for($salesOrder, 'salesOrder')
                    ->for($product)
                    ->create(['unit_price' => $price]);
            }
        });
    }
}
