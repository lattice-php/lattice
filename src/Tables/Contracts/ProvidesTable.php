<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Contracts;

use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\TableQuery;
use Lattice\Lattice\Tables\TableResult;

interface ProvidesTable
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array;

    public function query(TableQuery $query): TableResult;
}
