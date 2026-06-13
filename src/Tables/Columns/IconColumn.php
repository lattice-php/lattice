<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use BackedEnum;
use Lattice\Lattice\Attributes;
use Lattice\Lattice\Tables\Enums\ColumnType;

#[Attributes\Column(type: 'icon', props: IconColumnProps::class)]
class IconColumn extends Column
{
    protected ?string $icon = null;

    /**
     * @var array<array-key, string>
     */
    protected array $icons = [];

    /**
     * @var array<array-key, string>
     */
    protected array $colors = [];

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
        $this->icons = array_map(self::iconValue(...), $icons);

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
        $this->colors = $colors;

        return $this;
    }

    #[\Override]
    public function toData(): ColumnData
    {
        return new ColumnData(
            key: $this->key,
            label: $this->label,
            type: ColumnType::Icon,
            props: new IconColumnProps(
                icon: $this->icon,
                icons: $this->icons === [] ? null : $this->icons,
                colors: $this->colors === [] ? null : $this->colors,
            ),
        );
    }
}
