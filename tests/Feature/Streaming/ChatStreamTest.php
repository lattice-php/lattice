<?php

declare(strict_types=1);

use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\withoutVite;

test('chat endpoint streams the lorem-ipsum reply as plain text', function (): void {
    $this->actingAs(workbenchTestUser());

    $content = post('/workbench/chat', ['message' => 'hi'])->streamedContent();

    expect($content)->toContain('Lorem ipsum dolor sit amet');
});

test('chat page renders an inertia lattice page with a workbench.chat node', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/chat')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.title', 'Composed Chat')
            ->has('lattice.schema.0.schema', 3)
            ->where('lattice.schema.0.schema.2.type', 'workbench.chat')
            ->where('lattice.schema.0.schema.2.props.endpoint', '/workbench/chat')
        );
});
