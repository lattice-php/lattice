<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('keeps the confirm dialog open and shows an error toast when an action is rejected', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-1', 'status' => 'active']);

    $page = visit('/products');

    $page->click('@product-actions')
        ->click('@action-fail-demo')
        ->click('@confirm-accept');

    assertSeeEventually($page, 'Could not process the request.');

    $page->assertVisible('@confirm-accept')
        ->assertSee('Fail demo?')
        ->assertNoSmoke();
});
