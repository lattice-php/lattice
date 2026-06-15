<?php

declare(strict_types=1);

use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\post;
use function Pest\Laravel\withoutVite;

test('stream-demo endpoint streams the canned sentence as plain text', function (): void {
    $this->actingAs(workbenchTestUser());

    $content = post('/workbench/stream-demo')->streamedContent();

    $expectedSentence = 'This text is streamed one word at a time straight from a custom workbench endpoint using core Laravel response streaming.';

    expect(trim($content))->toBe($expectedSentence);
});

test('streaming page renders an inertia lattice page with a stream component', function (): void {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/streaming')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->component('lattice/page')
            ->where('lattice.title', 'Streaming Demo')
            ->has('lattice.schema.0.schema', 3)
            ->where('lattice.schema.0.schema.2.type', 'stream')
            ->where('lattice.schema.0.schema.2.props.endpoint', '/workbench/stream-demo')
            ->where('lattice.schema.0.schema.2.props.auto', true)
        );
});
