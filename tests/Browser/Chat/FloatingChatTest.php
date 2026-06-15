<?php

declare(strict_types=1);

it('mounts the floating chat launcher on every page', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/')
        ->assertPresent('[data-test="chat-launcher"]')
        ->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});

it('opens the chat panel and renders the seeded conversation history', function (): void {
    $this->actingAs(workbenchTestUser());

    visit('/')
        ->click('@chat-launcher')
        ->assertPresent('[data-test="chat-panel"]')
        ->assertSee('I can answer questions about this workbench and look things up for you.')
        ->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});

it('shows an optimistic user bubble when a message is sent', function (): void {
    $this->actingAs(workbenchTestUser());

    $page = visit('/')
        ->click('@chat-launcher')
        ->assertPresent('[data-test="chat-panel"]')
        ->type('@chat-input', 'How do I export a table?')
        ->click('@chat-send');

    $page->assertSee('How do I export a table?');

    // The AMPHP browser harness may buffer the POST StreamedResponse, so the streamed
    // assistant reply ("Sure, let me look that up for you right away.") and the tool-call
    // badge ([data-test="chat-tool-call"]) may never reach the in-browser fetch. This is the
    // same documented limitation that StreamDemoTest works around. We assert only what is
    // reliably observable here; streamed text + the tool-call part are covered by the feature
    // test (ChatSimulationTest) and the Vitest layer.
    $page->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});
