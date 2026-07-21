<?php

declare(strict_types=1);

namespace Lattice\Lattice\Notifications;

use BackedEnum;
use Lattice\Lattice\I18n\Values\Translatable;
use Lattice\Lattice\Notifications\Support\ActionDescriptor;
use Lattice\Lattice\Support\Wire;
use Lattice\Lattice\Ui\Enums\Variant;

final class Notification
{
    private string|Translatable|null $title = null;

    private string|Translatable|null $body = null;

    private ?string $icon = null;

    private Variant $variant = Variant::Info;

    private ?string $href = null;

    /** @var list<array<string, mixed>> */
    private array $actions = [];

    public static function make(): self
    {
        return new self;
    }

    public function title(string|Translatable $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function body(string|Translatable $body): self
    {
        $this->body = $body;

        return $this;
    }

    public function icon(BackedEnum|string $icon): self
    {
        $this->icon = Wire::scalar($icon);

        return $this;
    }

    public function variant(Variant $variant): self
    {
        $this->variant = $variant;

        return $this;
    }

    public function href(string $href): self
    {
        $this->href = $href;

        return $this;
    }

    /**
     * @param  array<string, mixed>  $arguments
     */
    public function action(string $action, array $arguments = [], ?string $label = null): self
    {
        $this->actions[] = ActionDescriptor::action($action, $arguments, $label);

        return $this;
    }

    public function link(string $label, string $url): self
    {
        $this->actions[] = ActionDescriptor::link($label, $url);

        return $this;
    }

    public function send(object $notifiable): void
    {
        $notifiable->notify(new LatticeNotification($this, broadcast: true));
    }

    public function sendToDatabase(object $notifiable): void
    {
        $notifiable->notify(new LatticeNotification($this, broadcast: false));
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'format' => 'lattice',
            'title' => Wire::toWire($this->title),
            'body' => Wire::toWire($this->body),
            'icon' => $this->icon,
            'variant' => $this->variant->value,
            'href' => $this->href,
            'actions' => $this->actions,
        ];
    }
}
