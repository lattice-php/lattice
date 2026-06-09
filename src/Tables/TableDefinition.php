<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables;

use Bambamboole\Lattice\Actions\Components\Action;
use Bambamboole\Lattice\Contracts\ProvidesTable;
use Bambamboole\Lattice\Core\Components\Component;
use Bambamboole\Lattice\Core\Definition;
use Bambamboole\Lattice\Tables\Columns\Column;
use Bambamboole\Lattice\Tables\Enums\PaginationType;
use Illuminate\Support\Collection;

abstract class TableDefinition extends Definition implements ProvidesTable
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

    public function layout(): string
    {
        return 'table';
    }

    public function striped(): bool
    {
        return false;
    }

    /**
     * @param  array<string, mixed>  $row
     * @return array<int, Component>
     */
    public function actions(array $row): array
    {
        return [];
    }

    /**
     * @return array<int, Action>
     */
    public function bulkActions(): array
    {
        return [];
    }

    abstract public function query(TableQuery $query): TableResult;

    /**
     * @param  array<int, mixed>  $keys
     * @return Collection<int, mixed>
     */
    public function resolveSelection(array $keys): Collection
    {
        return new Collection;
    }

    /**
     * @return Collection<int, mixed>
     */
    public function resolveMatching(TableQuery $query): Collection
    {
        return new Collection;
    }
}
