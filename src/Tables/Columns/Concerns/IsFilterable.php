<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns\Concerns;

use Lattice\Lattice\Tables\Enums\FilterOperator;
use Lattice\Lattice\Tables\Enums\FilterType;

trait IsFilterable
{
    protected bool $filterable = false;

    protected ?FilterOperator $defaultOperator = null;

    public function filterable(?FilterOperator $default = null): static
    {
        $this->filterable = true;
        $this->defaultOperator = $default;

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
    public function filterOperators(): array
    {
        return $this->filterType()->operators();
    }

    public function defaultFilterOperator(): FilterOperator
    {
        return $this->defaultOperator ?? $this->filterType()->defaultOperator();
    }

    /**
     * @return array<string, mixed>
     */
    public function filterToArray(): array
    {
        if (! $this->filterable) {
            return ['filter' => null];
        }

        return [
            'filter' => [
                'enabled' => true,
                'type' => $this->filterType()->value,
                'operators' => array_map(fn (FilterOperator $operator): string => $operator->value, $this->filterOperators()),
                'defaultOperator' => $this->defaultFilterOperator()->value,
            ],
        ];
    }
}
