<?php
declare(strict_types=1);

namespace Lattice\Table\Contracts;

interface Searchable
{
    public function isSearchable(): bool;
}
