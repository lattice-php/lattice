<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use JsonSerializable;
use Lattice\Lattice\Core\Enums\Op;
use Lattice\Lattice\Tables\Enums\FilterType;

/**
 * The wire shape of a column's filter capability. Built by a Filterable column
 * and generated to TypeScript.
 */
final readonly class ColumnFilter implements JsonSerializable
{
    /**
     * @param  array<int, Op>  $operators
     */
    public function __construct(
        public bool $enabled,
        public FilterType $type,
        public array $operators,
        public Op $defaultOperator,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return [
            'enabled' => $this->enabled,
            'type' => $this->type->value,
            'operators' => array_map(fn (Op $operator): string => $operator->value, $this->operators),
            'defaultOperator' => $this->defaultOperator->value,
        ];
    }
}
