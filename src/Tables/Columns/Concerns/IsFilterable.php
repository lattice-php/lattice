<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns\Concerns;

use Lattice\Lattice\Tables\Enums\ControlType;
use Lattice\Lattice\Tables\Enums\FilterOperator;

trait IsFilterable
{
    protected bool $filterable = false;

    protected ?FilterOperator $defaultOperator = null;

    public function filterable(): static
    {
        $this->filterable = true;

        return $this;
    }

    public function filterableExact(): static
    {
        $this->filterable = true;
        $this->defaultOperator = FilterOperator::Equals;

        return $this;
    }

    public function isFilterable(): bool
    {
        return $this->filterable;
    }

    public function controlType(): ControlType
    {
        return ControlType::Text;
    }

    /**
     * @return array<int, FilterOperator>
     */
    public function filterOperators(): array
    {
        return $this->controlType()->operators();
    }

    public function defaultFilterOperator(): FilterOperator
    {
        return $this->defaultOperator ?? $this->controlType()->defaultOperator();
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
                'type' => $this->controlType()->value,
                'operators' => array_map(fn (FilterOperator $operator): string => $operator->value, $this->filterOperators()),
                'defaultOperator' => $this->defaultFilterOperator()->value,
            ],
        ];
    }
}
