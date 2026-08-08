<?php
declare(strict_types=1);

use Orchestra\Testbench\Factories\UserFactory;

it('copies a cell value to the clipboard', function (): void {
    deleteWorkbenchUsersExceptAuthenticated();
    UserFactory::new()->create(['name' => 'Ada Lovelace', 'email' => 'ada@example.com']);

    $page = $this->visitAsWorkbenchUser('/');
    stubSuccessfulClipboard($page);
    $page->click('@copy-email');

    assertSeeEventually($page, 'Copied');

    $page->assertNoSmoke();
});
