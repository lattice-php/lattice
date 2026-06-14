<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('renders the form showcase with every field type', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/showcase')
        ->assertSee('Form Showcase')
        ->assertNoSmoke()
        ->assertSee('Full name')
        ->assertSee('Email')
        ->assertSee('Password')
        ->assertSee('Bio')
        ->assertSee('Age')
        ->assertSee('Satisfaction')
        ->assertSee('Birthday')
        ->assertSee('Plan')
        ->assertSee('Account type')
        ->assertSee('Quantity')
        ->assertSee('Total')
        ->assertSee('Article')
        ->assertSee('Subscribe to the newsletter')
        ->assertPresent('[aria-label="Bold"]')
        ->assertPresent('.lattice-prose')
        ->assertPresent('input[type="hidden"][name="source"]');
});

it('inserts a table and a details block into the rich editor', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/showcase')
        ->assertPresent('[aria-label="Insert table"]')
        ->assertPresent('[aria-label="Details"]')
        ->assertPresent('[aria-label="Insert emoji"]')
        ->assertPresent('[aria-label="Underline"]')
        ->assertPresent('[aria-label="Highlight"]')
        ->assertPresent('[aria-label="Align center"]')
        ->click('[aria-label="Details"]')
        ->assertPresent('.lattice-prose [data-type="details"]')
        ->click('[aria-label="Insert table"]')
        ->assertPresent('.lattice-prose table')
        ->assertNoJavaScriptErrors();
});

it('selects a static option from the select field', function (): void {
    $this->actingAs(workbenchTestUser());
    $page = visit('/showcase');

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

    $page = visit('/showcase');

    $page->assertSee('Search products…')
        ->click('Search products…')
        ->fill('input[aria-label="Search options"]', 'walnut')
        ->assertSee('Walnut Desk')
        ->assertDontSee('Steel Lamp')
        ->click('Walnut Desk')
        ->assertPresent('button[aria-label="Remove Walnut Desk"]')
        ->assertPresent('input[type="hidden"][name="related_products[]"]')
        ->assertNoJavaScriptErrors();
});

it('runs conditional and computed behavior on the showcase', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/showcase')
        ->assertDontSee('Company')
        ->click('Business')
        ->assertSee('Company')
        ->fill('quantity', '4')
        ->fill('unit_price', '5')
        ->wait(1)
        ->assertValue('total', '20');
});
