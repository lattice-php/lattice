<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum Orientation: string
{
    case Horizontal = 'horizontal';
    case Vertical = 'vertical';
}
