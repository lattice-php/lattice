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
        ->assertVisible('@chat-box');

    $page->script(<<<'JS_WRAP'
        (() => {
            const originalFetch = window.fetch.bind(window);

            window.fetch = (input, init) => {
                const url = typeof input === 'string' ? input : input.url;

                if (url.includes('/workbench/chat/stream')) {
                    const body = [
                        JSON.stringify({ type: 'text', value: 'Stubbed assistant response.' }),
                        JSON.stringify({ type: 'done' }),
                        '',
                    ].join('\n');

                    return Promise.resolve(new Response(body, {
                        status: 200,
                        headers: { 'Content-Type': 'application/x-ndjson' },
                    }));
                }

                return originalFetch(input, init);
            };
        })();
    JS_WRAP);

    $page->type('@chat-input', 'Hello from the browser test')
        ->click('@chat-send');

    assertSeeEventually($page, 'Hello from the browser test');
    assertSeeEventually($page, 'Stubbed assistant response.');

    $page->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});
