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
    case Select = 'select';
    case Ternary = 'ternary';
    case DateRange = 'date-range';
    case Toggle = 'toggle';
}
