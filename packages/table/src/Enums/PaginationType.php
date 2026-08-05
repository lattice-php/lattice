<?php
declare(strict_types=1);

namespace Lattice\Table\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum PaginationType: string
{
    case None = 'none';
    case Simple = 'simple';
    case Table = 'table';
    case Infinite = 'infinite';
}
