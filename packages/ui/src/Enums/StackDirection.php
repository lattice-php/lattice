<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum StackDirection: string
{
    case Row = 'row';
    case Column = 'column';
}
