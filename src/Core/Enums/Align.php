<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum Align: string
{
    case Center = 'center';
    case Left = 'left';
    case Start = 'start';
    case Stretch = 'stretch';
}
