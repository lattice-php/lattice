<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum ChartSeriesType: string
{
    case Area = 'area';
    case Bar = 'bar';
    case Gauge = 'gauge';
    case Line = 'line';
    case Pie = 'pie';
}
