<?php
declare(strict_types=1);

it('opens the composed user dropdown and reveals its items', function (): void {
    $this->visitAsWorkbenchUser('/')
        ->assertSee('Workbench User')
        ->assertDontSee('Log out')
        ->click('@user-menu')
        ->assertSee('Log out')
        ->assertNoSmoke();
});

it('keeps the user dropdown usable when the sidebar is collapsed', function (): void {
    $page = $this->visitAsWorkbenchUser('/')
        ->click('@sidebar-toggle');

    retryUntil(function () use ($page): void {
        $page->assertAttribute('[data-test="sidebar"]', 'data-collapsed', 'true');
    });

    $page
        ->click('@user-menu')
        ->assertSee('Log out')
        ->assertNoSmoke();
});

it('logs the user out through the user dropdown action', function (): void {
    $this->visitAsWorkbenchUser('/')
        ->click('@user-menu')
        ->click('Log out')
        ->assertSee('Use the seeded account to enter the workbench.')
        ->assertNoSmoke();
});

it('renders the workbench locale switcher as a topbar dropdown', function (): void {
    $this->visitAsWorkbenchUser('/')
        ->assertPresent('[data-test="locale-switcher"]')
        ->click('@locale-switcher')
        ->assertSee('English')
        ->assertSee('German')
        ->assertNoSmoke();
});
