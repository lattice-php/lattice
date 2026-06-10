<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Tables\Enums\FilterOperator;
use Lattice\Lattice\Tables\Enums\FilterType;

interface Filterable
{
    public function isFilterable(): bool;

    public function filterType(): FilterType;

    /**
     * @return array<int, FilterOperator>
     */
    public function filterOperators(): array;

    public function defaultFilterOperator(): FilterOperator;

    /**
     * @return array<string, mixed>
     */
    public function filterToArray(): array;
}
