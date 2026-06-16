<?php
declare(strict_types=1);

use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

test('workbench remote schema page renders nested remote nodes', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/workbench/remote-schema')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('lattice.schema.0.type', 'section')
            ->where('lattice.schema.0.schema.0.type', 'card')
            ->where('lattice.schema.0.schema.0.schema.1.type', 'remote.data-list')
            ->where('lattice.schema.0.schema.0.schema.2.type', 'remote.chat-box')
        );
});
