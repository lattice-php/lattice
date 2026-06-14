<?php
declare(strict_types=1);

it('loads the workbench home page without smoke failures', function (): void {
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    visit('/')
        ->assertSee('Workbench page')
        ->assertSee('Lattice Package')
        ->assertNoSmoke();
});
