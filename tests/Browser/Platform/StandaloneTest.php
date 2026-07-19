<?php
declare(strict_types=1);

it('boots a server-driven page through the published standalone bundle', function (): void {
    if (! is_dir(dirname(__DIR__, 3).'/dist-standalone')) {
        $this->markTestSkipped('dist-standalone is missing — run `npm run build:standalone` first.');
    }

    $this->artisan('lattice:assets')->assertSuccessful();
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    visit('/standalone-demo')
        ->assertSee('Workbench page')
        ->assertNoSmoke();
});
