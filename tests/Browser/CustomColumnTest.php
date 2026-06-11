<?php

declare(strict_types=1);

use Workbench\App\Models\Product;

it('renders the custom status-badge column cell in the products table', function (): void {
    Product::factory()->create([
        'name' => 'Badge Test Product',
        'sku' => 'BADGE-001',
        'price' => '29.99',
        'status' => 'active',
    ]);

    visit('/products')
        ->assertSee('Products')
        ->assertSee('Badge Test Product')
        ->assertPresent('[data-testid="status-badge"]')
        ->assertSee('active')
        ->assertNoSmoke();
});
