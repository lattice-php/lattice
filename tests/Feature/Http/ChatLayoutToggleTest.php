<?php
declare(strict_types=1);

use Inertia\Testing\AssertableInertia;

use function Pest\Laravel\get;
use function Pest\Laravel\withoutVite;
use function Pest\Laravel\withSession;

test('workbench pages render the floating chat layout by default', function () {
    withoutVite();
    $this->actingAs(workbenchTestUser());

    $response = get('/')->assertOk();

    $response->assertInertia(fn (AssertableInertia $page) => $page->where('lattice.layout.key', 'app'));

    $this->assertLatticeLayout($response)
        ->component('floating-panel', 'assistant-chat', fn ($panel) => $panel
            ->assertRendered('badge')
            ->assertRendered('chat.box'));
});

test('workbench pages dock the chat in a side rail when the chat-inline flag is set', function () {
    withoutVite();
    config(['session.driver' => 'array']);
    $this->actingAs(workbenchTestUser());

    withSession(['workbench.chat_inline' => true]);

    $response = get('/')->assertOk();

    $response->assertInertia(fn (AssertableInertia $page) => $page->where('lattice.layout.key', 'app-chat'));

    $this->assertLatticeLayout($response)
        ->assertRendered('stack:chat-rail')
        ->component('chat.box', tap: fn ($box) => $box->assertProp('fill', true));
});
