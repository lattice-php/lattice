<?php

declare(strict_types=1);

namespace Lattice\Lattice\Forms\Enums;

use InvalidArgumentException;

enum ConditionOperator: string
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
                'Unknown condition operator [%s]. Use a comparison such as ">", ">=", "!=", or one of: %s.',
                $operator,
                implode(', ', array_map(static fn (self $case): string => $case->value, self::cases())),
            )),
        };
    }
}
