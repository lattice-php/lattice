<?php

declare(strict_types=1);

it('loads remote schema data and chat history through browser token exchange', function (): void {
    $page = $this->visitAsWorkbenchUser('/platform/remote-schema');

    assertSeeEventually($page, 'Review remote schema proposal');
    assertSeeEventually($page, 'Remote todo history loaded with a browser token.');

    $page
        ->assertSee('Open brief')
        ->assertPresent('a[href="/workbench/remote-schema?todo=remote-schema-proposal"]')
        ->assertNoSmoke();
});
