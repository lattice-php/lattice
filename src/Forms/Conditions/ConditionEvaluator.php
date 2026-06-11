<?php

declare(strict_types=1);

namespace Lattice\Lattice\Forms\Conditions;

use Lattice\Lattice\Forms\Enums\ConditionOperator;

/**
 * Evaluates a ConditionOperator against a pair of values in memory. The
 * server-side counterpart to evaluateOp() in conditions.ts — the two must stay
 * in agreement. Extracted from ConditionOperator so the operator enum is pure
 * vocabulary (mirrors FilterApplier on the Tables side, #127).
 */
final class ConditionEvaluator
{
    public function evaluate(ConditionOperator $operator, mixed $actual, mixed $expected): bool
    {
        return match ($operator) {
            ConditionOperator::Contains => str_contains((string) $actual, (string) $expected),
            ConditionOperator::StartsWith => str_starts_with((string) $actual, (string) $expected),
            ConditionOperator::EndsWith => str_ends_with((string) $actual, (string) $expected),
            ConditionOperator::Equals => $this->equals($actual, $expected),
            ConditionOperator::NotEquals => ! $this->equals($actual, $expected),
            ConditionOperator::GreaterThan => $this->compareNumeric($actual, $expected) > 0,
            ConditionOperator::GreaterThanOrEqual => $this->compareNumeric($actual, $expected) >= 0,
            ConditionOperator::LessThan => $this->compareNumeric($actual, $expected) < 0,
            ConditionOperator::LessThanOrEqual => $this->compareNumeric($actual, $expected) <= 0,
            ConditionOperator::In => $this->isIn($actual, $expected),
            ConditionOperator::NotIn => ! $this->isIn($actual, $expected),
            ConditionOperator::Before => $this->compareDates($actual, $expected) === -1,
            ConditionOperator::After => $this->compareDates($actual, $expected) === 1,
            ConditionOperator::Empty => blank($actual),
            ConditionOperator::Filled => filled($actual),
        };
    }

    private function compareNumeric(mixed $actual, mixed $expected): int
    {
        return (float) $actual <=> (float) $expected;
    }

    /**
     * Compare two date-ish values, or null when either cannot be parsed (so a
     * Before/After against an unparseable value never matches).
     */
    private function compareDates(mixed $actual, mixed $expected): ?int
    {
        $left = strtotime((string) $actual);
        $right = strtotime((string) $expected);

        if ($left === false || $right === false) {
            return null;
        }

        return $left <=> $right;
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
