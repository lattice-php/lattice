<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum Placement: string
{
    case Top = 'top';
    case Bottom = 'bottom';
    case Right = 'right';
}
