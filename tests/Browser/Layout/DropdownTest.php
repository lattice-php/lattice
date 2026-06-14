<?php
declare(strict_types=1);

it('opens the composed user dropdown and reveals its items', function (): void {
    visit('/')
        ->assertSee('Workbench User')
        ->assertSee('English')
        ->assertSee('German')
        ->assertDontSee('Log out')
        ->click('@user-menu')
        ->assertSee('Log out')
        ->assertNoSmoke();
});

it('keeps the user dropdown usable when the sidebar is collapsed', function (): void {
    visit('/')
        ->click('@sidebar-toggle')
        ->assertPresent('[aria-label="Expand sidebar"]')
        ->click('@user-menu')
        ->assertSee('Log out')
        ->assertNoSmoke();
});

it('renders the workbench locale switcher in a floating panel', function (): void {
    visit('/')
        ->assertPresent('[data-lattice-component="locale-switcher-panel"]')
        ->assertSee('English')
        ->assertSee('German')
        ->assertNoSmoke();
});
