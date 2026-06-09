<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables\Columns\Concerns;

use Bambamboole\Lattice\Tables\Enums\ControlType;
use Bambamboole\Lattice\Tables\Enums\Operator;

trait IsFilterable
{
    protected bool $filterable = false;

    protected ?Operator $defaultOperator = null;

    public function filterable(): static
    {
        $this->filterable = true;

        return $this;
    }

    public function filterableExact(): static
    {
        $this->filterable = true;
        $this->defaultOperator = Operator::Equals;

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
     * @return array<int, Operator>
     */
    public function filterOperators(): array
    {
        return $this->controlType()->operators();
    }

    public function defaultFilterOperator(): Operator
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
                'operators' => array_map(fn (Operator $operator): string => $operator->value, $this->filterOperators()),
                'defaultOperator' => $this->defaultFilterOperator()->value,
            ],
        ];
    }
}
