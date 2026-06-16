<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\Op;

#[TypeScript]
final readonly class ColumnFilterOptionClause implements JsonSerializable
{
    public function __construct(
        public Op $operator,
        public string $value = '',
    ) {}

    /**
     * @return array{operator: string, value: string}
     */
    public function jsonSerialize(): array
    {
        return [
            'operator' => $this->operator->value,
            'value' => $this->value,
        ];
    }
}
