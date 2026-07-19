<?php

declare(strict_types=1);

use Lattice\Lattice\Core\Contracts\OptionSource;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Forms\Components\RowsField;

function discoverFixtures(): void
{
    config(['lattice.discover' => [
        dirname(__DIR__).'/Fixtures/Discovery',
    ]]);

    app(DiscoveryManifest::class)->clear();
}

/**
 * @return array<array-key, mixed>
 */
function wire(mixed $value): array
{
    return json_decode(json_encode($value, JSON_THROW_ON_ERROR), true);
}

function wireJson(mixed $value): string
{
    return json_encode($value, JSON_THROW_ON_ERROR);
}

/**
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

function fixturePath(string $name): string
{
    return dirname(__DIR__).'/Fixtures/'.$name;
}

/**
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
