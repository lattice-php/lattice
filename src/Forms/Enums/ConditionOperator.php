<?php

declare(strict_types=1);

namespace Lattice\Lattice\Forms\Enums;

enum ConditionOperator: string
{
    case Equals = 'eq';
    case NotEquals = 'neq';
    case GreaterThan = 'gt';
    case GreaterThanOrEqual = 'gte';
    case LessThan = 'lt';
    case LessThanOrEqual = 'lte';
    case In = 'in';
    case NotIn = 'not_in';

    public function evaluate(mixed $actual, mixed $expected): bool
    {
        return match ($this) {
            self::Equals => $this->equals($actual, $expected),
            self::NotEquals => ! $this->equals($actual, $expected),
            self::GreaterThan => $this->compareNumeric($actual, $expected) > 0,
            self::LessThan => $this->compareNumeric($actual, $expected) < 0,
            self::GreaterThanOrEqual => $this->compareNumeric($actual, $expected) >= 0,
            self::LessThanOrEqual => $this->compareNumeric($actual, $expected) <= 0,
            self::In => $this->contains($actual, $expected),
            self::NotIn => ! $this->contains($actual, $expected),
        };
    }

    private function compareNumeric(mixed $actual, mixed $expected): int
    {
        return (float) $actual <=> (float) $expected;
    }

    private function equals(mixed $actual, mixed $expected): bool
    {
        if (is_bool($expected)) {
            return filter_var($actual, FILTER_VALIDATE_BOOLEAN) === $expected;
        }

        return (string) $actual === (string) $expected;
    }

    private function contains(mixed $actual, mixed $expected): bool
    {
        $needles = array_map(static fn (mixed $v): string => (string) $v, (array) $expected);

        return in_array((string) $actual, $needles, true);
    }
}
