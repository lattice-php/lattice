<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('prefills computed prices, keeps manual edits, and re-prices untouched rows', function (): void {
    Product::factory()->create(['name' => 'Alpha Chair', 'price' => 100.00]);
    Product::factory()->create(['name' => 'Beta Table', 'price' => 200.00]);

    visit('/builder-pricing')
        ->assertSee('Pricing Builder Demo')
        ->click('@builder-add')
        ->click('@builder-add-product')
        ->click('@builder-add')
        ->click('@builder-add-product')
        ->click('[data-test="repeater-items-row-0"] [data-test="select-product"]')
        ->click('Alpha Chair')
        ->click('[data-test="repeater-items-row-1"] [data-test="select-product"]')
        ->click('Beta Table')
        ->wait(1)
        ->assertValue('input[name="items[0][price]"]', '100')
        ->assertValue('input[name="items[1][price]"]', '200')
        ->fill('input[name="items[0][price]"]', '1.00')
        ->click('[data-test="select-customer"]')
        ->click('@select-customer-option-initech')
        ->wait(1)
        ->assertValue('input[name="items[0][price]"]', '1.00')
        ->assertValue('input[name="items[1][price]"]', '150')
        ->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});

it('evaluates row field visibility against same-row siblings', function (): void {
    Product::factory()->create(['name' => 'Alpha Chair', 'price' => 100.00]);

    visit('/builder-pricing')
        ->assertSee('Pricing Builder Demo')
        ->click('@builder-add')
        ->click('@builder-add-product')
        ->click('@builder-add')
        ->click('@builder-add-product')
        ->assertNotPresent('input[name="items[0][discount_note]"]')
        ->assertNotPresent('input[name="items[1][discount_note]"]')
        ->click('[data-test="repeater-items-row-1"] [data-test="select-product"]')
        ->click('Alpha Chair')
        ->assertNotPresent('input[name="items[0][discount_note]"]')
        ->assertPresent('input[name="items[1][discount_note]"]')
        ->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});
