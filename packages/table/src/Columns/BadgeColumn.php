<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Attributes\WireMap;
use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Core\Enums\ColorName;
use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Columns\Concerns\IsFilterable;
use Lattice\Lattice\Tables\Columns\Concerns\IsSortable;
use Lattice\Lattice\Tables\Contracts\Filterable;
use Lattice\Lattice\Tables\Contracts\Sortable;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[AsColumn(ColumnType::Badge)]
final class BadgeColumn extends Column implements Filterable, Sortable
{
    use IsFilterable;
    use IsSortable;

    /**
     * @var array<array-key, Color>|null
     */
    #[WireMap]
    public ?array $colors = null;

    /**
     * Map cell values to a colour — a named colour (`Color::green()`, `'green'`)
     * or any CSS colour (`Color::hex('#16a34a')`, `'#16a34a'`). Unmapped values
     * fall back to gray.
     *
     * @param  array<array-key, Color|ColorName|string>  $colors
     */
    public function colors(array $colors): static
    {
        $this->colors = $colors === [] ? null : array_map(Color::from(...), $colors);

        return $this;
    }
}
