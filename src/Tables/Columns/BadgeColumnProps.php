<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

final readonly class BadgeColumnProps implements ColumnProps
{
    /**
     * @param  array<array-key, string>|null  $colors
     */
    public function __construct(public ?array $colors = null) {}
}
