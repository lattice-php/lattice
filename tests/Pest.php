<?php
declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\ParallelTesting;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Lattice\Lattice\Core\Contracts\OptionSource;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tests\BrowserTestCase;
use Lattice\Lattice\Tests\TestCase;
use Orchestra\Testbench\Factories\UserFactory;
use Workbench\App\Models\User;

use function Pest\Laravel\getJson;

uses(TestCase::class)->in('Feature', 'Unit');
uses(BrowserTestCase::class)->in('Browser');
uses(RefreshDatabase::class)->in(__DIR__);

/**
 * Retry a browser assertion that fails fast (the browser plugin's assertions do
 * not poll), sleeping between attempts so an async round-trip — a websocket
 * connecting, a broadcast arriving, a dependent field recomputing — has time to
 * settle. Returns as soon as the assertion passes; rethrows after the last attempt.
 *
 * @param  Closure(): void  $assert
 * @param  (Closure(): void)|null  $between
 */
function retryUntil(Closure $assert, int $attempts = 10, int $sleepMicroseconds = 100_000, ?Closure $between = null): void
{
    foreach (range(1, $attempts) as $attempt) {
        try {
            $assert();

            return;
        } catch (Throwable $exception) {
            if ($attempt === $attempts) {
                throw $exception;
            }

            if ($between instanceof Closure) {
                $between();
            }

            usleep($sleepMicroseconds);
        }
    }
}

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
 * Seed the four named workbench users browser table tests assert against. Kept
 * under one page so tables never auto-load a second page while the test
 * interacts with them.
 */
function seedNamedWorkbenchUsers(): void
{
    User::query()->delete();

    foreach (['Maya Chen', 'Ada Lovelace', 'Grace Hopper', 'Katherine Johnson'] as $name) {
        UserFactory::new()->create([
            'name' => $name,
            'email' => strtolower(explode(' ', $name)[0]).'@example.com',
        ]);
    }
}

/**
 * Seed a deterministic set of workbench users for browser table tests: four
 * named users plus 26 generated ones, enough to exercise pagination and
 * infinite scroll.
 */
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
 * The raw JSON a wire object encodes to, with no decode round-trip — the only
 * way to observe the `{}` vs `[]` distinction an assoc decode (see wire())
 * collapses.
 */
function wireJson(mixed $value): string
{
    return json_encode($value, JSON_THROW_ON_ERROR);
}

/**
 * An in-memory {@see OptionSource} for filter/select tests — substring search
 * over a `value => label` map, so tests never reach Eloquent.
 *
 * @param  array<int|string, string>  $people
 */
function inMemoryOptionSource(array $people): OptionSource
{
    return new class($people) implements OptionSource
    {
        /**
         * @param  array<int|string, string>  $people
         */
        public function __construct(private array $people) {}

        public function search(string $query): array
        {
            $matches = $query === ''
                ? $this->people
                : array_filter($this->people, fn (string $name): bool => str_contains(strtolower($name), strtolower($query)));

            return array_map(fn (string $name, int|string $id): Option => new Option($name, (string) $id), $matches, array_keys($matches));
        }

        public function selected(array $values): array
        {
            return array_map(fn (string $id): Option => new Option($this->people[$id] ?? $id, $id), $values);
        }
    };
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
 * The published single-registry scaffold the make commands append to.
 */
function latticeRegistryStub(): string
{
    return <<<'TS'
import { createPlugin, extendRegistry, registry as packageRegistry } from "@lattice-php/lattice";

export const registry = extendRegistry(
  packageRegistry,
  createPlugin({
    name: "app",
    components: {},
    columns: {},
  }),
);

TS;
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
 * Materializes object-preserving (Wire::toWire(), not the assoc wire()) so an
 * empty map reaches the fixture as `{}` rather than collapsing to `[]`.
 *
 * @param  array<int, mixed>  $nodes
 */
function dumpFixture(string $key, array $nodes): void
{
    $normalized = Wire::toWire($nodes);

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
 *
 * Recurses over stdClass (a wire map, see Wire::toWire()) as well as arrays;
 * list order is untouched either way.
 */
function stripFixtureRefs(mixed $value): mixed
{
    if ($value instanceof stdClass) {
        $properties = (array) $value;
        unset($properties['ref']);

        return (object) array_map(stripFixtureRefs(...), $properties);
    }

    if (! is_array($value)) {
        return $value;
    }

    unset($value['ref']);

    return array_map(stripFixtureRefs(...), $value);
}

function sortFixtureKeys(mixed $value): mixed
{
    if ($value instanceof stdClass) {
        $properties = (array) $value;
        ksort($properties);

        return (object) array_map(sortFixtureKeys(...), $properties);
    }

    if (! is_array($value)) {
        return $value;
    }

    if (! array_is_list($value)) {
        ksort($value);
    }

    return array_map(sortFixtureKeys(...), $value);
}
