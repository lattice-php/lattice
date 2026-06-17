<?php

declare(strict_types=1);

use Workbench\App\Events\OrderShipped;

/**
 * Retry a browser assertion that fails fast (the plugin's assertSee does not
 * poll), sleeping between attempts so the websocket has time to connect and the
 * broadcast to arrive.
 *
 * @param  Closure(): void  $assert
 * @param  (Closure(): void)|null  $between
 */
function retryUntil(Closure $assert, int $attempts, int $sleepMicroseconds, ?Closure $between = null): void
{
    foreach (range(1, $attempts) as $attempt) {
        try {
            $assert();

            return;
        } catch (Throwable $exception) {
            if ($attempt === $attempts) {
                throw $exception;
            }

            if ($between !== null) {
                $between();
            }

            usleep($sleepMicroseconds);
        }
    }
}

it('delivers a broadcast to the browser and shows a toast', function (): void {
    $this->actingAs(workbenchTestUser());

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
});
