<?php
declare(strict_types=1);

it('renders only the configured extensions in the toolbar', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/form/fields/rich-editor?type=restricted')
        ->assertPresent('[id="restricted-panel"] [data-test="editor-bold"]')
        ->assertPresent('[id="restricted-panel"] [data-test="editor-italic"]')
        ->assertPresent('[id="restricted-panel"] [data-test="editor-link"]')
        ->assertNotPresent('[id="restricted-panel"] [data-test="editor-heading"]')
        ->assertNotPresent('[id="restricted-panel"] [data-test="editor-insert-table"]')
        ->assertNotPresent('[id="restricted-panel"] [data-test="editor-emoji"]')
        ->assertNotPresent('[id="restricted-panel"] [data-test="editor-highlight"]')
        ->assertNoJavaScriptErrors();
});

it('runs a client-registered custom extension from the toolbar', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/form/fields/rich-editor?type=restricted')
        ->assertPresent('@editor-stamp')
        ->click('@editor-stamp')
        ->assertSeeIn('[id="restricted-panel"] .lattice-prose', 'Stamped!')
        ->assertNoJavaScriptErrors();
});

it('inserts a table and a details block on the default set', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/form/fields/rich-editor')
        ->assertPresent('[aria-label="Insert table"]')
        ->assertPresent('[aria-label="Details"]')
        ->assertPresent('[aria-label="Insert emoji"]')
        ->assertPresent('[aria-label="Underline"]')
        ->assertPresent('[aria-label="Highlight"]')
        ->assertPresent('[aria-label="Align center"]')
        ->click('[aria-label="Details"]')
        ->assertPresent('[id="default-panel"] .lattice-prose [data-type="details"]')
        ->click('[aria-label="Insert table"]')
        ->assertPresent('[id="default-panel"] .lattice-prose table')
        ->assertNoJavaScriptErrors();
});

it('toggles heading levels through the dropdown on the default set', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/form/fields/rich-editor')
        ->assertPresent('@editor-heading')
        ->click('@editor-heading')
        ->assertPresent('@editor-heading-6')
        ->click('@editor-heading-2')
        ->assertPresent('[id="default-panel"] .lattice-prose h2')
        ->assertNoJavaScriptErrors();
});

it('sets a link through the popover', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/form/fields/rich-editor?type=restricted')
        ->click('[id="restricted-panel"] .lattice-prose')
        ->type('[id="restricted-panel"] .lattice-prose', 'Docs')
        ->click('[id="restricted-panel"] [data-test="editor-link"]')
        ->assertPresent('@editor-link-url')
        ->type('@editor-link-url', 'https://example.com')
        ->click('@editor-link-apply')
        ->assertNoJavaScriptErrors();
});
