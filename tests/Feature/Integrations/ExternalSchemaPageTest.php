<?php
declare(strict_types=1);

use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;

test('workbench external schema page renders nested external nodes', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/workbench/external-schema')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('lattice.schema.0.type', 'section')
            ->where('lattice.schema.0.schema.0.type', 'card')
            ->where('lattice.schema.0.schema.0.schema.1.type', 'remote.data-list')
            ->where('lattice.schema.0.schema.0.schema.2.type', 'remote.external-chat-box')
        );
});
