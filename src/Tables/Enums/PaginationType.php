<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

enum PaginationType: string
{
    case None = 'none';
    case Simple = 'simple';
    case Table = 'table';
    case Infinite = 'infinite';
}
