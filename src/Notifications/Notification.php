<?php

declare(strict_types=1);

namespace Lattice\Lattice\Notifications;

use BackedEnum;
use Lattice\Lattice\Core\Enums\Variant;

final class Notification
{
    private ?string $title = null;

    private ?string $body = null;

    private ?string $icon = null;

    private Variant $variant = Variant::Info;

    private ?string $href = null;

    private bool $openInNewTab = false;

    public static function make(): self
    {
        return new self;
    }

    public function title(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function body(string $body): self
    {
        $this->body = $body;

        return $this;
    }

    public function icon(BackedEnum|string $icon): self
    {
        $this->icon = $icon instanceof BackedEnum ? (string) $icon->value : $icon;

        return $this;
    }

    public function variant(Variant $variant): self
    {
        $this->variant = $variant;

        return $this;
    }

    public function href(string $href, bool $newTab = false): self
    {
        $this->href = $href;
        $this->openInNewTab = $newTab;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return [
            'format' => 'lattice',
            'title' => $this->title,
            'body' => $this->body,
            'icon' => $this->icon,
            'variant' => $this->variant->value,
            'href' => $this->href,
            'openInNewTab' => $this->openInNewTab,
            'actions' => [],
        ];
    }
}
