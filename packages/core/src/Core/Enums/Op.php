<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Enums;

use InvalidArgumentException;
use Lattice\Lattice\Attributes\TypeScript;

/**
 * The shared comparison vocabulary used by both form conditions and table
 * filters. Pure vocabulary: the behavior lives in ConditionEvaluator (in-memory)
 * and FilterApplier (SQL); per-field/column availability is owned by the field
 * and column.
 */
#[TypeScript]
enum Op: string
{
    case Contains = 'contains';
    case StartsWith = 'starts_with';
    case EndsWith = 'ends_with';
    case Equals = 'eq';
    case NotEquals = 'neq';
    case GreaterThan = 'gt';
    case GreaterThanOrEqual = 'gte';
    case LessThan = 'lt';
    case LessThanOrEqual = 'lte';
    case In = 'in';
    case NotIn = 'not_in';
    case Before = 'before';
    case After = 'after';
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
                'Unknown operator [%s]. Use a comparison such as ">", ">=", "!=", or one of: %s.',
                $operator,
                implode(', ', array_map(static fn (self $case): string => $case->value, self::cases())),
            )),
        };
    }

    public function requiresValue(): bool
    {
        return ! in_array($this, [self::Empty, self::Filled], true);
    }
}
