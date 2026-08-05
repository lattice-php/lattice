<?php
declare(strict_types=1);

namespace Lattice\Table\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum ColumnAlign: string
{
    case Start = 'start';
    case Center = 'center';
    case End = 'end';
}
