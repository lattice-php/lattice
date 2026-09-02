<?php
declare(strict_types=1);

it('adds a block from the library, saves the draft, and keeps it across a reload', function (): void {
    $page = pageWithDraft();

    $browser = $this->visitAsWorkbenchUser("/pages/{$page->getKey()}/edit")
        ->assertSee('Welcome');

    assertPresentEventually($browser, '[data-test="block-b_heading"]');

    $browser->click('[data-test="library-lattice.separator"]');

    assertPresentEventually($browser, '[data-block-type="lattice.separator"]');

    retryUntil(function () use ($page): void {
        expect($page->refresh()->revision)->toBe(2)
            ->and(collect(iterator_to_array($page->draft?->walk() ?? new ArrayIterator, false))->pluck('type')->all())->toContain('lattice.separator');
    }, attempts: 30);

    $browser->navigate("/pages/{$page->getKey()}/edit");

    assertPresentEventually($browser, '[data-block-type="lattice.separator"]');
    $browser->assertNoJavaScriptErrors();
});

it('edits a field in the inspector and shows the re-rendered block', function (): void {
    $page = pageWithDraft();

    $browser = $this->visitAsWorkbenchUser("/pages/{$page->getKey()}/edit");

    assertPresentEventually($browser, '[data-test="block-b_heading"]');
    $browser->click('[data-test="block-b_heading"]');
    assertPresentEventually($browser, '[data-test="blocks-inspector-tab-content"]');
    $browser->click('[data-test="blocks-inspector-tab-content"]');
    assertPresentEventually($browser, '[data-test="blocks-content-panel"] input[type="text"]');
    $browser->fill('[data-test="blocks-content-panel"] input[type="text"]', 'Hello again');

    assertSeeEventually($browser, 'Hello again');
    $browser->assertNoJavaScriptErrors();
});

it('publishes the draft to the published document', function (): void {
    $page = pageWithDraft();

    $browser = $this->visitAsWorkbenchUser("/pages/{$page->getKey()}/edit");

    assertPresentEventually($browser, '[data-test="blocks-publish"]');
    $browser->click('[data-test="blocks-publish"]');

    retryUntil(function () use ($page): void {
        expect($page->refresh()->published?->find('b_heading'))->not->toBeNull();
    });

    assertSeeEventually($browser, 'Published');

    $this->visitAsWorkbenchUser("/pages/{$page->getKey()}")->assertSee('Welcome')->assertSee('Left');
});
