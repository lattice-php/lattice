<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum SortDirection: string
{
    case Asc = 'asc';
    case Desc = 'desc';
}
