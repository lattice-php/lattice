<?php
declare(strict_types=1);

it('opens the composed user dropdown and reveals its items', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/')
        ->assertSee('Workbench User')
        ->assertDontSee('Log out')
        ->click('@user-menu')
        ->assertSee('Log out')
        ->assertNoSmoke();
});

it('keeps the user dropdown usable when the sidebar is collapsed', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/')
        ->click('@sidebar-toggle')
        ->assertPresent('[data-test="sidebar"][data-collapsed="true"]')
        ->click('@user-menu')
        ->assertSee('Log out')
        ->assertNoSmoke();
});

it('renders the workbench locale switcher as a topbar dropdown', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/')
        ->assertPresent('[data-test="locale-switcher"]')
        ->click('@locale-switcher')
        ->assertSee('English')
        ->assertSee('German')
        ->assertNoSmoke();
});
