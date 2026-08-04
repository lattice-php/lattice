<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Values;

use Lattice\Lattice\Core\Contracts\ResolvesReferenceIdentity;

/**
 * The identity a component reference is bound to: the current user and a hash
 * of the current session. Either may be null — a guest, or a request with no
 * session. {@see ResolvesReferenceIdentity}
 */
final readonly class ReferenceIdentity
{
    public function __construct(
        public ?string $userId,
        public ?string $sessionHash,
    ) {}
}
