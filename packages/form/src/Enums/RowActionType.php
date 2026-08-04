<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Enums;

use Lattice\Lattice\Attributes\TypeScript;

// Reordering is a separate affordance (`reorderable`), so there are no move cases here.
#[TypeScript]
enum RowActionType: string
{
    case Duplicate = 'duplicate';
    case Remove = 'remove';
}
