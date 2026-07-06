<?php

declare(strict_types=1);

namespace Lattice\Lattice\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification as LaravelNotification;

abstract class LatticeNotification extends LaravelNotification
{
    use Queueable;

    protected bool $broadcast = true;

    abstract public function toLattice(object $notifiable): Notification;

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
        return $this->toLattice($notifiable)->toArray();
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toLattice($notifiable)->toArray());
    }

    public function broadcastType(): string
    {
        return 'lattice.notification';
    }
}
