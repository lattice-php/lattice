<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum FloatingPlacement: string
{
    case BottomEnd = 'bottom-end';
    case BottomStart = 'bottom-start';
    case TopEnd = 'top-end';
    case TopStart = 'top-start';
}
