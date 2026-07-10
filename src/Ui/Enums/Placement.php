<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum Placement: string
{
    case Top = 'top';
    case Bottom = 'bottom';
    case Right = 'right';
}
