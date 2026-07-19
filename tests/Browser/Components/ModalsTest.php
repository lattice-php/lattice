<?php
declare(strict_types=1);

it('opens the centered dialog and closes it again', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/modals')
        ->assertDontSee('Centered dialog')
        ->click('[data-test="open-centered"]');

    retryUntil(function () use ($page): void {
        $page->assertSee('Centered dialog');
    });

    $page->click('[data-test="dialog-close"]');

    retryUntil(function () use ($page): void {
        $page->assertDontSee('Centered dialog');
    });

    $page->assertNoJavaScriptErrors();
});

it('docks the end sheet to the trailing viewport edge at full height', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/modals')->click('[data-test="open-end-sheet"]');

    retryUntil(function () use ($page): void {
        $page->assertSee('End sheet');
    });

    retryUntil(function () use ($page): void {
        $metrics = $page->script(<<<'JS'
            () => {
                const rect = document.querySelector('[data-slot="dialog-content"]').getBoundingClientRect();
                return {
                    rightGap: Math.round(window.innerWidth - rect.right),
                    top: Math.round(rect.top),
                    height: Math.round(rect.height),
                    viewport: window.innerHeight,
                };
            }
        JS);

        expect($metrics['rightGap'])->toBe(0)
            ->and($metrics['top'])->toBe(0)
            ->and($metrics['height'])->toBe($metrics['viewport']);
    });

    $page->assertNoJavaScriptErrors();
});

it('docks the start sheet to the leading viewport edge', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/modals')->click('[data-test="open-start-sheet"]');

    retryUntil(function () use ($page): void {
        $page->assertSee('Start sheet');
    });

    retryUntil(function () use ($page): void {
        $left = $page->script(<<<'JS'
            () => Math.round(document.querySelector('[data-slot="dialog-content"]').getBoundingClientRect().left)
        JS);

        expect($left)->toBe(0);
    });

    $page->assertNoJavaScriptErrors();
});

it('closes a sheet with Escape', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/modals')->click('[data-test="open-end-sheet"]');

    retryUntil(function () use ($page): void {
        $page->assertSee('End sheet');
    });

    $page->keys('[data-slot="dialog-content"]', ['Escape']);

    retryUntil(function () use ($page): void {
        $page->assertNotPresent('[data-slot="dialog-content"]');
    });

    $page->assertNoJavaScriptErrors();
});

it('opens the feedback action form as an end sheet', function (): void {
    $page = $this->visitAsWorkbenchUser('/components/modals')->click('[data-test="action-submit-feedback"]');

    retryUntil(function () use ($page): void {
        $page->assertSee('Message');
    });

    retryUntil(function () use ($page): void {
        $rightGap = $page->script(<<<'JS'
            () => Math.round(window.innerWidth - document.querySelector('[data-slot="dialog-content"]').getBoundingClientRect().right)
        JS);

        expect($rightGap)->toBe(0);
    });

    $page->assertNoJavaScriptErrors();
});
