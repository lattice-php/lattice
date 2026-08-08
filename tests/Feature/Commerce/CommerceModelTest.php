<?php
declare(strict_types=1);

use Workbench\App\Models\Group;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesOrder;
use Workbench\App\Models\SalesOrderLine;
use Workbench\App\Models\SalesPrice;

test('sales order total sums all line totals', function (): void {
    $order = SalesOrder::factory()->create();
    SalesOrderLine::factory()->create([
        'sales_order_id' => $order->id,
        'quantity' => 2,
        'unit_price' => '50.00',
    ]);
    SalesOrderLine::factory()->create([
        'sales_order_id' => $order->id,
        'quantity' => 3,
        'unit_price' => '20.00',
    ]);
    $order->load('lines');

    expect($order->total())->toBe('160.00');
});

test('product default sales price returns the groupless row', function (): void {
    $product = Product::factory()->withoutDefaultPrice()->create();
    $group = Group::factory()->create();
    $default = SalesPrice::factory()->create(['product_id' => $product->id, 'group_id' => null, 'amount' => '100.00']);
    SalesPrice::factory()->create(['product_id' => $product->id, 'group_id' => $group->id, 'amount' => '80.00']);

    expect($product->defaultSalesPrice?->id)->toBe($default->id);
});
