<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Contracts;

use Bambamboole\Lattice\Tables\Columns\Column;
use Bambamboole\Lattice\Tables\TableQuery;
use Bambamboole\Lattice\Tables\TableResult;

interface ProvidesTable
{
    /**
     * @return array<int, Column>
     */
    public function columns(): array;

    public function query(TableQuery $query): TableResult;
}
