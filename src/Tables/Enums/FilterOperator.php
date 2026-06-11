<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

enum FilterOperator: string
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
     * The column types this operator can be offered on. Empty means the operator
     * is not surfaced through a column's default operator set yet (In/NotIn need
     * a multi-value control, tracked under the dedicated-filters work).
     *
     * @return array<int, FilterType>
     */
    public function appliesTo(): array
    {
        return match ($this) {
            self::Contains, self::StartsWith, self::EndsWith => [FilterType::Text],
            self::Equals, self::Empty, self::Filled => [FilterType::Text, FilterType::Number, FilterType::Date, FilterType::Boolean],
            self::NotEquals => [FilterType::Text, FilterType::Number],
            self::GreaterThan, self::GreaterThanOrEqual, self::LessThan, self::LessThanOrEqual => [FilterType::Number],
            self::Before, self::After => [FilterType::Date],
            self::In, self::NotIn => [],
        };
    }

    public function requiresValue(): bool
    {
        return ! in_array($this, [self::Empty, self::Filled], true);
    }
}
