<?php
declare(strict_types=1);

it('renders only the configured extensions in the toolbar', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/rich-editor-demo')
        ->assertPresent('@editor-bold')
        ->assertPresent('@editor-italic')
        ->assertPresent('@editor-link')
        ->assertNotPresent('@editor-heading')
        ->assertNotPresent('@editor-insert-table')
        ->assertNotPresent('@editor-emoji')
        ->assertNotPresent('@editor-highlight')
        ->assertNoJavaScriptErrors();
});

it('runs a client-registered custom extension from the toolbar', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/rich-editor-demo')
        ->assertPresent('@editor-stamp')
        ->click('@editor-stamp')
        ->assertSeeIn('.lattice-prose', 'Stamped!')
        ->assertNoJavaScriptErrors();
});

it('toggles heading levels through the dropdown on the default set', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/showcase')
        ->assertPresent('@editor-heading')
        ->click('@editor-heading')
        ->assertPresent('@editor-heading-6')
        ->click('@editor-heading-2')
        ->assertPresent('.lattice-prose h2')
        ->assertNoJavaScriptErrors();
});

it('sets a link through the popover', function (): void {
    $this->actingAs(workbenchTestUser());
    visit('/rich-editor-demo')
        ->click('.lattice-prose')
        ->type('.lattice-prose', 'Docs')
        ->click('@editor-link')
        ->assertPresent('@editor-link-url')
        ->type('@editor-link-url', 'https://example.com')
        ->click('@editor-link-apply')
        ->assertNoJavaScriptErrors();
});
