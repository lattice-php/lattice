<?php
declare(strict_types=1);

use Workbench\App\Models\Product;

it('expands nested menu groups and navigates to a field page', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/')
        ->assertSee('Home')
        ->assertSee('Forms')
        ->assertSee('Tables')
        ->assertDontSee('Text input')
        ->click('@menu-forms')
        ->assertSee('Fields')
        ->assertSee('Dependent & computed')
        ->click('@menu-fields')
        ->assertSee('Text input')
        ->click('@menu-field-repeater')
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

    eventually(function () use ($page): void {
        $page->assertAttribute('[data-test="sidebar"]', 'data-collapsed', 'true');
    });

    $page
        ->click('@menu-app')
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

    assertPresentEventually($page, '[data-test="sidebar-backdrop"]');

    $page
        ->click('@menu-components')
        ->click('@menu-tabs')
        ->assertMissing('[data-test="sidebar-backdrop"]')
        ->assertNoSmoke();
});
