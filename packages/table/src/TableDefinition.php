<?php
declare(strict_types=1);

namespace Lattice\Table;

use Lattice\Core\Contracts\InteractiveComponent;
use Lattice\Core\Definition;
use Lattice\Table\Columns\Column;
use Lattice\Table\Contracts\TableSource;
use Lattice\Table\Enums\PaginationType;
use Lattice\Table\Filters\Filter;
use Lattice\Ui\Components\Component;

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

    /**
     * Page-size choices offered in the pagination bar; empty hides the control.
     * `PaginationType::Infinite` offers switching to infinite pagination.
     *
     * @return array<int, int|PaginationType::Infinite>
     */
    public function perPageOptions(): array
    {
        return [];
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

    public function pinnableColumns(): bool
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
     * @param  array<string, mixed>  $row
     */
    public function rowDetail(array $row): ?Component
    {
        return null;
    }

    /**
     * @param  array<string, mixed>  $row
     */
    public function rowUrl(array $row): ?string
    {
        return null;
    }

    /**
     * @return array<int, Component&InteractiveComponent>
     */
    public function bulkActions(): array
    {
        return [];
    }

    /**
     * Components rendered in the table toolbar, before the built-in controls.
     *
     * @return array<int, Component>
     */
    public function toolbar(): array
    {
        return [];
    }

    abstract public function source(): TableSource;
}
