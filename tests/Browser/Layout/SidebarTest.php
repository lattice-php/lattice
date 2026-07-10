<?php
declare(strict_types=1);

use Pest\Browser\Api\Webpage;
use Workbench\App\Models\Product;

it('expands a collapsed menu group and navigates to a sub-page', function (): void {
    $this->actingAs(workbenchTestUser());
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
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Desk Lamp']);

    visit('/products')
        ->assertPresent('[data-test="menu-products"]')
        ->assertPresent('[data-test="menu-sales-orders"]');
});

it('collapses to an icon rail and opens a group submenu as a flyout', function (): void {
    $this->actingAs(workbenchTestUser());
    Product::factory()->create(['name' => 'Desk Lamp']);

    $page = visit('/')
        ->assertPresent('[data-test="sidebar"][data-collapsed="false"]')
        ->click('@sidebar-toggle');

    eventually(fn (): Webpage => $page->assertAttribute('[data-test="sidebar"]', 'data-collapsed', 'true'));

    $page
        ->click('@menu-commerce')
        ->click('@menu-products')
        ->assertSee('Desk Lamp')
        ->assertPresent('[data-test="sidebar"][data-collapsed="true"]')
        ->assertNoSmoke();
});

it('opens the sidebar as an off-canvas drawer on mobile', function (): void {
    $this->actingAs(workbenchTestUser());

    $page = visit('/')
        ->on()->mobile()
        ->assertMissing('[data-test="sidebar-backdrop"]')
        ->click('@sidebar-toggle');

    eventually(fn (): Webpage => $page->assertPresent('[data-test="sidebar-backdrop"]'));

    $page
        ->click('@menu-tabs')
        ->assertMissing('[data-test="sidebar-backdrop"]')
        ->assertNoSmoke();
});
