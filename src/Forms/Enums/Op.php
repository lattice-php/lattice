<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Forms\Enums;

enum Op: string
{
    case Equals = '=';
    case NotEquals = '!=';
    case GreaterThan = '>';
    case LessThan = '<';
    case GreaterThanOrEqual = '>=';
    case LessThanOrEqual = '<=';
    case In = 'in';
    case NotIn = 'not_in';

    public function evaluate(mixed $actual, mixed $expected): bool
    {
        return match ($this) {
            self::Equals => $this->equals($actual, $expected),
            self::NotEquals => ! $this->equals($actual, $expected),
            self::GreaterThan => (float) $actual > (float) $expected,
            self::LessThan => (float) $actual < (float) $expected,
            self::GreaterThanOrEqual => (float) $actual >= (float) $expected,
            self::LessThanOrEqual => (float) $actual <= (float) $expected,
            self::In => $this->contains($actual, $expected),
            self::NotIn => ! $this->contains($actual, $expected),
        };
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
