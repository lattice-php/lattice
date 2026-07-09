<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Support\Wire;
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

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    #[\Override]
    protected function decorateProps(array $props): array
    {
        if (is_array($props['colors'] ?? null)) {
            $props['colors'] = Wire::map($props['colors']);
        }

        return $props;
    }
}
