<?php
declare(strict_types=1);

it('renders the tree demo with categories, active state, and row actions', function (): void {
    $this->visitAsWorkbenchUser('/components/tree')
        ->assertSee('Electronics')
        ->assertSee('Laptops')
        ->assertSee('Phones')
        ->assertSee('Clothing')
        ->assertSee('Documents')
        ->assertSee('Furniture')
        ->assertSee('Groceries')
        ->assertSee('Automotive')
        ->assertSee('Help')
        ->assertNotPresent('[data-test="tree-node-clothing-men"]')
        ->assertAriaAttribute('[data-test="tree-node-electronics-phones"]', 'selected', 'true')
        ->click('[data-test="tree-documents-actions"]')
        ->assertPresent('[data-test="action-tree-documents-rename"]')
        ->assertPresent('[data-test="action-tree-documents-archive"]')
        ->assertSee('Rename')
        ->assertSee('Archive')
        ->assertNoJavaScriptErrors();
});

it('expands a collapsed subtree and reveals its children when the chevron is clicked', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/tree')
        ->assertNotPresent('[data-test="tree-node-clothing-men"]')
        ->click('[data-test="tree-node-clothing-toggle"]');

    assertPresentEventually($page, '[data-test="tree-node-clothing-men"]');

    $page
        ->assertSee('Men')
        ->assertSee('Women')
        ->assertAriaAttribute('[data-test="tree-node-clothing"]', 'expanded', 'true')
        ->assertNoJavaScriptErrors();
});

it('moves focus with ArrowDown and expands a node with ArrowRight', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/tree')
        ->keys('[data-test="tree-node-electronics"]', ['ArrowDown']);

    retryUntil(function () use ($page): void {
        $page->assertAttribute('[data-test="tree-node-electronics-laptops"]', 'tabindex', '0');
    });

    $page
        ->assertAttribute('[data-test="tree-node-electronics"]', 'tabindex', '-1')
        ->assertNotPresent('[data-test="tree-node-clothing-men"]')
        ->keys('[data-test="tree-node-clothing"]', ['ArrowRight']);

    assertPresentEventually($page, '[data-test="tree-node-clothing-men"]');

    $page->assertNoJavaScriptErrors();
});

it('navigates when an href node link is clicked', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/tree')
        ->click('[data-test="tree-node-clothing-toggle"]');

    assertPresentEventually($page, '[data-test="tree-node-clothing-women"]');

    $page
        ->assertAttribute('[data-test="tree-node-clothing-women"] a', 'href', '/components/containers')
        ->click('[data-test="tree-node-clothing-women"] a');

    retryUntil(function () use ($page): void {
        $page->assertPathIs('/components/containers');
    });

    $page
        ->assertSee('Team settings')
        ->assertNoJavaScriptErrors();
});

it('keeps row action controls out of the page tab order so Tab exits the tree cleanly', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/tree')
        ->assertAttribute('[data-test="tree-documents-actions"]', 'tabindex', '-1')
        ->keys('[data-test="tree-node-electronics"]', ['Tab']);

    $focusedInsideTree = $page->script(<<<'JS'
        () => document.activeElement != null && document.activeElement.closest('[role="tree"]') != null
    JS);

    expect($focusedInsideTree)->toBeFalsy();

    $page->assertNoJavaScriptErrors();
});

it('opens the info modal with Enter on the modal-action node and returns focus on close', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/tree')
        ->keys('[data-test="tree-node-electronics"]', ['End']);

    retryUntil(function () use ($page): void {
        $page->assertAttribute('[data-test="tree-node-help"]', 'tabindex', '0');
    });

    $page->keys('[data-test="tree-node-help"]', ['Enter']);

    assertSeeEventually($page, 'Keyboard navigation');

    $page
        ->assertSee('Arrow keys move focus between rows')
        ->click('[data-test="dialog-close"]');

    assertDontSeeEventually($page, 'Keyboard navigation');

    retryUntil(function () use ($page): void {
        $focusedTestId = $page->script(<<<'JS'
            () => document.activeElement?.getAttribute('data-test') ?? null
        JS);

        expect($focusedTestId)->toBe('tree-node-help');
    });

    $page->assertNoJavaScriptErrors();
});
