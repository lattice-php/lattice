<?php
declare(strict_types=1);

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
    $page = $this->visitAsWorkbenchUser('/')
        ->assertSeeIn('[data-test="user-menu"]', 'Workbench User')
        ->assertDontSee('Log out')
        ->click('@user-menu')
        ->assertSee('Log out')
        ->click('Log out');

    assertSeeEventually($page, 'Use the seeded account to enter the workbench.');

    $page->assertNoSmoke();
});
