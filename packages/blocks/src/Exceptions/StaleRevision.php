<?php
declare(strict_types=1);

namespace Lattice\Blocks\Exceptions;

use RuntimeException;

/**
 * Thrown by a block editor definition when a save carries a revision older
 * than the stored one; the endpoint turns it into a 409 so the editor can
 * offer to reload instead of silently overwriting someone else's draft.
 */
final class StaleRevision extends RuntimeException
{
    public function __construct(public readonly int $current, public readonly int $received)
    {
        parent::__construct("Block document revision {$received} is stale; the current revision is {$current}.");
    }
}
