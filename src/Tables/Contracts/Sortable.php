<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Contracts;

interface Sortable
{
    public function isSortable(): bool;
}
