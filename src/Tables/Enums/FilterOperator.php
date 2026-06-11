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

    public function requiresValue(): bool
    {
        return ! in_array($this, [self::Empty, self::Filled], true);
    }
}
