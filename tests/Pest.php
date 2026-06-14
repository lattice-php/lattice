<?php
declare(strict_types=1);

use Illuminate\Foundation\Auth\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\ParallelTesting;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Tests\TestCase;
use Orchestra\Testbench\Factories\UserFactory;

use function Pest\Laravel\getJson;

uses(TestCase::class)->in(__DIR__);
uses(RefreshDatabase::class)->in(__DIR__);

/**
 * Point discovery at the test fixtures and rebuild the manifest so the
 * registries resolve the attributed classes under tests/Fixtures/Discovery.
 */
function discoverFixtures(): void
{
    config(['lattice.discover' => [
        __DIR__.'/Fixtures/Discovery',
    ]]);

    app(DiscoveryManifest::class)->clear();
}

/**
 * Seed a deterministic set of workbench users for browser table tests: four
 * named users plus 26 generated ones, enough to exercise pagination and
 * infinite scroll.
 */
function seedWorkbenchUsers(): void
{
    User::query()->delete();

    foreach (['Maya Chen', 'Ada Lovelace', 'Grace Hopper', 'Katherine Johnson'] as $name) {
        UserFactory::new()->create([
            'name' => $name,
            'email' => strtolower(explode(' ', $name)[0]).'@example.com',
        ]);
    }

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
    return UserFactory::new()->create([
        'name' => 'Authenticated Workbench User',
        'email' => 'workbench-test-'.Str::random(12).'@example.com',
        'locale' => 'en',
        ...$attributes,
    ]);
}

/**
 * Serialize a wire object (or array of them) the way the HTTP response does,
 * so tests can assert against the JSON payload without a toArray() shortcut.
 *
 * @return array<array-key, mixed>
 */
function wire(mixed $value): array
{
    return json_decode(json_encode($value, JSON_THROW_ON_ERROR), true);
}

/**
 * Absolute path to a shared fixture under tests/Fixtures, independent of where
 * the calling test lives.
 */
function fixturePath(string $name): string
{
    return __DIR__.'/Fixtures/'.$name;
}

/**
 * @template TReturn
 *
 * @param  Closure(string): TReturn  $callback
 * @return TReturn
 */
function withScaffoldWorkspace(Closure $callback): mixed
{
    $token = ParallelTesting::token() ?: 'default';
    $basePath = sys_get_temp_dir().'/lattice-package-tests/scaffold/test_'.$token;
    $originalBasePath = app()->basePath();
    $originalAppPath = app()->path();
    $originalDiscover = config('lattice.discover');
    $originalTypescriptOutput = config('lattice.typescript.output');

    try {
        File::deleteDirectory($basePath);
        app()->setBasePath($basePath);
        app()->useAppPath($basePath.'/app');

        config()->set('lattice.discover', [$basePath.'/app']);
        config()->set('lattice.typescript.output', $basePath.'/resources/js/lattice/generated.d.ts');

        File::ensureDirectoryExists($basePath.'/app');
        File::ensureDirectoryExists($basePath.'/resources/js/lattice');

        return $callback($basePath);
    } finally {
        app()->setBasePath($originalBasePath);
        app()->useAppPath($originalAppPath);

        config()->set('lattice.discover', $originalDiscover);
        config()->set('lattice.typescript.output', $originalTypescriptOutput);

        File::deleteDirectory($basePath);
    }
}

/**
 * Extract the signed ref from a serialized interactive component.
 *
 * @param  array<string, mixed>  $component
 */
function componentRef(array $component): string
{
    $props = $component['props'] ?? [];
    $ref = is_array($props) ? ($props['ref'] ?? null) : null;

    if (! is_string($ref)) {
        throw new RuntimeException('Lattice component ref is missing.');
    }

    expect($ref)->not->toBe('');

    return $ref;
}

/**
 * @return array<string, string>
 */
function latticeHeaders(string $ref): array
{
    return ['X-Lattice-Ref' => $ref];
}

/**
 * Perform a JSON GET request with a Lattice component ref header.
 *
 * @return TestResponse<JsonResponse>
 */
function latticeGet(string $url, string $ref): TestResponse
{
    return getJson($url, latticeHeaders($ref));
}

/**
 * Dump an array of nodes to docs/fixtures/<key>.json so the docs site can render
 * a real, test-generated example instead of hand-maintained JSON.
 *
 * Object keys are sorted so the output is identical across PHP versions, keeping
 * the committed fixtures stable for the CI guard. List order (nodes, options,
 * conditions) is preserved.
 *
 * @param  array<int, mixed>  $nodes
 */
function dumpFixture(string $key, array $nodes): void
{
    $normalized = wire($nodes);

    file_put_contents(
        dirname(__DIR__).'/docs/fixtures/'.$key.'.json',
        json_encode(sortFixtureKeys(stripFixtureRefs($normalized)), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)."\n",
    );
}

/**
 * Drop the signed `ref` an interactive component (Form, Table, …) seals into its
 * props. The ref is encrypted with a random IV and a time-based expiry, so it
 * differs every run; a committed fixture must stay stable, and the static docs
 * preview never calls an endpoint, so the ref is unused there.
 */
function stripFixtureRefs(mixed $value): mixed
{
    if (! is_array($value)) {
        return $value;
    }

    unset($value['ref']);

    return array_map('stripFixtureRefs', $value);
}

function sortFixtureKeys(mixed $value): mixed
{
    if (! is_array($value)) {
        return $value;
    }

    if (! array_is_list($value)) {
        ksort($value);
    }

    return array_map('sortFixtureKeys', $value);
}
