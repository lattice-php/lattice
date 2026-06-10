<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

interface Sortable
{
    public function isSortable(): bool;

    /**
     * @return array<string, mixed>
     */
    public function sortableToArray(): array;
}
