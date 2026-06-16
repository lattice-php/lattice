<?php

declare(strict_types=1);

it('reveals the docked chat panel when the chat layout is toggled', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/')
        ->assertSee('Reveal chat in a side rail')
        ->assertVisible('@assistant-chat-trigger')
        ->assertMissing('@chat-box')
        ->click('@chat-layout-toggle')
        ->assertSee('Dock chat back to floating')
        ->assertVisible('@chat-box')
        ->assertMissing('@assistant-chat-trigger')
        ->click('@chat-layout-toggle')
        ->assertSee('Reveal chat in a side rail')
        ->assertVisible('@assistant-chat-trigger')
        ->assertMissing('@chat-box')
        ->assertNoSmoke();
});
