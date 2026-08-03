<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum StackDirection: string
{
    case Row = 'row';
    case Column = 'column';
}
