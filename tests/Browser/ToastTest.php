<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('shows a toast after an action and dismisses it', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-1', 'status' => 'active']);

    visit('/products')
        ->click('@product-actions')
        ->click('@action-archive')
        ->click('@confirm-accept')
        ->assertSee('Product archived.')
        ->click('@toast-dismiss')
        ->assertDontSee('Product archived.')
        ->assertNoSmoke();
});

it('renders a link inside a toast', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-1', 'status' => 'active']);

    visit('/products')
        ->click('@product-actions')
        ->click('@action-archive')
        ->click('@confirm-accept')
        ->assertSee('Product archived.')
        ->click('@view-products')
        ->assertSee('Create product')
        ->assertNoSmoke();
});

it('opens a modal form from a toast action', function (): void {
    $this->actingAs(workbenchTestUser());
    $product = Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-1', 'status' => 'active']);

    visit('/products')
        ->click('@product-actions')
        ->click('@action-edit-modal')
        ->assertValue('#name', 'Desk Lamp')
        ->click('@action-form-submit')
        ->assertSee('Product updated.')
        ->click('@product-actions')
        ->click('@action-reject')
        ->assertSee('Reject product?')
        ->fill('@reason', 'Counterfeit listing')
        ->click('@action-form-submit')
        ->assertNoSmoke();

    expect($product->fresh()->status)->toBe('archived');
});
