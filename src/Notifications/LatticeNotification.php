<?php

declare(strict_types=1);

namespace Lattice\Lattice\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification as LaravelNotification;

final class LatticeNotification extends LaravelNotification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Notification $notification,
        private readonly bool $broadcast = true,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return $this->broadcast ? ['database', 'broadcast'] : ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return $this->notification->toArray();
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->notification->toArray());
    }

    public function broadcastType(): string
    {
        return 'lattice.notification';
    }
}
