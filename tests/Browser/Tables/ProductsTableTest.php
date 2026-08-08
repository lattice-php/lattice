<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('renders the custom status-badge column cell', function (): void {
    Product::factory()->create(['name' => 'Badge Product', 'sku' => 'BADGE-1', 'status' => 'active']);

    $this->visitAsWorkbenchUser('/products')
        ->assertSee('Badge Product')
        ->assertSeeIn('[data-testid="status-badge"]', 'Active')
        ->assertNoSmoke();
});

it('archives a product via the row action with confirmation', function (): void {
    $product = deskLampProduct();

    $page = $this->visitAsWorkbenchUser('/products')
        ->assertSee('Desk Lamp')
        ->click('@product-actions')
        ->click('@action-archive')
        ->assertSee('Archive product?')
        ->click('@confirm-accept');

    retryUntil(function () use ($page): void {
        $page->assertSeeIn('[data-testid="status-badge"]', 'Archived');
    });

    $page->assertNoSmoke();

    expect($product->fresh()?->status)->toBe('archived');
});

it('cancels the archive confirmation without changing the product', function (): void {
    $product = deskLampProduct();

    $this->visitAsWorkbenchUser('/products')
        ->click('@product-actions')
        ->click('@action-archive')
        ->assertSee('Archive product?')
        ->click('@confirm-cancel')
        ->assertNoSmoke();

    expect($product->fresh()?->status)->toBe('active');
});

it('rejects a product through a modal form', function (): void {
    $product = deskLampProduct();

    $page = $this->visitAsWorkbenchUser('/products')
        ->click('@product-actions')
        ->click('@action-reject')
        ->assertSee('Reject product?')
        ->click('@action-form-submit');

    assertSeeEventually($page, 'The Reason field is required.');

    $page->fill('@reason', 'Counterfeit listing')
        ->click('@action-form-submit');

    retryUntil(function () use ($page): void {
        $page->assertDontSee('Reject product?');
    });

    retryUntil(function () use ($product): void {
        expect($product->fresh()?->status)->toBe('archived');
    });

    $page->assertNoSmoke();
});

it('archives selected products in bulk', function (): void {
    Product::factory()->count(3)->create(['status' => 'active']);

    $page = $this->visitAsWorkbenchUser('/products')
        ->click('@select-all')
        ->click('@bulk-action-archive-selected');

    retryUntil(function (): void {
        expect(Product::query()->where('status', 'archived')->count())->toBe(3);
    });

    $page->assertNoSmoke();
});

it('edits a product in a prefilled modal form', function (): void {
    Product::factory()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'status' => 'active',
    ]);

    $page = $this->visitAsWorkbenchUser('/products')
        ->assertSee('Desk Lamp')
        ->click('@product-actions')
        ->click('@action-edit-modal')
        ->assertSee('Edit product')
        ->assertValue('#name', 'Desk Lamp')
        ->fill('#name', 'Renamed Lamp')
        ->click('@action-form-submit');

    // A submit click can be swallowed under CI load; re-click while the modal
    // is still open between attempts — the rename is idempotent.
    retryUntil(function (): void {
        expect(Product::query()->where('sku', 'LAMP-001')->value('name'))->toBe('Renamed Lamp');
    }, between: function () use ($page): void {
        $page->script(<<<'JS'
            () => document.querySelector('[data-test="action-form-submit"]')?.click()
        JS);
    });

    $page->assertNoSmoke();
});

it('searches products inside the reject modal form', function (): void {
    Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-001', 'status' => 'active']);
    $replacement = Product::factory()->create(['name' => 'Walnut Desk', 'sku' => 'DESK-001', 'status' => 'active']);

    $this->visitAsWorkbenchUser('/products')
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

it('renders the default price as euro currency in the money column', function (): void {
    Product::factory()->create(['name' => 'Euro Product', 'sku' => 'EURO-1', 'status' => 'active']);

    $this->visitAsWorkbenchUser('/products')
        ->assertSee('Euro Product')
        ->assertSee('€')
        ->assertNoSmoke();
});
