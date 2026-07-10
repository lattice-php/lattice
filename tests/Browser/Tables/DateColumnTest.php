<?php

declare(strict_types=1);

it('renders a date cell with a precise timezone tooltip', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    visit('/')
        ->assertPresent('time[title]')
        ->assertNoSmoke();
});
