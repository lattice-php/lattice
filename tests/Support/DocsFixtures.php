<?php

declare(strict_types=1);

use Illuminate\Support\Facades\File;

/** Set LATTICE_UPDATE_FIXTURES to regenerate committed docs payloads. */
function assertFixtureMatches(string $fixtureKey, mixed $payload): void
{
    $path = dirname(__DIR__, 2).'/docs/fixtures/'.$fixtureKey.'.json';
    $json = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

    if (getenv('LATTICE_UPDATE_FIXTURES') !== false) {
        File::put($path, $json.PHP_EOL);
    }

    expect(File::exists($path))->toBeTrue("Missing fixture: {$path}");
    expect(File::get($path))->toBe($json.PHP_EOL);
}

/** Removes randomized signed references from committed docs fixtures. */
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
