<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Tables\Columns;

use Bambamboole\Lattice\Tables\Enums\ControlType;
use Bambamboole\Lattice\Tables\Enums\Operator;
use JsonSerializable;

/**
 * @phpstan-consistent-constructor
 */
class Column implements JsonSerializable
{
    protected string $label;

    protected bool $sortable = false;

    protected bool $filterable = false;

    protected ?Operator $defaultOperator = null;

    public function __construct(public readonly string $key)
    {
        $this->label = str($key)->headline()->toString();
    }

    public static function make(string $key): static
    {
        return new static($key);
    }

    public function label(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function sortable(bool $sortable = true): static
    {
        $this->sortable = $sortable;

        return $this;
    }

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

    public function isSortable(): bool
    {
        return $this->sortable;
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
    public function toArray(): array
    {
        return array_filter([
            'key' => $this->key,
            'label' => $this->label,
            'sortable' => $this->sortable ?: null,
            'filter' => $this->isFilterable() ? [
                'enabled' => true,
                'type' => $this->controlType()->value,
                'operators' => array_map(fn (Operator $operator): string => $operator->value, $this->filterOperators()),
                'defaultOperator' => $this->defaultFilterOperator()->value,
            ] : null,
        ], fn (mixed $value): bool => $value !== null);
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
