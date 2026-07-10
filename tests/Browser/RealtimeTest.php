<?php

declare(strict_types=1);

use Workbench\App\Events\OrderShipped;

it('delivers a broadcast to the browser and shows a toast', function (): void {
    $this->actingAs(workbenchTestUser());
    $this->bootReverb();

    $page = visit('/realtime');

    retryUntil(
        function () use ($page): void {
            expect($page->text('[data-test="echo-status"]'))->toBe('connected');
        },
        attempts: 50,
        sleepMicroseconds: 200_000,
    );

    retryUntil(
        function () use ($page): void {
            $page->assertSee('Order shipped');
        },
        attempts: 20,
        sleepMicroseconds: 300_000,
        between: function (): void {
            OrderShipped::dispatch(7);
        },
    );

    $page->assertNoJavaScriptErrors();
});
