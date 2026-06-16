<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum ChartSeriesType: string
{
    case Area = 'area';
    case Bar = 'bar';
    case Line = 'line';
    case Pie = 'pie';
}
