<?php
declare(strict_types=1);

namespace Lattice\Notifications\Components;

use Lattice\Core\Attributes\AsComponent;
use Lattice\Notifications\NotificationChannel;
use Lattice\Notifications\NotificationRoutes;
use Lattice\Ui\Components\Component;

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
        $component->endpoint = '/'.ltrim(NotificationRoutes::componentEndpoint(), '/');
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
