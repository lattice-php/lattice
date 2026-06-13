<?php
declare(strict_types=1);

it('opens the user menu and reveals its items', function (): void {
    visit('/')
        ->assertSee('Workbench User')
        ->assertDontSee('Log out')
        ->click('@user-menu')
        ->assertSee('Log out')
        ->assertNoSmoke();
});

it('keeps user menu item labels visible when the sidebar is collapsed', function (): void {
    visit('/')
        ->click('@sidebar-toggle')
        ->assertPresent('[aria-label="Expand sidebar"]')
        ->click('@user-menu')
        ->assertSee('Log out')
        ->assertNoSmoke();
});
