<?php
declare(strict_types=1);

namespace Lattice\Lattice\Forms\Enums;

use Lattice\Lattice\Attributes\TypeScript;

/**
 * Discriminates a row action's behaviour: the built-in client mutations the row
 * collection already understands. Reordering stays a separate affordance driven
 * by `reorderable`, not a row action.
 */
#[TypeScript]
enum RowActionType: string
{
    case Duplicate = 'duplicate';
    case Remove = 'remove';
}
