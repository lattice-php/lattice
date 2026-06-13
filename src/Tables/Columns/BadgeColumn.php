<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Attributes;
use Lattice\Lattice\Tables\Columns\Concerns\IsFilterable;
use Lattice\Lattice\Tables\Columns\Concerns\IsSortable;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[Attributes\Column(type: 'badge', props: BadgeColumnProps::class)]
class BadgeColumn extends Column implements Filterable, Sortable
{
    use IsFilterable;
    use IsSortable;

    /**
     * @var array<array-key, string>
     */
    protected array $colors = [];

    /**
     * Map cell values to a colour name (gray, red, green, yellow, blue, purple,
     * orange). Unmapped values fall back to gray.
     *
     * @param  array<array-key, string>  $colors
     */
    public function colors(array $colors): static
    {
        $this->colors = $colors;

        return $this;
    }

    #[\Override]
    public function toData(): ColumnData
    {
        return new ColumnData(
            key: $this->key,
            label: $this->label,
            type: ColumnType::Badge,
            sortable: $this->sortableValue(),
            filter: $this->filterValue(),
            props: new BadgeColumnProps(colors: $this->colors === [] ? null : $this->colors),
        );
    }
}
