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

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $data = [
            'key' => $this->key,
            'label' => $this->label,
        ];

        if ($this instanceof Sortable && $this->isSortable()) {
            $data['sortable'] = true;
        }

        if ($this instanceof Filterable && $this->isFilterable()) {
            $data['filter'] = (new ColumnFilter(
                enabled: true,
                type: $this->filterType(),
                operators: $this->filterOperators(),
                defaultOperator: $this->defaultFilterOperator(),
            ))->toArray();
        }

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
