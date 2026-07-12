<?php
declare(strict_types=1);

namespace Lattice\Lattice\Notifications;

use Lattice\Lattice\Attributes\TypeScript;

/**
 * The payload every notification mutation (read, dismiss, clear) returns: the
 * unread total after the change.
 */
#[TypeScript]
final readonly class UnreadCount
{
    public function __construct(
        public int $unreadCount,
    ) {}
}
