<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum ColumnAlign: string
{
    case Start = 'start';
    case Center = 'center';
    case End = 'end';
}
