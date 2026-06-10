<?php

declare(strict_types=1);

namespace Lattice\Lattice\Forms\Enums;

use InvalidArgumentException;

enum ConditionOperator: string
{
    case Equals = 'eq';
    case NotEquals = 'neq';
    case GreaterThan = 'gt';
    case GreaterThanOrEqual = 'gte';
    case LessThan = 'lt';
    case LessThanOrEqual = 'lte';
    case Contains = 'contains';
    case StartsWith = 'starts_with';
    case EndsWith = 'ends_with';
    case In = 'in';
    case NotIn = 'not_in';
    case Empty = 'empty';
    case Filled = 'filled';

    /**
     * Resolve an operator from an enum value (`gt`) or a human comparison (`>`).
     */
    public static function fromHuman(string $operator): self
    {
        return match ($operator) {
            '=', '==' => self::Equals,
            '!=', '<>' => self::NotEquals,
            '>' => self::GreaterThan,
            '>=' => self::GreaterThanOrEqual,
            '<' => self::LessThan,
            '<=' => self::LessThanOrEqual,
            default => self::tryFrom($operator) ?? throw new InvalidArgumentException(sprintf(
                'Unknown condition operator [%s]. Use a comparison such as ">", ">=", "!=", or one of: %s.',
                $operator,
                implode(', ', array_map(static fn (self $case): string => $case->value, self::cases())),
            )),
        };
    }

    public function evaluate(mixed $actual, mixed $expected): bool
    {
        return match ($this) {
            self::Equals => $this->equals($actual, $expected),
            self::NotEquals => ! $this->equals($actual, $expected),
            self::GreaterThan => $this->compareNumeric($actual, $expected) > 0,
            self::LessThan => $this->compareNumeric($actual, $expected) < 0,
            self::GreaterThanOrEqual => $this->compareNumeric($actual, $expected) >= 0,
            self::LessThanOrEqual => $this->compareNumeric($actual, $expected) <= 0,
            self::Contains => str_contains((string) $actual, (string) $expected),
            self::StartsWith => str_starts_with((string) $actual, (string) $expected),
            self::EndsWith => str_ends_with((string) $actual, (string) $expected),
            self::In => $this->isIn($actual, $expected),
            self::NotIn => ! $this->isIn($actual, $expected),
            self::Empty => blank($actual),
            self::Filled => filled($actual),
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

    private function isIn(mixed $actual, mixed $expected): bool
    {
        $needles = array_map(static fn (mixed $v): string => (string) $v, (array) $expected);

        return in_array((string) $actual, $needles, true);
    }
}
