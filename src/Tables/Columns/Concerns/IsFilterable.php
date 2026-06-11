<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns\Concerns;

use Lattice\Lattice\Tables\Enums\FilterOperator;
use Lattice\Lattice\Tables\Enums\FilterType;

trait IsFilterable
{
    protected bool $filterable = false;

    protected ?FilterOperator $defaultOperator = null;

    /**
     * @var array<int, FilterOperator>|null
     */
    protected ?array $operators = null;

    /**
     * @param  array<int, FilterOperator>  $operators  narrows the offered operators; defaults to the value type's full set
     */
    public function filterable(?FilterOperator $default = null, array $operators = []): static
    {
        $this->filterable = true;
        $this->defaultOperator = $default;
        $this->operators = $operators === [] ? null : array_values($operators);

        return $this;
    }

    public function isFilterable(): bool
    {
        return $this->filterable;
    }

    public function filterType(): FilterType
    {
        return FilterType::Text;
    }

    /**
     * @return array<int, FilterOperator>
     */
    public function availableOperators(): array
    {
        return $this->operators ?? $this->filterType()->operators();
    }

    public function defaultFilterOperator(): FilterOperator
    {
        return $this->defaultOperator ?? $this->filterType()->defaultOperator();
    }
}
