<?php
declare(strict_types=1);

use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;
use function Pest\Laravel\withSession;

test('workbench pages render the floating chat layout by default', function () {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('lattice.layout.key', 'app')
            ->has('lattice.layout.schema', 4)
            ->has('lattice.layout.schema.0.schema', 2)
            ->where('lattice.layout.schema.3.type', 'floating-panel')
            ->where('lattice.layout.schema.3.key', 'assistant-chat')
            ->where('lattice.layout.schema.3.props.trigger.0.type', 'badge')
            ->where('lattice.layout.schema.3.schema.0.type', 'chat.box')
        );
});

test('workbench pages dock the chat in a side rail when the chat-inline flag is set', function () {
    withoutVite();
    config(['session.driver' => 'array']);
    $this->actingAs(workbenchTestUser());

    withSession(['workbench.chat_inline' => true]);

    get('/')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page) => $page
            ->where('lattice.layout.key', 'app-chat')
            ->has('lattice.layout.schema', 3)
            ->where('lattice.layout.schema.0.schema.2.key', 'chat-rail')
            ->where('lattice.layout.schema.0.schema.2.schema.0.type', 'chat.box')
            ->where('lattice.layout.schema.0.schema.2.schema.0.props.fill', true)
        );
});
