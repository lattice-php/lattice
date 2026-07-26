<?php
declare(strict_types=1);

it('renders the repeater with one default row', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/repeater')
        ->assertSee('Repeater')
        ->assertSee('Line items')
        ->assertPresent('[data-test="repeater-items-row-0"]')
        ->assertPresent('input[name="items[0][name]"]')
        ->assertPresent('input[name="items[0][qty]"]')
        ->assertNoSmoke();
});

// The form redirects back to the same URL on success, which leaves no
// client-observable state change (form values live in the client store and
// survive same-page visits). The server-side round-trip is asserted in
// NestedFieldFormSubmitTest; these tests cover the client interactions.
it('round-trips a repeater payload through submit', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/repeater')
        ->assertSee('Line items')
        ->fill('input[name="items[0][name]"]', 'Widget')
        ->fill('input[name="items[0][qty]"]', '2')
        ->click('@repeater-items-add')
        ->assertPresent('[data-test="repeater-items-row-1"]')
        ->fill('input[name="items[1][name]"]', 'Gadget')
        ->fill('input[name="items[1][qty]"]', '5')
        ->click('@form-submit')
        ->assertNoSmoke();
});

it('reorders rows and submits successfully', function (): void {
    $page = $this->visitAsWorkbenchUser('/form/fields/repeater')
        ->assertSee('Line items')
        ->fill('input[name="items[0][name]"]', 'First')
        ->fill('input[name="items[0][qty]"]', '1')
        ->click('@repeater-items-add')
        ->assertPresent('[data-test="repeater-items-row-1"]')
        ->fill('input[name="items[1][name]"]', 'Second')
        ->fill('input[name="items[1][qty]"]', '2')
        ->click('@repeater-items-down-0');

    retryUntil(function () use ($page): void {
        $page->assertValue('input[name="items[0][name]"]', 'Second');
    });

    $page->click('@form-submit')
        ->assertNoSmoke();
});

it('surfaces the per-row required validation error on submit', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/repeater')
        ->assertSee('Line items')
        ->click('@form-submit')
        ->assertSee('The Name field is required.')
        ->assertNoSmoke();
});
