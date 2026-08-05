<?php
declare(strict_types=1);

namespace Lattice\Notifications;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
final readonly class UnreadCount
{
    public function __construct(
        public int $unreadCount,
    ) {}
}
