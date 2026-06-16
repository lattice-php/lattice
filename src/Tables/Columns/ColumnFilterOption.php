<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Columns;

use DateTimeInterface;
use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Enums\Op;

#[TypeScript]
final readonly class ColumnFilterOption implements JsonSerializable
{
    /**
     * @param  list<ColumnFilterOptionClause>  $clauses
     */
    public function __construct(
        public string $label,
        public string $value,
        public array $clauses,
    ) {}

    public static function clause(string $label, string $value, Op $operator, string $clauseValue = ''): self
    {
        return new self($label, $value, [new ColumnFilterOptionClause($operator, $clauseValue)]);
    }

    public static function range(
        string $label,
        string $value,
        DateTimeInterface|string $from,
        DateTimeInterface|string $until,
    ): self {
        return new self($label, $value, [
            new ColumnFilterOptionClause(Op::GreaterThanOrEqual, self::dateValue($from)),
            new ColumnFilterOptionClause(Op::LessThanOrEqual, self::dateValue($until)),
        ]);
    }

    /**
     * @return array{label: string, value: string, clauses: list<ColumnFilterOptionClause>}
     */
    public function jsonSerialize(): array
    {
        return [
            'label' => $this->label,
            'value' => $this->value,
            'clauses' => $this->clauses,
        ];
    }

    private static function dateValue(DateTimeInterface|string $date): string
    {
        return $date instanceof DateTimeInterface ? $date->format('Y-m-d') : $date;
    }
}
