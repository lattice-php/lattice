<?php

declare(strict_types=1);

it('renders the table layout with a shared header and round-trips a typed payload', function (): void {
    $page = visit('/builder-table');

    $page->assertSee('Line items')->assertNoSmoke()
        ->assertSee('Product')->assertSee('Qty')->assertSee('Price')
        ->assertPresent('[aria-label="Resize Qty"]');

    $page->click('@builder-add')->click('@builder-add-product')
        ->fill('input[name="items[0][product]"]', 'SKU-9')
        ->fill('input[name="items[0][qty]"]', '4')
        ->fill('input[name="items[0][price]"]', '2.50')
        ->click('@builder-add')->click('@builder-add-text')
        ->fill('textarea[name="items[1][content]"]', 'Note row')
        ->assertNoJavaScriptErrors();

    $page->click('Submit')
        ->assertSee('Builder Table Demo')
        ->assertNoSmoke()
        ->assertNoJavaScriptErrors();
});
