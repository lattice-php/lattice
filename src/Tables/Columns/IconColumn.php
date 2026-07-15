<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use BackedEnum;
use Lattice\Lattice\Attributes\WireMap;
use Lattice\Lattice\Core\Color;
use Lattice\Lattice\Core\Enums\ColorName;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Enums\ColumnType;
use Lattice\Lattice\Ui\Concerns\HasIcon;

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
     * @var array<array-key, Color>|null
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
     * Map cell values to a colour — a named colour (`Color::green()`, `'green'`)
     * or any CSS colour (`Color::hex('#16a34a')`, `'#16a34a'`). Unmapped values
     * render in the default icon colour.
     *
     * @param  array<array-key, Color|ColorName|string>  $colors
     */
    public function colors(array $colors): static
    {
        $this->colors = $colors === [] ? null : array_map(Color::from(...), $colors);

        return $this;
    }
}
