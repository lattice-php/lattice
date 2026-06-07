<?php

declare(strict_types=1);

it('loads the workbench lattice page without browser smoke failures', function (): void {
    visit('/')
        ->assertSee('Workbench page')
        ->assertSee('Lattice Package')
        ->assertNoSmoke();
});
