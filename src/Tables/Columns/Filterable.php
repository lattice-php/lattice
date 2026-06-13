<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Tables\Enums\FilterType;

interface Filterable
{
    public function isFilterable(): bool;

    public function filterType(): FilterType;

    /**
     * @return array<int, Op>
     */
    public function availableOperators(): array;

    public function defaultFilterOperator(): Op;
}
