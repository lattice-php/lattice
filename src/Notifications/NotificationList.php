<?php
declare(strict_types=1);

namespace Lattice\Lattice\Notifications;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
final readonly class NotificationList
{
    /**
     * @param  list<NotificationItem>  $notifications
     */
    public function __construct(
        public array $notifications,
        public int $unreadCount,
        public bool $hasMore,
    ) {}
}
