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

it('renders rich option rows in the products search', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Walnut Desk', 'sku' => 'WD-100', 'status' => 'active']);

    $page = visit('/form/fields/select?type=searchable');

    $page->click('Search products…')
        ->fill('input[aria-label="Search options"]', 'walnut');

    eventually(function () use ($page): void {
        $page->assertSee('WD-100');
    });

    $page->click('Walnut Desk')
        ->assertPresent('button[aria-label="Remove Walnut Desk"]')
        ->assertPresent('input[type="hidden"][name="related_products[]"]')
        ->assertNoJavaScriptErrors();
});

it('adds free-text tags on the creatable tab', function (): void {
    $this->actingAs(workbenchTestUser());
    $page = visit('/form/fields/select?type=creatable');

    $page->click('[data-test="select-keywords"]')
        ->fill('[data-test="select-keywords-search"]', 'steel')
        ->keys('[data-test="select-keywords-search"]', ['Enter'])
        ->assertPresent('input[type="hidden"][name="keywords[]"][value="steel"]')
        ->assertNoJavaScriptErrors();
});

it('adds a new tag on the tags tab', function (): void {
    $this->actingAs(workbenchTestUser());
    $page = visit('/form/fields/select?type=tags');

    $page->click('[data-test="select-topics"]')
        ->fill('[data-test="select-topics-search"]', 'Logistics')
        ->keys('[data-test="select-topics-search"]', ['Enter']);

    eventually(function () use ($page): void {
        $page->assertPresent('input[type="hidden"][name="topics[]"][value="Logistics"]');
    });

    $page->assertNoJavaScriptErrors();
});
