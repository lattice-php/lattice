<?php
declare(strict_types=1);

namespace Lattice\Table\Columns;

use Lattice\Core\Attributes\WireMap;
use Lattice\Core\Color;
use Lattice\Core\Enums\ColorName;
use Lattice\Table\Attributes\AsColumn;
use Lattice\Table\Columns\Concerns\IsFilterable;
use Lattice\Table\Columns\Concerns\IsSortable;
use Lattice\Table\Contracts\Filterable;
use Lattice\Table\Contracts\Sortable;
use Lattice\Table\Enums\ColumnType;

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
