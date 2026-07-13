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

it('nests a block inside a columns slot and persists the tree', function (): void {
    actingAs(workbenchTestUser());

    $page = visit('/block-editor');

    $page->assertSee('Block Editor Demo');

    $page->click('@builder-add')
        ->click('[data-test="builder-add-workbench.columns"]');

    $page->assertPresent('[data-test="block-slot-main"]');

    $page->click('[data-test="block-slot-main"] [data-test="builder-add"]');

    $page->assertNotPresent('[data-test="builder-add-workbench.columns"]');

    $page->click('[data-test="builder-add-workbench.hero"]');

    $page->assertPresent('[data-test="block-slot-main"] [data-test^="block-shell-"]');

    $page->click('[data-test="block-slot-main"] [data-test^="block-shell-"]');
    $page->fill('input[name="content[0][slots][main][0][title]"]', 'Nested hello');
    $page->click('Block Editor Demo');

    retryUntil(function () use ($page): void {
        $page->assertSee('Nested hello');
    });

    $page->click('Save');

    retryUntil(function () use ($page): void {
        $page->assertSee('Saved: Nested hello');
    });

    $page->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});

it('drags a top-level block into an empty slot', function (): void {
    actingAs(workbenchTestUser());

    $page = visit('/block-editor');

    $page->click('@builder-add')
        ->click('[data-test="builder-add-workbench.hero"]');
    $page->click('[data-test^="block-shell-"]');
    $page->fill('input[name="content[0][title]"]', 'Dragged in');
    $page->click('Block Editor Demo');

    $page->click('@builder-add')
        ->click('[data-test="builder-add-workbench.columns"]');

    $page->assertPresent('[data-test="block-slot-drop-main"]');

    $page->drag(
        '[role="listbox"] > [data-test^="block-shell-"]:first-child [data-test^="block-drag-"]',
        '[data-test="block-slot-drop-main"]',
    );

    retryUntil(function () use ($page): void {
        $page->assertPresent('[data-test="block-slot-main"] [data-test^="block-shell-"]');
    });

    $page->click('Save');

    retryUntil(function () use ($page): void {
        $page->assertSee('Saved: Dragged in');
    });

    $page->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});

it('removes a block through its action menu', function (): void {
    actingAs(workbenchTestUser());

    $page = visit('/block-editor');

    $page->click('@builder-add')
        ->click('[data-test="builder-add-workbench.hero"]');

    $page->assertPresent('[data-test^="block-shell-"]');

    $page->click('[data-test="row-actions-menu"]')
        ->click('[data-test="row-action-remove"]');

    $page->assertNotPresent('[data-test^="block-shell-"]');

    $page->assertNoJavaScriptErrors();
});

it('duplicates a block with its attributes through its action menu', function (): void {
    actingAs(workbenchTestUser());

    $page = visit('/block-editor');

    $page->click('@builder-add')
        ->click('[data-test="builder-add-workbench.hero"]');
    $page->fill('input[name="content[0][title]"]', 'Original');
    $page->click('Block Editor Demo');

    $page->click('[data-test="row-actions-menu"]')
        ->click('[data-test="row-action-duplicate"]');

    retryUntil(function () use ($page): void {
        $page->assertValue('input[name="content[1][title]"]', 'Original');
    });

    $page->click('Save');

    retryUntil(function () use ($page): void {
        $page->assertSee('Saved: Original, Original');
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
