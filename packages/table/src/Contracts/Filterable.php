<?php
declare(strict_types=1);

namespace Lattice\Table\Contracts;

use Lattice\Core\Enums\Op;
use Lattice\Core\Option;
use Lattice\Table\Columns\ColumnFilterOption;
use Lattice\Table\Enums\FilterControl;
use Lattice\Table\Enums\FilterType;

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
