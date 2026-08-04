<?php
declare(strict_types=1);

use Pest\Browser\Api\AwaitableWebpage;
use Pest\Browser\Api\PendingAwaitablePage;
use Pest\Browser\Api\Webpage;

/**
 * Retries browser assertions while asynchronous UI work settles.
 *
 * @param  Closure(): void  $assert
 * @param  (Closure(): void)|null  $between
 */
function retryUntil(Closure $assert, int $attempts = 20, int $sleepMicroseconds = 500_000, ?Closure $between = null): void
{
    foreach (range(1, $attempts) as $attempt) {
        try {
            $assert();

            return;
        } catch (Throwable $exception) {
            if ($attempt === $attempts) {
                throw $exception;
            }

            $between?->__invoke();

            usleep($sleepMicroseconds);
        }
    }
}

function assertSeeEventually(AwaitableWebpage|PendingAwaitablePage|Webpage $page, string|int|float $text): void
{
    retryUntil(function () use ($page, $text): void {
        $page->assertSee($text);
    });
}

function assertDontSeeEventually(AwaitableWebpage|PendingAwaitablePage|Webpage $page, string|int|float $text): void
{
    retryUntil(function () use ($page, $text): void {
        $page->assertDontSee($text);
    });
}

function assertPresentEventually(AwaitableWebpage|PendingAwaitablePage|Webpage $page, string $selector): void
{
    retryUntil(function () use ($page, $selector): void {
        $page->assertPresent($selector);
    });
}
