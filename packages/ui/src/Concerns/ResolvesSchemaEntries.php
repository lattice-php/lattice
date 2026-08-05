<?php
declare(strict_types=1);

namespace Lattice\Ui\Concerns;

use Lattice\Ui\Components\Component;
use Lattice\Ui\Contracts\SchemaEntry;

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
