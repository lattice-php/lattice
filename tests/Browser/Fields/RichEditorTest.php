<?php
declare(strict_types=1);

it('renders only the configured extensions in the toolbar', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/rich-editor?type=restricted')
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
    $this->visitAsWorkbenchUser('/form/fields/rich-editor?type=restricted')
        ->assertPresent('@editor-stamp')
        ->click('@editor-stamp')
        ->assertSeeIn('[id="restricted-panel"] .lattice-prose', 'Stamped!')
        ->assertNoJavaScriptErrors();
});

it('inserts a block through the slash menu', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/rich-editor')
        ->click('[id="default-panel"] .lattice-prose')
        ->keys('[id="default-panel"] .lattice-prose', '/')
        ->assertPresent('[data-test="editor-block-menu"]')
        ->click('[data-test="editor-block-blockquote"]')
        ->assertPresent('[id="default-panel"] .lattice-prose blockquote')
        ->assertNoJavaScriptErrors();
});

it('keeps the slash menu working with the toolbar hidden', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/rich-editor?type=no-toolbar')
        ->assertNotPresent('[id="no-toolbar-panel"] [data-test="editor-bold"]')
        ->click('[id="no-toolbar-panel"] .lattice-prose')
        ->keys('[id="no-toolbar-panel"] .lattice-prose', '/')
        ->click('[data-test="editor-block-bullet-list"]')
        ->assertPresent('[id="no-toolbar-panel"] .lattice-prose ul li')
        ->assertNoJavaScriptErrors();
});

it('inserts a details block on the default set', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/rich-editor')
        ->click('[aria-label="Details"]')
        ->assertPresent('[id="default-panel"] .lattice-prose [data-type="details"]')
        ->assertNoJavaScriptErrors();
});
