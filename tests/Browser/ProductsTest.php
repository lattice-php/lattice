<?php

declare(strict_types=1);

use Workbench\App\Models\Product;

it('shows product validation messages in the form flow', function (): void {
    visit('/products/create')
        ->assertSee('Create Product')
        ->fill('Price', 'invalid')
        ->wait(1)
        ->assertNoSmoke()
        ->assertSee('The price field must be a number.');

    expect(Product::query()->count())->toBe(0);
});

it('disables the submit button while precognition errors are active', function (): void {
    visit('/products/create')
        ->assertSee('Create Product')
        ->assertButtonEnabled('Create product')
        ->fill('Price', 'invalid')
        ->wait(1)
        ->assertButtonDisabled('Create product')
        ->assertSee('Fix these fields to continue:')
        ->assertSee('The price field must be a number.')
        ->fill('Price', '49.99')
        ->wait(1)
        ->assertButtonEnabled('Create product');
});

it('surfaces server validation errors after submitting an empty form', function (): void {
    visit('/products/create')
        ->assertSee('Create Product')
        ->click('Create product')
        ->wait(1)
        ->assertSee('The name field is required.')
        ->assertButtonDisabled('Create product');

    expect(Product::query()->count())->toBe(0);
});

it('creates and edits products through the form flow', function (): void {
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
        ->click('Save product')
        ->assertSee('Products')
        ->assertSee('Updated Lamp')
        ->assertNoSmoke();

    expect(Product::query()->where('sku', 'LAMP-001')->value('name'))->toBe('Updated Lamp');
});
