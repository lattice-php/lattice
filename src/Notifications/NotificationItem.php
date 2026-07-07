<?php

declare(strict_types=1);

namespace Lattice\Lattice\Notifications;

use JsonSerializable;
use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Core\Components\Component;
use Lattice\Lattice\Core\Enums\Variant;

/**
 * A single notification as it reaches the client. Generated to TypeScript so the
 * React store shares one payload shape instead of re-declaring it by hand.
 */
#[TypeScript]
final readonly class NotificationItem implements JsonSerializable
{
    /**
     * @param  list<Component>  $actions
     */
    public function __construct(
        public string $id,
        public ?string $title,
        public ?string $body,
        public ?string $icon,
        public ?Variant $variant,
        public ?string $href,
        public bool $isRead,
        public ?string $createdAt,
        public array $actions,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'body' => $this->body,
            'icon' => $this->icon,
            'variant' => $this->variant?->value,
            'href' => $this->href,
            'isRead' => $this->isRead,
            'createdAt' => $this->createdAt,
            'actions' => array_map(
                static fn (Component $action): array => $action->jsonSerialize(),
                $this->actions,
            ),
        ];
    }
}
