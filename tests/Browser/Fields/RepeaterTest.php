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
        ->assertSee('Line items')
        ->assertNoSmoke();
});

it('reorders rows and submits successfully', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/repeater')
        ->assertSee('Line items')
        ->fill('input[name="items[0][name]"]', 'First')
        ->fill('input[name="items[0][qty]"]', '1')
        ->click('@repeater-items-add')
        ->assertPresent('[data-test="repeater-items-row-1"]')
        ->fill('input[name="items[1][name]"]', 'Second')
        ->fill('input[name="items[1][qty]"]', '2')
        ->click('@repeater-items-down-0')
        ->click('@form-submit')
        ->assertSee('Line items')
        ->assertNoSmoke();
});

it('surfaces the per-row required validation error on submit', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/repeater')
        ->assertSee('Line items')
        ->click('@form-submit')
        ->assertSee('The Name field is required.')
        ->assertNoSmoke();
});
