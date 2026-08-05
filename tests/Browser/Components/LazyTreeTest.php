<?php
declare(strict_types=1);

it('fetches and reveals children when an unloaded node expands', function (): void {
    $electronics = seedLazyCategories();

    $page = $this->visitAsWorkbenchUser('/tree-lazy')
        ->assertSee('Electronics')
        ->assertNotPresent('[data-test="tree-node-'.categoryId('Laptops').'"]')
        ->click('[data-test="tree-node-'.$electronics->getKey().'-toggle"]');

    assertPresentEventually($page, '[data-test="tree-node-'.categoryId('Laptops').'"]');

    $page
        ->assertAriaAttribute('[data-test="tree-node-'.$electronics->getKey().'"]', 'expanded', 'true')
        ->assertNoJavaScriptErrors();
});

it('fetches on ArrowRight and moves focus into the loaded child on the second press', function (): void {
    $electronics = seedLazyCategories();
    $electronicsNode = '[data-test="tree-node-'.$electronics->getKey().'"]';
    $laptopsNode = '[data-test="tree-node-'.categoryId('Laptops').'"]';

    $page = $this->visitAsWorkbenchUser('/tree-lazy')
        ->keys($electronicsNode, ['ArrowRight']);

    assertPresentEventually($page, $laptopsNode);

    $page->keys($electronicsNode, ['ArrowRight']);

    retryUntil(function () use ($page, $laptopsNode): void {
        $page->assertAttribute($laptopsNode, 'tabindex', '0');
    });

    $page->assertNoJavaScriptErrors();
});

it('reveals an active node from its URL id through unloaded ancestors', function (): void {
    seedLazyCategories();
    $electronicsId = categoryId('Electronics');
    $laptopsId = categoryId('Laptops');
    $targetId = categoryId('Ultrabooks');
    $targetNode = '[data-test="tree-node-'.$targetId.'"]';

    $page = $this->visitAsWorkbenchUser('/tree-lazy?category='.$targetId);

    assertPresentEventually($page, $targetNode);

    retryUntil(function () use ($page, $targetNode): void {
        $page
            ->assertAriaAttribute($targetNode, 'selected', 'true')
            ->assertAttribute($targetNode, 'tabindex', '0');
    });

    $page
        ->assertAriaAttribute('[data-test="tree-node-'.$electronicsId.'"]', 'expanded', 'true')
        ->assertAriaAttribute('[data-test="tree-node-'.$laptopsId.'"]', 'expanded', 'true')
        ->assertNoJavaScriptErrors();
});

it('loads defaultExpanded nodes beyond the eager depth on mount', function (): void {
    seedLazyCategories();

    $page = $this->visitAsWorkbenchUser('/tree-lazy-expanded');

    assertPresentEventually($page, '[data-test="tree-node-'.categoryId('Laptops').'"]');

    $page->assertNoJavaScriptErrors();
});

it('restores remembered expansion after a reload by refetching', function (): void {
    seedLazyCategories();
    $clothingId = categoryId('Clothing');
    $menNode = '[data-test="tree-node-'.categoryId('Men').'"]';

    $page = $this->visitAsWorkbenchUser('/tree-lazy-expanded')
        ->click('[data-test="tree-node-'.$clothingId.'-toggle"]');

    assertPresentEventually($page, $menNode);

    $page->navigate('/tree-lazy-expanded');

    assertPresentEventually($page, $menNode);

    $page->assertNoJavaScriptErrors();
});

it('refreshes the sealed ref before fetching children when it has expired', function (): void {
    $electronics = seedLazyCategories();
    $electronicsNode = '[data-test="tree-node-'.$electronics->getKey().'"]';
    $laptopsNode = '[data-test="tree-node-'.categoryId('Laptops').'"]';

    // visit() navigates lazily, on the first awaited interaction — the
    // assertion forces the page (and its sealed ref) to exist before the
    // clock moves, otherwise the ref would be minted with the traveled time.
    $page = $this->visitAsWorkbenchUser('/tree-lazy')->assertSee('Electronics');

    $this->travel((int) config('lattice.security.ref_lifetime', 30) + 1)->minutes();

    $page->click('[data-test="tree-node-'.$electronics->getKey().'-toggle"]');

    assertPresentEventually($page, $laptopsNode);

    $page
        ->assertAriaAttribute($electronicsNode, 'expanded', 'true')
        ->assertNoJavaScriptErrors();
});

it('keeps the node collapsed when the fetch is rejected', function (): void {
    $electronics = seedLazyCategories();
    $electronicsNode = '[data-test="tree-node-'.$electronics->getKey().'"]';

    $page = $this->visitAsWorkbenchUser('/tree-lazy');

    $page->script(<<<'JS'
        () => {
            const original = window.fetch;
            window.fetch = (input, init) =>
                String(input).includes('/lattice/trees/')
                    ? Promise.reject(new TypeError('injected network failure'))
                    : original(input, init);
        }
    JS);

    $page->click('[data-test="tree-node-'.$electronics->getKey().'-toggle"]');

    retryUntil(function () use ($page, $electronicsNode): void {
        $page->assertAriaAttribute($electronicsNode, 'expanded', 'false');
    });

    $page->assertNotPresent('[data-test="tree-node-'.categoryId('Laptops').'"]');
});

it('fetches the roots for a lazy skeleton page', function (): void {
    seedLazyCategories();

    $page = $this->visitAsWorkbenchUser('/tree-lazy-skeleton');

    assertSeeEventually($page, 'Electronics');

    $page
        ->assertSee('Books')
        ->assertSee('Clothing')
        ->assertAttribute('[data-test="tree-node-'.categoryId('Books').'"]', 'tabindex', '0')
        ->assertNoJavaScriptErrors();
});
