<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Contracts;

use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Core\Option;
use Lattice\Lattice\Tables\Columns\ColumnFilterOption;
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

    public function filterSearchable(): bool;

    /**
     * @return list<ColumnFilterOption>
     */
    public function filterClauseOptions(): array;

    /**
     * @return list<Option>
     */
    public function searchFilterOptions(string $query): array;
}
