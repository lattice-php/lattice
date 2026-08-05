<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum ChartSeriesType: string
{
    case Area = 'area';
    case Bar = 'bar';
    case Distribution = 'distribution';
    case Gauge = 'gauge';
    case Line = 'line';
    case Pie = 'pie';
}
