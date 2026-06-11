<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use JsonSerializable;

/**
 * @phpstan-consistent-constructor
 */
abstract class Column implements JsonSerializable
{
    protected string $label;

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

    abstract public function toData(): ColumnData;

    protected function sortableValue(): ?bool
    {
        return $this instanceof Sortable && $this->isSortable() ? true : null;
    }

    protected function filterValue(): ?ColumnFilter
    {
        if (! $this instanceof Filterable || ! $this->isFilterable()) {
            return null;
        }

        return new ColumnFilter(
            enabled: true,
            type: $this->filterType(),
            operators: $this->availableOperators(),
            defaultOperator: $this->defaultFilterOperator(),
        );
    }

    public function jsonSerialize(): ColumnData
    {
        return $this->toData();
    }
}
