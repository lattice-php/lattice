<?php
declare(strict_types=1);

namespace Lattice\Table\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum ColumnPin: string
{
    case Left = 'left';
    case Right = 'right';
}
