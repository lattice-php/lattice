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
 * @param  array<int, mixed>  $nodes
 */
function dumpFixture(string $key, array $nodes): void
{
    $path = dirname(__DIR__).'/docs/fixtures/'.$key.'.json';

    file_put_contents(
        $path,
        json_encode($nodes, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)."\n",
    );
}
