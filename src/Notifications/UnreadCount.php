<?php
declare(strict_types=1);

namespace Lattice\Lattice\Notifications;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
final readonly class UnreadCount
{
    public function __construct(
        public int $unreadCount,
    ) {}
}
