<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables\Columns;

interface Sortable
{
    public function isSortable(): bool;

    /**
     * @return array<string, mixed>
     */
    public function sortableToArray(): array;
}
