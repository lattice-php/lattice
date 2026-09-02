<?php
declare(strict_types=1);

use Lattice\Blocks\BlockDocument;
use Lattice\Blocks\BlockNode;

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

it('edits an unbound field in the inspector and shows the re-rendered block', function (): void {
    $page = pageWithDraft(new BlockDocument([
        BlockNode::make('workbench.cta', ['title' => 'Ready?', 'button_label' => 'Go'], id: 'b_cta'),
    ]));

    $browser = $this->visitAsWorkbenchUser("/pages/{$page->getKey()}/edit");

    assertPresentEventually($browser, '[data-test="block-b_cta"]');
    $browser->click('[data-test="block-b_cta"]');
    assertPresentEventually($browser, '[data-test="blocks-inspector-tab-content"]');
    $browser->click('[data-test="blocks-inspector-tab-content"]');
    assertPresentEventually($browser, '[data-test="blocks-content-panel"] [data-test="title"]');
    $browser->fill('[data-test="blocks-content-panel"] [data-test="title"]', 'Hello again');

    assertSeeEventually($browser, 'Hello again');
    $browser->assertNoJavaScriptErrors();
});

it('types into a heading inline, autosaves the draft, and keeps the text across a reload', function (): void {
    $page = pageWithDraft();

    $browser = $this->visitAsWorkbenchUser("/pages/{$page->getKey()}/edit");

    assertPresentEventually($browser, '[data-test="inline-b_heading-text"]');
    $browser->click('[data-test="inline-b_heading-text"]');
    $browser->type('[data-test="inline-b_heading-text"]', 'Welcome aboard');

    assertSeeEventually($browser, 'Welcome aboard');

    retryUntil(function () use ($page): void {
        expect($page->refresh()->draft?->find('b_heading')?->data['text'] ?? null)->toBe('Welcome aboard');
    }, attempts: 30);

    $browser->navigate("/pages/{$page->getKey()}/edit");

    assertSeeEventually($browser, 'Welcome aboard');
    $browser->assertNoJavaScriptErrors();
});

it('opens the slash menu inside a paragraph and inserts the picked block', function (): void {
    $page = pageWithDraft(new BlockDocument([
        BlockNode::make('lattice.paragraph', id: 'b_intro'),
    ]));

    $browser = $this->visitAsWorkbenchUser("/pages/{$page->getKey()}/edit");

    assertPresentEventually($browser, '[data-test="inline-b_intro-content"]');
    $browser->click('[data-test="inline-b_intro-content"]');
    $browser->keys('[data-test="inline-b_intro-content"]', '/');
    assertPresentEventually($browser, '[data-test="editor-block-menu"]');
    $browser->click('[data-test="editor-block-lattice.quote"]');

    assertPresentEventually($browser, '[data-block-type="lattice.quote"]');
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
