<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('shows precognitive validation messages in the form', function (): void {
    visit('/products/create')
        ->assertSee('Create Product')
        ->fill('@price', 'invalid')
        ->assertSee('The Price field must be a number.')
        ->assertNoSmoke();

    expect(Product::query()->count())->toBe(0);
});

it('disables the submit button while precognition errors are active', function (): void {
    visit('/products/create')
        ->assertSee('Create Product')
        ->assertEnabled('@form-submit')
        ->fill('@price', 'invalid')
        ->assertSee('Fix these fields to continue:')
        ->assertDisabled('@form-submit')
        ->fill('@price', '49.99')
        ->assertEnabled('@form-submit');
});

it('surfaces server validation errors after submitting an empty form', function (): void {
    visit('/products/create')
        ->assertSee('Create Product')
        ->click('@form-submit')
        ->assertSee('The Name field is required.')
        ->assertDisabled('@form-submit');

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
    $related = Product::factory()->create(['name' => 'Walnut Desk']);

    visit('/products/create')
        ->assertSee('Create Product')
        ->fill('@name', 'Gadget')
        ->fill('@sku', 'GAD-100')
        ->fill('@price', '12.00')
        ->click('@status-active')
        ->click('@select-related_products')
        ->fill('@select-related_products-search', 'walnut')
        ->assertSee('Walnut Desk')
        ->click("@select-related_products-option-{$related->getKey()}")
        ->assertPresent("[data-test=\"select-related_products-remove-{$related->getKey()}\"]")
        ->click('@form-submit')
        ->assertSee('Products')
        ->assertNoSmoke();

    $product = Product::query()->where('sku', 'GAD-100')->firstOrFail();

    expect($product->relatedProducts->pluck('name')->all())->toBe(['Walnut Desk']);
});

it('creates and edits a product through the form flow', function (): void {
    visit('/products')
        ->assertSee('Products')
        ->click('@create-product')
        ->assertSee('Create Product')
        ->fill('@name', 'Desk Lamp')
        ->fill('@sku', 'LAMP-001')
        ->fill('@price', '49.99')
        ->click('@status-active')
        ->click('@form-submit')
        ->assertSee('Products')
        ->assertSee('Desk Lamp')
        ->click('@product-edit')
        ->assertSee('Edit Product')
        ->assertValue('Name', 'Desk Lamp')
        ->fill('@name', 'Updated Lamp')
        ->assertValue('Name', 'Updated Lamp')
        ->assertEnabled('@form-submit')
        ->click('@form-submit')
        ->assertSee('Products')
        ->assertSee('Updated Lamp')
        ->assertNoSmoke();

    expect(Product::query()->where('sku', 'LAMP-001')->value('name'))->toBe('Updated Lamp');
});
