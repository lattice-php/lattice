<?php

declare(strict_types=1);

it('reveals the docked chat panel when the chat layout is toggled', function (): void {
    $this->actingAs(workbenchTestUser());

    $page = visit('/')
        ->assertVisible('@assistant-chat-trigger')
        ->assertMissing('@chat-box')
        ->click('@user-menu')
        ->assertSee('Reveal chat in a side rail')
        ->click('@chat-layout-toggle');

    eventually(fn () => $page->assertVisible('@chat-box'));

    $page
        ->assertMissing('@assistant-chat-trigger')
        ->assertSee('Dock chat back to floating')
        ->click('@chat-layout-toggle')
        ->assertVisible('@assistant-chat-trigger')
        ->assertMissing('@chat-box')
        ->assertNoSmoke();
});
