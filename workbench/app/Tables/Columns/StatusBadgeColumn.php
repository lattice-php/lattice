<?php

declare(strict_types=1);

namespace Workbench\App\Tables\Columns;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Tables\Columns\Column;
use Lattice\Lattice\Tables\Columns\ColumnData;
use Lattice\Lattice\Tables\Columns\Concerns\IsFilterable;
use Lattice\Lattice\Tables\Columns\Filterable;

#[Attributes\Column(type: 'column.status-badge', props: StatusBadgeColumnProps::class)]
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
            props: new StatusBadgeColumnProps(
                colorMap: $this->colorMap !== [] ? $this->colorMap : null,
            ),
        );
    }
}
