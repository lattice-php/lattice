<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('expands a collapsed menu group and navigates to a sub-page', function (): void {
    visit('/')
        ->assertSee('Home')
        ->assertSee('Forms')
        ->assertSee('Tables')
        ->assertDontSee('Showcase')
        ->click('@menu-forms')
        ->assertSee('Showcase')
        ->assertSee('Builder Table Demo')
        ->click('@menu-builder-table-demo')
        ->assertSee('Line items')
        ->assertNoSmoke();
});

it('auto-expands the group containing the active page', function (): void {
    Product::factory()->create(['name' => 'Desk Lamp']);

    visit('/products')
        ->assertPresent('[data-test="menu-products"]')
        ->assertPresent('[data-test="menu-pagination-modes"]');
});

it('collapses to an icon rail and opens a group submenu as a flyout', function (): void {
    Product::factory()->create(['name' => 'Desk Lamp']);

    visit('/')
        ->click('@sidebar-toggle')
        ->assertPresent('[aria-label="Expand sidebar"]')
        ->click('@menu-tables')
        ->click('@menu-products')
        ->assertSee('Desk Lamp')
        ->assertPresent('[aria-label="Expand sidebar"]')
        ->assertNoSmoke();
});
