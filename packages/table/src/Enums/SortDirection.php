<?php
declare(strict_types=1);

namespace Lattice\Table\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum SortDirection: string
{
    case Asc = 'asc';
    case Desc = 'desc';
}
