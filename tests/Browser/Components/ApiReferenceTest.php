<?php
declare(strict_types=1);

it('executes API requests from the workbench origin', function (): void {
    $this->visitAsWorkbenchUser('/api-reference')
        ->assertSee('/api')
        ->click('button:has-text("Execute")')
        ->assertSee('200 OK')
        ->assertNoJavaScriptErrors();
});

it('selects and sends an available pagination mode', function (): void {
    $paginationSelector = 'select[data-field-key="header:x-pagination"]';
    $pageSelector = 'input[data-field-key="query:page"]';
    $cursorSelector = 'input[data-field-key="query:cursor"]';
    $perPageSelector = 'input[data-field-key="query:per_page"]';

    $this->visitAsWorkbenchUser('/api-reference')
        ->click('button[aria-label="users.index"]')
        ->assertSelected($paginationSelector, 'default')
        ->assertPresent($pageSelector)
        ->assertMissing($cursorSelector)
        ->assertPresent($perPageSelector)
        ->select($paginationSelector, 'cursor')
        ->assertMissing($pageSelector)
        ->assertPresent($cursorSelector)
        ->assertPresent($perPageSelector)
        ->assertSee('x-pagination: cursor')
        ->click('button:has-text("Execute")')
        ->assertSee('received_pagination_mode')
        ->assertSee('cursor')
        ->assertNoJavaScriptErrors();
});
