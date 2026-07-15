<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables;

use Lattice\Lattice\Actions\Components\Action;
use Lattice\Lattice\Core\Definition;
use Lattice\Lattice\Fragments\Components\Fragment;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Contracts\TableSource;
use Lattice\Lattice\Tables\Enums\PaginationType;
use Lattice\Lattice\Tables\Filters\Filter;
use Lattice\Lattice\Ui\Components\Component;

abstract class TableDefinition extends Definition
{
    /**
     * @return array<int, Column>
     */
    abstract public function columns(): array;

    /**
     * Dedicated, table-level filters rendered above the table.
     *
     * @return array<int, Filter>
     */
    public function filters(): array
    {
        return [];
    }

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

    public function resizableColumns(): bool
    {
        return false;
    }

    public function resizeIndicator(): bool
    {
        return false;
    }

    public function actionsLabel(): ?string
    {
        return null;
    }

    public function emptyLabel(): ?string
    {
        return null;
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
     * The lazy detail fragment revealed when this row is expanded, or null when
     * the row does not expand. Return `Fragment::lazy(...)` so the detail loads
     * over AJAX on open.
     *
     * @param  array<string, mixed>  $row
     */
    public function rowDetail(array $row): ?Fragment
    {
        return null;
    }

    /**
     * @return array<int, Action>
     */
    public function bulkActions(): array
    {
        return [];
    }

    abstract public function source(): TableSource;
}
