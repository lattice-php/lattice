<?php
declare(strict_types=1);

namespace Lattice\Calendar;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum CalendarView: string
{
    case Month = 'month';
    case Timeline = 'timeline';
}
