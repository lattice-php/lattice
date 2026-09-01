<?php

declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum Placement: string
{
    case Top = 'top';
    case Right = 'right';
    case Bottom = 'bottom';
    case Left = 'left';
}
