<?php

declare(strict_types=1);

it('renders the table layout with a shared header and round-trips a typed payload', function (): void {
    $this->actingAs(workbenchTestUser());
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

it('reveals a reset control for custom row-table column widths and clears them on click', function (): void {
    $this->actingAs(workbenchTestUser());
    $page = visit('/builder-table');
    $page->resize(1280, 800);

    $page->script(<<<'JS_WRAP'
        () => window.localStorage.setItem('lattice:table-columns:form:items', JSON.stringify({
            columns: ['product', 'qty', 'price'],
            overrides: { qty: 160 },
        }))
    JS_WRAP);
    $page->refresh();

    $page->assertPresent('[aria-label="Resize Qty"]')
        ->assertPresent('@table-reset-columns')
        ->assertNoJavaScriptErrors();

    $page->click('@table-reset-columns')
        ->assertMissing('@table-reset-columns');

    expect($page->script(
        "() => window.localStorage.getItem('lattice:table-columns:form:items')",
    ))->toBeNull();

    $page->assertNoSmoke();
});
