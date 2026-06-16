<?php

declare(strict_types=1);

it('mounts the floating chat trigger on every page', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/')
        ->assertVisible('@assistant-chat-trigger')
        ->assertMissing('@chat-box')
        ->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});

it('opens the chat panel and renders the seeded conversation history', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/')
        ->click('@assistant-chat-trigger')
        ->assertVisible('@chat-box')
        ->assertSee('I can answer questions about this workbench and look things up for you.')
        ->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});

it('shows an optimistic user bubble when a message is sent', function (): void {
    $this->actingAs(workbenchTestUser());

    $page = visit('/')
        ->click('@assistant-chat-trigger')
        ->assertVisible('@chat-box')
        ->type('@chat-input', 'How do I export a table?')
        ->click('@chat-send');

    $page->assertSee('How do I export a table?');

    $page->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});
