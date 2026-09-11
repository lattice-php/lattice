<?php
declare(strict_types=1);

namespace Lattice\Core\Values;

use Lattice\Core\Contracts\ResolvesReferenceIdentity;

/**
 * The identity a component reference is bound to: the current user, a hash of
 * the current session, and the endpoint area it is served from. Any may be
 * null — a guest, a request with no session, the default area.
 * {@see ResolvesReferenceIdentity}
 */
final readonly class ReferenceIdentity
{
    public function __construct(
        public ?string $userId,
        public ?string $sessionHash,
        public ?string $area = null,
    ) {}
}
