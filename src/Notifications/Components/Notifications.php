<?php
declare(strict_types=1);

namespace Lattice\Lattice\Notifications\Components;

use Lattice\Lattice\Attributes\AsComponent;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Notifications\NotificationChannel;

#[AsComponent('notifications')]
class Notifications extends Component
{
    public string $endpoint;

    public string $channel = '';

    public bool $slideOut = false;

    public ?int $pollingInterval = null;

    public static function make(?string $key = null): static
    {
        $component = new static($key);
        $component->endpoint = '/'.ltrim((string) config('lattice.notifications.endpoint', 'lattice/notifications'), '/');
        $component->pollingInterval = config('lattice.notifications.polling_interval');

        $user = auth()->user();
        if ($user !== null) {
            $component->channel = NotificationChannel::for($user);
        }

        return $component;
    }

    public function slideOut(bool $slideOut = true): static
    {
        $this->slideOut = $slideOut;

        return $this;
    }

    public function pollingInterval(?int $seconds): static
    {
        $this->pollingInterval = $seconds;

        return $this;
    }
}
