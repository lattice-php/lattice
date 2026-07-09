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

it('persists attributes for every block, not just the selected one', function (): void {
    actingAs(workbenchTestUser());

    $page = visit('/block-editor');

    $page->click('@builder-add')
        ->click('[data-test="builder-add-workbench.hero"]');
    $page->click('@builder-add')
        ->click('[data-test="builder-add-workbench.hero"]');

    $page->assertPresent('[data-test^="block-shell-"]:nth-child(1)')
        ->assertPresent('[data-test^="block-shell-"]:nth-child(2)');

    $page->click('[data-test^="block-shell-"]:nth-child(1)');
    $page->fill('input[name="content[0][title]"]', 'First title');
    $page->click('[data-test^="block-shell-"]:nth-child(2)');

    retryUntil(function () use ($page): void {
        $page->assertSee('First title');
    });

    $page->fill('input[name="content[1][title]"]', 'Second title');
    $page->click('Block Editor Demo');

    retryUntil(function () use ($page): void {
        $page->assertSee('First title');
        $page->assertSee('Second title');
    });

    $page->click('Save');

    retryUntil(function () use ($page): void {
        $page->assertSee('Saved: First title, Second title');
    });

    $page->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});
