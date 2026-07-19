<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Orchestra\Testbench\Factories\UserFactory;
use Pest\Browser\Api\AwaitableWebpage;
use Pest\Browser\Api\PendingAwaitablePage;
use Pest\Browser\Api\Webpage;
use Workbench\App\Models\User;

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

function seedNamedWorkbenchUsers(): void
{
    User::query()->delete();

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
