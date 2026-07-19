<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('shows a toast after an action and dismisses it', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-1', 'status' => 'active']);

    $page = visit('/products');

    $page->click('@product-actions')
        ->click('@action-archive')
        ->click('@confirm-accept');

    assertSeeEventually($page, 'Product archived.');

    $page->click('@toast-dismiss');

    assertDontSeeEventually($page, 'Product archived.');

    $page->assertNoSmoke();
});

it('renders a link inside a toast', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-1', 'status' => 'active']);

    $page = visit('/products');

    $page->click('@product-actions')
        ->click('@action-archive')
        ->click('@confirm-accept');

    assertSeeEventually($page, 'Product archived.');

    $page->click('@view-products');

    assertSeeEventually($page, 'Create product');

    $page->assertNoSmoke();
});

it('opens a modal form from a toast action', function (): void {
    $this->actingAs(workbenchTestUser());
    $product = Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-1', 'status' => 'active']);

    $page = visit('/products');

    $page->click('@product-actions')
        ->click('@action-edit-modal')
        ->assertValue('#name', 'Desk Lamp')
        ->click('@action-form-submit');

    assertSeeEventually($page, 'Product updated.');

    $page->click('@product-actions')
        ->click('@action-reject');

    assertSeeEventually($page, 'Reject product?');

    $page->fill('@reason', 'Counterfeit listing')
        ->click('@action-form-submit')
        ->assertNoSmoke();

    retryUntil(function () use ($product): void {
        expect($product->fresh()->status)->toBe('archived');
    });
});
