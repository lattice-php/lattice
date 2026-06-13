<?php
declare(strict_types=1);

use Illuminate\Foundation\Auth\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Lattice\Lattice\Tests\TestCase;
use Orchestra\Testbench\Factories\UserFactory;

uses(TestCase::class)->in(__DIR__);
uses(RefreshDatabase::class)->in(__DIR__);

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
    $normalized = json_decode(json_encode($nodes, JSON_THROW_ON_ERROR), true);

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
