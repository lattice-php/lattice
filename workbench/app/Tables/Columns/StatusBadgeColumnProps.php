<?php

declare(strict_types=1);

namespace Workbench\App\Tables\Columns;

use Lattice\Lattice\Tables\Columns\ColumnProps;

final readonly class StatusBadgeColumnProps implements ColumnProps
{
    /**
     * @param  array<string, string>|null  $colorMap
     */
    public function __construct(public ?array $colorMap = null) {}
}
