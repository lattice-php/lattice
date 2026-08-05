<?php
declare(strict_types=1);

namespace Lattice\Form\Enums;

use Lattice\Core\Attributes\TypeScript;

// Reordering is a separate affordance (`reorderable`), so there are no move cases here.
#[TypeScript]
enum RowActionType: string
{
    case Duplicate = 'duplicate';
    case Remove = 'remove';
}
