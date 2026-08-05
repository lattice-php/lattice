<?php
declare(strict_types=1);

namespace Lattice\Table\Contracts;

interface Sortable
{
    public function isSortable(): bool;
}
