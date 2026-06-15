<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('renders the custom status-badge column cell', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Badge Product', 'sku' => 'BADGE-1', 'status' => 'active']);

    visit('/products')
        ->assertSee('Badge Product')
        ->assertPresent('[data-testid="status-badge"]')
        ->assertSee('Active')
        ->assertNoSmoke();
});

it('archives a product via the row action with confirmation', function (): void {
    $this->actingAs(workbenchTestUser());
    $product = Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-1', 'status' => 'active']);

    visit('/products')
        ->assertSee('Desk Lamp')
        ->click('@product-actions')
        ->click('@action-archive')
        ->assertSee('Archive product?')
        ->click('@confirm-accept')
        ->assertSee('Archived')
        ->assertNoSmoke();

    expect($product->fresh()->status)->toBe('archived');
});

it('cancels the archive confirmation without changing the product', function (): void {
    $this->actingAs(workbenchTestUser());
    $product = Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-1', 'status' => 'active']);

    visit('/products')
        ->click('@product-actions')
        ->click('@action-archive')
        ->assertSee('Archive product?')
        ->click('@confirm-cancel')
        ->assertNoSmoke();

    expect($product->fresh()->status)->toBe('active');
});

it('rejects a product through a modal form', function (): void {
    $this->actingAs(workbenchTestUser());
    $product = Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-1', 'status' => 'active']);

    visit('/products')
        ->click('@product-actions')
        ->click('@action-reject')
        ->assertSee('Reject product?')
        ->click('@action-form-submit')
        ->assertSee('The Reason field is required.')
        ->fill('@reason', 'Counterfeit listing')
        ->click('@action-form-submit')
        ->assertNoSmoke();

    expect($product->fresh()->status)->toBe('archived');
});

it('archives selected products in bulk', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->count(3)->create(['status' => 'active']);

    visit('/products')
        ->click('@select-all')
        ->click('@bulk-action-archive-selected')
        ->assertNoSmoke();

    expect(Product::query()->where('status', 'archived')->count())->toBe(3);
});

it('edits a product in a prefilled modal form', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
    ]);

    visit('/products')
        ->assertSee('Desk Lamp')
        ->click('@product-actions')
        ->click('@action-edit-modal')
        ->assertSee('Edit product')
        ->assertValue('#name', 'Desk Lamp')
        ->fill('#name', 'Renamed Lamp')
        ->click('@action-form-submit')
        ->assertNoSmoke();

    expect(Product::query()->where('sku', 'LAMP-001')->value('name'))->toBe('Renamed Lamp');
});

it('searches products inside the reject modal form', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-001', 'status' => 'active']);
    $replacement = Product::factory()->create(['name' => 'Walnut Desk', 'sku' => 'DESK-001', 'status' => 'active']);

    visit('/products')
        ->assertSee('Desk Lamp')
        ->click('@product-actions')
        ->click('@action-reject')
        ->assertSee('Reject product?')
        ->click('@select-replacement')
        ->fill('@select-replacement-search', 'Walnut')
        ->assertSee('Walnut Desk')
        ->assertPresent("[data-test=\"select-replacement-option-{$replacement->getKey()}\"]")
        ->assertNoSmoke();
});
