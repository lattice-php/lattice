<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use BackedEnum;
use Lattice\Lattice\Attributes\WireMap;
use Lattice\Lattice\Core\Concerns\HasIcon;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[AsColumn(ColumnType::Icon)]
class IconColumn extends Column
{
    use HasIcon;

    /**
     * @var array<array-key, string>|null
     */
    #[WireMap]
    public ?array $icons = null;

    /**
     * @var array<array-key, string>|null
     */
    #[WireMap]
    public ?array $colors = null;

    /**
     * Map cell values to icons, so each row shows an icon based on its value.
     *
     * @param  array<array-key, BackedEnum|string>  $icons
     */
    public function icons(array $icons): static
    {
        $this->icons = $icons === [] ? null : array_map(Wire::scalar(...), $icons);

        return $this;
    }

    /**
     * Map cell values to a colour name (gray, red, green, yellow, blue, purple,
     * orange).
     *
     * @param  array<array-key, string>  $colors
     */
    public function colors(array $colors): static
    {
        $this->colors = $colors === [] ? null : $colors;

        return $this;
    }
}
