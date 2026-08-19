<?php
declare(strict_types=1);

it('renders the seeded hierarchy and adds a nested child block', function (): void {
    $page = $this->visitAsWorkbenchUser('/form/fields/tree')
        ->assertSee('Line items')
        ->assertValue('input[name="items[0][children][0][product]"]', 'Switch')
        ->assertValue('input[name="items[1][product]"]', 'Installation');

    $page->click('@tree-field-items-add-child-0')
        ->click('@tree-field-items-add-child-0-product')
        ->fill('input[name="items[0][children][2][product]"]', 'Router')
        ->fill('input[name="items[0][children][2][qty]"]', '1')
        ->click('@form-submit');

    // resetOnSuccess restores the page fill, so the added third child
    // disappearing is the success signal.
    retryUntil(function () use ($page): void {
        $page->assertMissing('input[name="items[0][children][2][product]"]');
    });

    $page->assertNoSmoke();
});

it('surfaces a required error at the nested row path', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/tree')
        ->assertSee('Line items')
        ->click('@tree-field-items-add-child-0')
        ->click('@tree-field-items-add-child-0-product')
        ->click('@form-submit')
        ->assertSee('The Product field is required.')
        ->assertNoSmoke();
});
