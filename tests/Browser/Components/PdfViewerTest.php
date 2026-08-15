<?php

declare(strict_types=1);

it('renders the sample document with toolbar, canvas, and text layer', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/pdf')
        ->assertSee('PDF viewer');

    assertPresentEventually($page, '[data-test="pdf-page"] canvas');
    assertSeeEventually($page, 'of 2');
    assertSeeEventually($page, 'The quick brown fox jumps over the lazy dog.');

    $page->assertNoSmoke();
});

it('finds and counts matches across pages through the toolbar search', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/pdf');

    assertPresentEventually($page, '[data-test="pdf-page"] canvas');

    $page->fill('[aria-label="Search document…"]', 'quick');

    assertSeeEventually($page, '1 of 3');
    assertPresentEventually($page, 'mark.lt-pdf-match--current');

    $page->click('[aria-label="Next match"]');

    assertSeeEventually($page, '2 of 3');

    $page->assertNoSmoke();
});
