<?php

declare(strict_types=1);

namespace Lattice\Lattice\Notifications;

final class PendingLatticeNotification extends LatticeNotification
{
    public function __construct(
        private readonly Notification $notification,
        bool $broadcast = true,
    ) {
        $this->broadcast = $broadcast;
    }

    public function toLattice(object $notifiable): Notification
    {
        return $this->notification;
    }
}
