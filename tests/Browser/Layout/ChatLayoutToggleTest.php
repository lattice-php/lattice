<?php
declare(strict_types=1);

it('reveals the docked chat panel when the chat layout is toggled', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/')
        ->assertSee('Reveal chat in a side rail')
        ->assertPresent('@chat-launcher')
        ->assertMissing('@chat-panel')
        ->click('@chat-layout-toggle')
        ->assertSee('Dock chat back to floating')
        ->assertPresent('@chat-panel')
        ->assertMissing('@chat-launcher')
        ->click('@chat-layout-toggle')
        ->assertSee('Reveal chat in a side rail')
        ->assertPresent('@chat-launcher')
        ->assertMissing('@chat-panel')
        ->assertNoSmoke();
});
