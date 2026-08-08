<?php
declare(strict_types=1);

it('expands nested menu groups and navigates to a field page', function (): void {
    $this->visitAsWorkbenchUser('/')
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

it('collapses to an icon rail and opens a group submenu as a flyout', function (): void {
    deskLampProduct();

    $page = $this->visitAsWorkbenchUser('/')
        ->assertPresent('[data-test="sidebar"][data-collapsed="false"]')
        ->click('@sidebar-toggle');

    retryUntil(function () use ($page): void {
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
    $page = $this->visitAsWorkbenchUser('/')
        ->on()->mobile()
        ->assertMissing('[data-test="sidebar-backdrop"]')
        ->click('@sidebar-toggle');

    assertPresentEventually($page, '[data-test="sidebar-backdrop"]');

    $page
        ->click('@menu-components')
        ->click('@menu-tabs');

    retryUntil(function () use ($page): void {
        $page->assertMissing('[data-test="sidebar-backdrop"]');
    });

    $page->assertNoSmoke();
});
