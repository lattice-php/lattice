<?php
declare(strict_types=1);

use function Pest\Laravel\actingAs;

it('adds a block, edits it on the canvas, and persists it on submit', function (): void {
    actingAs(workbenchTestUser());

    $page = visit('/block-editor');

    $page->assertSee('Block Editor Demo')
        ->assertSee('Add block');

    $page->click('@builder-add')
        ->click('[data-test="builder-add-workbench.hero"]');

    $page->assertPresent('[data-test^="block-shell-"]');

    $page->click('[data-test^="block-shell-"]');
    $page->fill('input[name="content[0][title]"]', 'Hello world');
    $page->click('Block Editor Demo');

    retryUntil(function () use ($page): void {
        $page->assertSee('Hello world');
    });

    $page->click('Save');

    retryUntil(function () use ($page): void {
        $page->assertSee('Saved: Hello world');
    });

    $page->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});
