<?php

declare(strict_types=1);

namespace Workbench\App\Tables\Columns;

use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\ColumnData;
use Lattice\Lattice\Tables\Columns\Concerns\IsFilterable;
use Lattice\Lattice\Tables\Columns\Filterable;

#[Component('column.status-badge')]
class StatusBadgeColumn extends Column implements Filterable
{
    use IsFilterable;

    /**
     * @var array<string, string>
     */
    protected array $colorMap = [];

    /**
     * @param  array<string, string>  $colorMap
     */
    public function colorMap(array $colorMap): static
    {
        $this->colorMap = $colorMap;

        return $this;
    }

    #[\Override]
    public function toData(): ColumnData
    {
        return new ColumnData(
            key: $this->key,
            label: $this->label,
            type: 'column.status-badge',
            filter: $this->filterValue(),
            props: $this->colorMap !== [] ? ['colorMap' => $this->colorMap] : null,
        );
    }
}
