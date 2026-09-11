<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Orchestra\Testbench\Factories\UserFactory;
use Pest\Browser\Api\AwaitableWebpage;
use Pest\Browser\Api\PendingAwaitablePage;
use Pest\Browser\Api\Webpage;
use Workbench\App\Models\Product;
use Workbench\App\Models\User;

use function Amp\delay;

/**
 * Retries browser assertions while asynchronous UI work settles.
 *
 * The test server is an amphp server sharing this PHP process, so it only
 * serves requests while the event loop runs. Sleeping with usleep() would block
 * it: a retry that asserts on the database alone (never touching the page)
 * would starve the very request it waits for. Amp\delay() suspends
 * cooperatively instead, letting the pending request through.
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

            delay($sleepMicroseconds / 1_000_000);
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

function stubSuccessfulClipboard(AwaitableWebpage|PendingAwaitablePage|Webpage $page): void
{
    $page->script('Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => {} } })');
}

/**
 * The infinite tab's IntersectionObserver auto-fires loadMore() when the
 * sentinel enters its 240px root margin — which can happen before the first
 * page paints under CI load, unmounting the "Load more" button mid-test.
 * use-table bails when the API is undefined, pinning these tests to the
 * manual load path.
 */
function disableInfiniteScrollAutoLoad(PendingAwaitablePage $page): void
{
    $page->script('window.IntersectionObserver = undefined');
}

function rustfsIsReachable(): bool
{
    $key = 'lattice-test-probes/'.Str::uuid().'.txt';

    try {
        $disk = Storage::disk('s3');

        if ($disk->put($key, 'ok') !== true) {
            return false;
        }

        $disk->delete($key);

        return true;
    } catch (Throwable) {
        return false;
    }
}

function deleteWorkbenchUsersExceptAuthenticated(): void
{
    $query = User::query();

    if (($authenticatedId = auth()->id()) !== null) {
        $query->whereKeyNot($authenticatedId);
    }

    $query->delete();
}

function seedNamedWorkbenchUsers(): void
{
    // Deleting the actingAs() user would only keep working through
    // SessionGuard's in-memory cache — preserve it instead.
    deleteWorkbenchUsersExceptAuthenticated();

    foreach (['Maya Chen', 'Ada Lovelace', 'Grace Hopper', 'Katherine Johnson'] as $name) {
        UserFactory::new()->create([
            'name' => $name,
            'email' => Str::lower(Str::before($name, ' ')).'@example.com',
        ]);
    }
}

function seedWorkbenchUsers(): void
{
    seedNamedWorkbenchUsers();

    foreach (range(1, 26) as $number) {
        UserFactory::new()->create([
            'name' => "Browser User {$number}",
            'email' => "browser-user-{$number}@example.com",
        ]);
    }
}

function deskLampProduct(): Product
{
    return Product::factory()->create(['name' => 'Desk Lamp', 'sku' => 'LAMP-1', 'status' => 'active']);
}

/**
 * @param  array<string, mixed>  $attributes
 */
function workbenchTestUser(array $attributes = []): User
{
    $user = UserFactory::new()->create([
        'name' => 'Authenticated Workbench User',
        'email' => 'workbench-test-'.Str::random(12).'@example.com',
        'locale' => 'en',
        ...$attributes,
    ]);

    if (! $user instanceof User) {
        throw new RuntimeException('Expected the workbench auth model to be an instance of '.User::class);
    }

    return $user;
}
