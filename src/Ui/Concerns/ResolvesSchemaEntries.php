<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Concerns;

use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Contracts\SchemaEntry;

trait ResolvesSchemaEntries
{
    /**
     * @param  array<int, SchemaEntry>  $entries
     * @return array<int, Component>
     */
    protected function resolveSchemaEntries(array $entries): array
    {
        $components = [];

        foreach ($entries as $entry) {
            array_push($components, ...$entry->resolveComponents());
        }

        return $components;
    }
}
