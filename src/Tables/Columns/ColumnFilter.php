<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use JsonSerializable;
use Lattice\Lattice\Tables\Enums\FilterOperator;
use Lattice\Lattice\Tables\Enums\FilterType;

/**
 * The wire shape of a column's filter capability. Built by Column::toArray()
 * from a Filterable column and generated to TypeScript.
 */
final readonly class ColumnFilter implements JsonSerializable
{
    /**
     * @param  array<int, FilterOperator>  $operators
     */
    public function __construct(
        public bool $enabled,
        public FilterType $type,
        public array $operators,
        public FilterOperator $defaultOperator,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'enabled' => $this->enabled,
            'type' => $this->type->value,
            'operators' => array_map(fn (FilterOperator $operator): string => $operator->value, $this->operators),
            'defaultOperator' => $this->defaultOperator->value,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return $this->toArray();
    }
}
