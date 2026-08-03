<?php
declare(strict_types=1);

use Orchestra\Testbench\Factories\UserFactory;

it('lists users with their columns', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    $page = visit('/');
    disableInfiniteScrollAutoLoad($page);

    $page->assertSee('Workbench users')
        ->assertSee('Maya Chen')
        ->assertSee('Ada Lovelace')
        ->assertSee('Created at')
        ->assertSee('Updated at')
        ->assertDontSee('Browser User 26')
        ->assertNoSmoke();
});

it('copies a cell value to the clipboard', function (): void {
    $this->actingAs(workbenchTestUser());
    deleteWorkbenchUsersExceptAuthenticated();
    UserFactory::new()->create(['name' => 'Ada Lovelace', 'email' => 'ada@example.com']);

    $page = visit('/');
    stubSuccessfulClipboard($page);
    $page->click('@copy-email');

    assertSeeEventually($page, 'Copied');

    $page->assertNoSmoke();
});
