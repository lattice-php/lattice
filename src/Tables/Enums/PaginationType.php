<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum PaginationType: string
{
    case None = 'none';
    case Simple = 'simple';
    case Table = 'table';
    case Infinite = 'infinite';
}
