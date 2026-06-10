<?php

declare(strict_types=1);

use Illuminate\Foundation\Testing\RefreshDatabase;
use Lattice\Lattice\Tests\TestCase;

uses(TestCase::class)->in(__DIR__);
uses(RefreshDatabase::class)->in(__DIR__);

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
        json_encode(sortFixtureKeys($normalized), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)."\n",
    );
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
