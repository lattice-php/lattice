<?php

declare(strict_types=1);

namespace Lattice\Lattice\Notifications;

use Lattice\Lattice\Attributes\TypeScript;
use Lattice\Lattice\Ui\Components\Component;
use Lattice\Lattice\Ui\Enums\Variant;

/**
 * A single notification as it reaches the client. Generated to TypeScript so the
 * React store shares one payload shape instead of re-declaring it by hand.
 */
#[TypeScript]
final readonly class NotificationItem
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
}
