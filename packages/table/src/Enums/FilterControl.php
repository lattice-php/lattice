<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

use Lattice\Lattice\Attributes\TypeScript;

/**
 * The control style a dedicated table filter renders as on the client. The
 * value type ({@see FilterType}) describes a column's value; this describes a
 * table-level filter's UI.
 */
#[TypeScript]
enum FilterControl: string
{
    case Select = 'filter.select';
    case Ternary = 'filter.ternary';
    case DateRange = 'filter.date-range';
    case Toggle = 'filter.toggle';
}
