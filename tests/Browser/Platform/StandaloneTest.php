<?php
declare(strict_types=1);

it('boots a server-driven page through the published standalone bundle', function (): void {
    if (! is_dir(dirname(__DIR__, 3).'/packages/framework/dist-standalone')) {
        $this->markTestSkipped('dist-standalone is missing — run `npm run build:standalone` first.');
    }

    $this->artisan('lattice:assets')->assertSuccessful();
    $this->actingAs(workbenchTestUser());
    seedWorkbenchUsers();

    visit('/standalone-demo')
        ->assertNoSmoke()
        ->assertSee('Workbench page');
    // lattice:assets delete-then-copies the shared skeleton public/ — parallel
    // workers requesting assets mid-delete would 404 and trip their smoke checks.
})->group('serial');

it('loads a Composer component through the standalone bundle', function (): void {
    if (! is_dir(dirname(__DIR__, 3).'/packages/framework/dist-standalone')) {
        $this->markTestSkipped('dist-standalone is missing — run `npm run build:standalone` first.');
    }

    $this->artisan('lattice:assets')->assertSuccessful();
    $this->actingAs(workbenchTestUser());

    visit('/standalone-package-demo')
        ->assertNoSmoke()
        ->assertSee('Vendor component rendered');
})->group('serial');
