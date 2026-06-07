<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

use Bambamboole\Lattice\Tables\Columns\Column;

abstract class TableDefinition
{
    /**
     * @return array<int, Column>
     */
    abstract public function columns(): array;

    public function perPage(): int
    {
        return 25;
    }

    public function pagination(): PaginationType|string
    {
        return PaginationType::Table;
    }

    public function paginationType(): PaginationType
    {
        $type = $this->pagination();

        return $type instanceof PaginationType ? $type : PaginationType::from($type);
    }

    abstract public function query(TableQuery $query): TableResult;
}
