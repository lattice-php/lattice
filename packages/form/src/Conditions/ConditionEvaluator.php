<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Conditions;

use Lattice\Lattice\Core\Enums\Op;

/**
 * Evaluates an Op against a pair of values in memory. The server-side
 * counterpart to evaluateOp() in conditions.ts — the two must stay in agreement.
 * Keeping this behavior out of the Op enum (mirrors FilterApplier on the Tables
 * side) lets the shared operator vocabulary stay pure.
 */
final class ConditionEvaluator
{
    public function evaluate(Op $operator, mixed $actual, mixed $expected): bool
    {
        return match ($operator) {
            Op::Contains => str_contains((string) $actual, (string) $expected),
            Op::StartsWith => str_starts_with((string) $actual, (string) $expected),
            Op::EndsWith => str_ends_with((string) $actual, (string) $expected),
            Op::Equals => $this->equals($actual, $expected),
            Op::NotEquals => ! $this->equals($actual, $expected),
            Op::GreaterThan => $this->compareNumeric($actual, $expected) === 1,
            Op::GreaterThanOrEqual => in_array($this->compareNumeric($actual, $expected), [0, 1], true),
            Op::LessThan => $this->compareNumeric($actual, $expected) === -1,
            Op::LessThanOrEqual => in_array($this->compareNumeric($actual, $expected), [-1, 0], true),
            Op::In => $this->isIn($actual, $expected),
            Op::NotIn => ! $this->isIn($actual, $expected),
            Op::Before => $this->compareDates($actual, $expected) === -1,
            Op::After => $this->compareDates($actual, $expected) === 1,
            Op::Empty => blank($actual),
            Op::Filled => filled($actual),
        };
    }

    private function compareNumeric(mixed $actual, mixed $expected): ?int
    {
        $left = $this->numericValue($actual);
        $right = $this->numericValue($expected);

        if ($left === null || $right === null) {
            return null;
        }

        return $left <=> $right;
    }

    private function numericValue(mixed $value): ?float
    {
        if (is_int($value) || is_float($value)) {
            return (float) $value;
        }

        if (is_bool($value)) {
            return $value ? 1.0 : 0.0;
        }

        if ($value === null) {
            return 0.0;
        }

        if (is_string($value)) {
            $trimmed = trim($value);

            if ($trimmed === '') {
                return 0.0;
            }

            return is_numeric($trimmed) ? (float) $trimmed : null;
        }

        return null;
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
