<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('selects a static option from the select field', function (): void {
    $this->actingAs(workbenchTestUser());
    $page = visit('/form/fields/select');

    $page->assertSee('Pick a country')
        ->click('Pick a country')
        ->assertSee('France')
        ->click('Germany')
        ->assertNoJavaScriptErrors()
        ->assertPresent('input[type="hidden"][name="country"][value="de"]');
});

it('searches and selects entities in a multiple select', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Walnut Desk']);
    Product::factory()->create(['name' => 'Steel Lamp']);

    $page = visit('/form/fields/select?type=searchable');

    $page->assertSee('Search products…')
        ->click('Search products…')
        ->fill('input[aria-label="Search options"]', 'walnut');

    eventually(function () use ($page): void {
        $page->assertDontSee('Steel Lamp');
    });

    $page->assertSee('Walnut Desk')
        ->click('Walnut Desk')
        ->assertPresent('button[aria-label="Remove Walnut Desk"]')
        ->assertPresent('input[type="hidden"][name="related_products[]"]')
        ->assertNoJavaScriptErrors();
});
