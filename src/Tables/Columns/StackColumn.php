<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Tables\Enums\ColumnType;

class StackColumn extends Column
{
    /**
     * @var array<int, Column>
     */
    protected array $columns = [];

    /**
     * @param  array<int, Column>  $columns
     */
    public function columns(array $columns): static
    {
        $this->columns = $columns;

        return $this;
    }

    #[\Override]
    public function toData(): ColumnData
    {
        return new ColumnData(
            key: $this->key,
            label: $this->label,
            type: ColumnType::Stack,
            sortable: $this->sortableValue(),
            filter: $this->filterValue(),
            columns: array_map(
                fn (Column $column): ColumnData => $column->toData(),
                $this->columns,
            ),
        );
    }
}
