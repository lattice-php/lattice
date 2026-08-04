<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Contracts;

use Lattice\Lattice\Core\Values\ReferenceIdentity;

/**
 * Supplies the identity a component reference is sealed to and verified against.
 * This is the seam that keeps the signer free of any request lookup: the default
 * implementation reads the current user and session, while tests bind a fixed one.
 */
interface ResolvesReferenceIdentity
{
    public function current(): ReferenceIdentity;
}
