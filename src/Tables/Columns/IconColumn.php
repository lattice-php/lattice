<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use BackedEnum;
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
    public ?array $icons = null;

    /**
     * @var array<array-key, string>|null
     */
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

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    #[\Override]
    protected function decorateProps(array $props): array
    {
        foreach (['colors', 'icons'] as $key) {
            if (is_array($props[$key] ?? null)) {
                $props[$key] = Wire::map($props[$key]);
            }
        }

        return $props;
    }
}
