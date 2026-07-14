<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Contracts;

interface Searchable
{
    public function isSearchable(): bool;
}
