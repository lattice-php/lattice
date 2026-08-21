<?php

declare(strict_types=1);

it('renders the sample document with toolbar, canvas, and text layer', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/pdf')
        ->assertSee('PDF viewer');

    assertPresentEventually($page, '[data-test="pdf-page"] canvas');
    assertSeeEventually($page, 'of 5');
    assertSeeEventually($page, 'The quick brown fox jumps over the lazy dog,');

    $page->assertNoSmoke();
});

it('mounts far pages with their tables and images through the jump input', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/pdf');

    assertPresentEventually($page, '[data-test="pdf-page"] canvas');

    $page->fill('[aria-label="Go to page"]', '4')->keys('[aria-label="Go to page"]', ['Enter']);

    assertSeeEventually($page, 'Unit price');
    assertSeeEventually($page, 'Figure 1. A generated RGB gradient.');

    $page->assertNoSmoke();
});

it('opens a viewer in a modal through a server action and searches inside it', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/pdf');

    assertPresentEventually($page, '[data-test="pdf-page"] canvas');

    $page->click('button:has-text("Open in modal")');

    assertSeeEventually($page, 'Sample document');
    assertPresentEventually($page, '[data-test="modal-sample"] [data-test="pdf-page"] canvas');

    $page->fill('[data-test="modal-sample"] [aria-label="Search document…"]', 'quick');

    retryUntil(function () use ($page): void {
        expect($page->script('document.querySelector(\'[data-test="modal-sample"] [data-test="pdf-match-count"]\')?.textContent ?? ""'))
            ->toBe('1 of 5');
    });

    $page->assertNoSmoke();
});

it('navigates through sidebar thumbnails and lists the embedded attachment', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/pdf');

    assertPresentEventually($page, '[data-test="pdf-page"] canvas');

    $page->click('[data-test="sample"] [aria-label="Toggle sidebar"]');

    retryUntil(function () use ($page): void {
        expect((int) $page->script('document.querySelectorAll(\'[data-test="sample"] [data-test="pdf-thumbnail"]\').length'))
            ->toBe(5);
    });

    $page->click('[data-test="sample"] [data-test="pdf-thumbnail"][data-page="3"]');

    retryUntil(function () use ($page): void {
        expect($page->script('document.querySelector(\'[data-test="sample"] [aria-label="Go to page"]\')?.value ?? ""'))
            ->toBe('3');
    });

    $page->click('[data-test="sample"] [role="radio"]:has-text("Attachments")');

    assertSeeEventually($page, 'invoice-data.csv');

    $page->assertNoSmoke();
});

it('searches across pages and scrolls matches inside the viewer only', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/pdf');

    assertPresentEventually($page, '[data-test="pdf-page"] canvas');

    $page->fill('[aria-label="Search document…"]', 'quick');

    retryUntil(function () use ($page): void {
        expect($page->script('document.querySelector(\'[data-test="pdf-match-count"]\')?.textContent ?? ""'))
            ->toBe('1 of 5');
    });

    $page->click('[aria-label="Next match"]');
    $page->click('[aria-label="Next match"]');

    retryUntil(function () use ($page): void {
        expect($page->script('document.querySelector(\'[data-test="pdf-match-count"]\')?.textContent ?? ""'))
            ->toBe('3 of 5');
    });

    retryUntil(function () use ($page): void {
        expect((int) $page->script('document.querySelector(".lt-pdf-scroll").scrollTop'))->toBeGreaterThan(0);
        expect((int) $page->script('window.scrollY'))->toBe(0);
        expect((float) $page->script('document.querySelector(".lt-pdf-toolbar").getBoundingClientRect().top'))
            ->toBeGreaterThanOrEqual(0);
    });

    $page->assertNoSmoke();
});
