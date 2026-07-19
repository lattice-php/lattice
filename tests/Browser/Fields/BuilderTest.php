<?php
declare(strict_types=1);

it('adds heterogeneous blocks and submits a typed payload', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/builder')
        ->assertSee('Builder')
        ->assertSee('Line items')
        ->click('[id="stack-panel"] [data-test="builder-add"]')
        ->click('@builder-add-text')
        ->fill('textarea[name="items[0][content]"]', 'Intro line')
        ->click('[id="stack-panel"] [data-test="builder-add"]')
        ->click('@builder-add-product')
        ->fill('input[name="items[1][product]"]', 'SKU-1')
        ->fill('input[name="items[1][qty]"]', '3')
        ->fill('input[name="items[1][price]"]', '9.50')
        ->click('@form-submit')
        ->assertSee('Builder')
        ->assertNoSmoke();
});

it('surfaces a per-row required error for the active block', function (): void {
    $this->visitAsWorkbenchUser('/form/fields/builder')
        ->assertSee('Line items')
        ->click('[id="stack-panel"] [data-test="builder-add"]')
        ->click('@builder-add-product')
        ->click('@form-submit')
        ->assertSee('The Product field is required.')
        ->assertNoSmoke();
});

it('renders the table layout with a shared header and round-trips a typed payload', function (): void {
    $page = $this->visitAsWorkbenchUser('/form/fields/builder?type=table');

    $page->assertSee('Line items')->assertNoSmoke()
        ->assertSee('Product')->assertSee('Qty')->assertSee('Price')
        ->assertPresent('[aria-label="Resize Qty"]');

    $page->click('[id="table-panel"] [data-test="builder-add"]')->click('@builder-add-product')
        ->fill('input[name="rows[0][product]"]', 'SKU-9')
        ->fill('input[name="rows[0][qty]"]', '4')
        ->fill('input[name="rows[0][price]"]', '2.50')
        ->click('[id="table-panel"] [data-test="builder-add"]')->click('@builder-add-text')
        ->fill('textarea[name="rows[1][content]"]', 'Note row')
        ->assertNoJavaScriptErrors();

    $page->click('@form-submit')
        ->assertSee('Builder')
        ->assertNoSmoke();
});

it('reveals a reset control for custom row-table column widths and clears them on click', function (): void {
    $page = $this->visitAsWorkbenchUser('/form/fields/builder?type=table');
    $page->resize(1280, 800);

    $page->script(<<<'JS_WRAP'
        () => window.localStorage.setItem('lattice:table-columns:form:rows', JSON.stringify({
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
        "() => window.localStorage.getItem('lattice:table-columns:form:rows')",
    ))->toBeNull();

    $page->assertNoSmoke();
});
