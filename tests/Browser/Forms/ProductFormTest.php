<?php

declare(strict_types=1);

use Workbench\App\Models\Product;

it('shows precognitive validation messages in the form', function (): void {
    visit('/products/create')
        ->assertSee('Create Product')
        ->fill('Price', 'invalid')
        ->assertSee('The Price field must be a number.')
        ->assertNoSmoke();

    expect(Product::query()->count())->toBe(0);
});

it('disables the submit button while precognition errors are active', function (): void {
    visit('/products/create')
        ->assertSee('Create Product')
        ->assertButtonEnabled('Create product')
        ->fill('Price', 'invalid')
        ->assertSee('Fix these fields to continue:')
        ->assertButtonDisabled('Create product')
        ->fill('Price', '49.99')
        ->assertButtonEnabled('Create product');
});

it('surfaces server validation errors after submitting an empty form', function (): void {
    visit('/products/create')
        ->assertSee('Create Product')
        ->click('Create product')
        ->assertSee('The Name field is required.')
        ->assertButtonDisabled('Create product');

    expect(Product::query()->count())->toBe(0);
});

it('shows existing related products on the edit page', function (): void {
    $product = Product::factory()->create([
        'name' => 'Desk Lamp',
        'sku' => 'LAMP-001',
        'price' => '49.99',
        'status' => 'active',
    ]);
    $related = Product::factory()->create(['name' => 'Walnut Desk']);
    $product->relatedProducts()->sync([$related->getKey()]);

    visit("/products/{$product->getKey()}/edit")
        ->assertSee('Edit Product')
        ->assertSee('Related products')
        ->assertSee('Walnut Desk')
        ->assertPresent('button[aria-label="Remove Walnut Desk"]')
        ->assertNoJavaScriptErrors();
});

it('attaches related products via search when creating', function (): void {
    Product::factory()->create(['name' => 'Walnut Desk']);

    visit('/products/create')
        ->assertSee('Create Product')
        ->fill('Name', 'Gadget')
        ->fill('SKU', 'GAD-100')
        ->fill('Price', '12.00')
        ->click('Active')
        ->click('Search products…')
        ->fill('input[aria-label="Search options"]', 'walnut')
        ->assertSee('Walnut Desk')
        ->click('Walnut Desk')
        ->assertPresent('button[aria-label="Remove Walnut Desk"]')
        ->click('Create product')
        ->assertSee('Products')
        ->assertNoSmoke();

    $product = Product::query()->where('sku', 'GAD-100')->firstOrFail();

    expect($product->relatedProducts->pluck('name')->all())->toBe(['Walnut Desk']);
});

it('creates and edits a product through the form flow', function (): void {
    visit('/products')
        ->assertSee('Products')
        ->click('Create product')
        ->assertSee('Create Product')
        ->fill('Name', 'Desk Lamp')
        ->fill('SKU', 'LAMP-001')
        ->fill('Price', '49.99')
        ->click('Active')
        ->click('Create product')
        ->assertSee('Products')
        ->assertSee('Desk Lamp')
        ->click('Edit')
        ->assertSee('Edit Product')
        ->assertValue('Name', 'Desk Lamp')
        ->fill('Name', 'Updated Lamp')
        ->assertButtonEnabled('Save product')
        ->click('Save product')
        ->assertSee('Products')
        ->assertSee('Updated Lamp')
        ->assertNoSmoke();

    expect(Product::query()->where('sku', 'LAMP-001')->value('name'))->toBe('Updated Lamp');
});
