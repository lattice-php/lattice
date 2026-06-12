<?php

declare(strict_types=1);

it('adds heterogeneous blocks and submits a typed payload', function (): void {
    visit('/builder')
        ->assertSee('Builder Demo')
        ->assertSee('Line items')
        ->click('@builder-add')
        ->click('@builder-add-text')
        ->fill('textarea[name="items[0][content]"]', 'Intro line')
        ->click('@builder-add')
        ->click('@builder-add-product')
        ->fill('input[name="items[1][product]"]', 'SKU-1')
        ->fill('input[name="items[1][qty]"]', '3')
        ->fill('input[name="items[1][price]"]', '9.50')
        ->click('Save')
        ->assertSee('Builder Demo')
        ->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});

it('surfaces a per-row required error for the active block', function (): void {
    visit('/builder')
        ->assertSee('Builder Demo')
        ->click('@builder-add')
        ->click('@builder-add-product')
        ->click('Save')
        ->assertSee('The items.0.product field is required.')
        ->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});
