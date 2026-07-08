<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tests\Fixtures\Core;

use Lattice\Lattice\Core\Contracts\ResolvesReferenceIdentity;
use Lattice\Lattice\Core\Values\ReferenceIdentity;

/**
 * A mutable, in-memory reference identity for tests: bind it and reassign
 * `$identity` between seal and unseal to model an expired user or session.
 */
final class FakeReferenceIdentity implements ResolvesReferenceIdentity
{
    public function __construct(
        public ReferenceIdentity $identity = new ReferenceIdentity(null, null),
    ) {}

    public function current(): ReferenceIdentity
    {
        return $this->identity;
    }
}
