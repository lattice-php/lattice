<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Tables\Enums\FilterControl;
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

    public function filterControl(): ?FilterControl;

    /**
     * @return list<Option>
     */
    public function filterSelectOptions(): array;

    public function filterMultiple(): bool;
}
