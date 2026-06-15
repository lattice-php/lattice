<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Columns\Concerns\IsFilterable;
use Lattice\Lattice\Tables\Columns\Concerns\IsSortable;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[AsColumn(ColumnType::Badge)]
class BadgeColumn extends Column implements Filterable, Sortable
{
    use IsFilterable;
    use IsSortable;

    /**
     * @var array<array-key, string>|null
     */
    public ?array $colors = null;

    /**
     * Map cell values to a colour name (gray, red, green, yellow, blue, purple,
     * orange). Unmapped values fall back to gray.
     *
     * @param  array<array-key, string>  $colors
     */
    public function colors(array $colors): static
    {
        $this->colors = $colors === [] ? null : $colors;

        return $this;
    }
}
