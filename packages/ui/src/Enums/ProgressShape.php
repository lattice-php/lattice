<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum ProgressShape: string
{
    case Bar = 'bar';
    case Circle = 'circle';
}
