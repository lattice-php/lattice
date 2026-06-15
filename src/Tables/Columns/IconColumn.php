<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use BackedEnum;
use Lattice\Lattice\Tables\Attributes\AsColumn;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[AsColumn(ColumnType::Icon)]
class IconColumn extends Column
{
    public ?string $icon = null;

    /**
     * @var array<array-key, string>|null
     */
    public ?array $icons = null;

    /**
     * @var array<array-key, string>|null
     */
    public ?array $colors = null;

    /**
     * The icon shown for every row.
     */
    public function icon(BackedEnum|string $icon): static
    {
        $this->icon = self::iconValue($icon);

        return $this;
    }

    /**
     * Map cell values to icons, so each row shows an icon based on its value.
     *
     * @param  array<array-key, BackedEnum|string>  $icons
     */
    public function icons(array $icons): static
    {
        $this->icons = $icons === [] ? null : array_map(self::iconValue(...), $icons);

        return $this;
    }

    private static function iconValue(BackedEnum|string $icon): string
    {
        return $icon instanceof BackedEnum ? (string) $icon->value : $icon;
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
