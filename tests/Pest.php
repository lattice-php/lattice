<?php
declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\ParallelTesting;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Lattice\Lattice\Core\Contracts\OptionSource;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\Form;
use Lattice\Lattice\Forms\Components\RowsField;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Tables\Components\Table;
use Lattice\Lattice\Tests\BrowserTestCase;
use Lattice\Lattice\Tests\TestCase;
use Orchestra\Testbench\Factories\UserFactory;
use Pest\Browser\Api\AwaitableWebpage;
use Pest\Browser\Api\PendingAwaitablePage;
use Pest\Browser\Api\Webpage;
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

            if ($between instanceof Closure) {
                $between();
            }

            usleep($sleepMicroseconds);
        }
    }
}

function eventually(Closure $assert, int $attempts = 20, int $sleepMicroseconds = 500_000, ?Closure $between = null): void
{
    retryUntil($assert, $attempts, $sleepMicroseconds, $between);
}

/**
 * Poll {@see eventually()} until the text is present on the page. The polled
 * closure must be a statement body — an arrow closure returns the page rather
 * than void and breaks the `Closure(): void` contract.
 */
function assertSeeEventually(AwaitableWebpage|PendingAwaitablePage|Webpage $page, string|int|float $text): void
{
    eventually(function () use ($page, $text): void {
        $page->assertSee($text);
    });
}

function assertDontSeeEventually(AwaitableWebpage|PendingAwaitablePage|Webpage $page, string|int|float $text): void
{
    eventually(function () use ($page, $text): void {
        $page->assertDontSee($text);
    });
}

function assertPresentEventually(AwaitableWebpage|PendingAwaitablePage|Webpage $page, string $selector): void
{
    eventually(function () use ($page, $selector): void {
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
    $basePath = sys_get_temp_dir().'/lattice-package-tests/'.basename(dirname(__DIR__)).'/scaffold/test_'.$token;
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
 * Strip the minted per-row uuids so row assertions stay about the payloads.
 *
 * @param  array<int|string, mixed>  $rows
 * @return array<int|string, mixed>
 */
function withoutRowIds(array $rows): array
{
    unset($rows[RowsField::ROW_ID]);

    return array_map(
        static fn (mixed $value): mixed => is_array($value) ? withoutRowIds($value) : $value,
        $rows,
    );
}

/**
 * @return TestResponse<JsonResponse>
 */
function latticeGet(string $url, string $ref): TestResponse
{
    return getJson($url, latticeHeaders($ref));
}

/**
 * Guard a docs/fixtures/<key>.json file against the payload its test builds, so
 * the docs site renders real, test-generated examples instead of hand-maintained
 * JSON. Regenerate deliberately with LATTICE_UPDATE_FIXTURES=1 — the assertion
 * still runs, so a nondeterministic payload fails immediately.
 *
 * Build payloads with sortFixtureKeys(stripFixtureRefs(Wire::toWire([...]))) —
 * sorted keys keep the output identical across PHP versions, and the
 * object-preserving Wire::toWire() keeps an empty map as `{}` rather than `[]`.
 */
function assertFixtureMatches(string $fixtureKey, mixed $payload): void
{
    $path = dirname(__DIR__).'/docs/fixtures/'.$fixtureKey.'.json';
    $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

    if (getenv('LATTICE_UPDATE_FIXTURES') !== false) {
        File::put($path, $json.PHP_EOL);
    }

    expect(File::exists($path))->toBeTrue("Missing fixture: {$path}");
    expect(File::get($path))->toBe($json.PHP_EOL);
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
