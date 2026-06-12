<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

final readonly class IconColumnProps implements ColumnProps
{
    /**
     * @param  array<array-key, string>|null  $icons
     * @param  array<array-key, string>|null  $colors
     */
    public function __construct(
        public ?string $icon = null,
        public ?array $icons = null,
        public ?array $colors = null,
    ) {}
}
