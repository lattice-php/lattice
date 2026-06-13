<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum RowLayout: string
{
    case Stack = 'stack';
    case Table = 'table';
}
