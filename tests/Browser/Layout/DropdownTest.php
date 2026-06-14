<?php
declare(strict_types=1);

it('opens the composed user dropdown and reveals its items', function (): void {
    visit('/')
        ->assertSee('Workbench User')
        ->assertDontSee('Log out')
        ->click('@user-menu')
        ->assertSee('Language')
        ->assertSee('English')
        ->assertSee('German')
        ->assertSee('Log out')
        ->assertNoSmoke();
});

it('keeps composed dropdown item labels visible when the sidebar is collapsed', function (): void {
    visit('/')
        ->click('@sidebar-toggle')
        ->assertPresent('[aria-label="Expand sidebar"]')
        ->click('@user-menu')
        ->assertSee('Language')
        ->assertSee('English')
        ->assertSee('German')
        ->assertSee('Log out')
        ->assertNoSmoke();
});
