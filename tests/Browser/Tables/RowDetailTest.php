<?php
declare(strict_types=1);

use Workbench\App\Models\BusinessPartner;
use Workbench\App\Models\Product;
use Workbench\App\Models\SalesOrder;

it('expands a sales-order row to load its line items over ajax and collapses again', function (): void {
    $this->actingAs(workbenchTestUser());

    $partner = BusinessPartner::factory()->create(['name' => 'Acme']);
    $product = Product::factory()->create(['name' => 'Gizmo']);
    $order = SalesOrder::factory()->create(['business_partner_id' => $partner->getKey(), 'number' => 'SO-77']);
    $order->lines()->create(['product_id' => $product->getKey(), 'quantity' => 2, 'unit_price' => '15.00']);

    $page = visit('/sales-orders');

    $page->assertSee('SO-77')
        ->assertDontSee('Gizmo')
        ->click('@row-expand-'.$order->getKey());

    assertSeeEventually($page, 'Gizmo');

    $page->click('@row-expand-'.$order->getKey());

    assertDontSeeEventually($page, 'Gizmo');

    $page->assertNoSmoke();
});
