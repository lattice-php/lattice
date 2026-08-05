<?php

declare(strict_types=1);

namespace Lattice\Notifications;

use Lattice\Core\Attributes\TypeScript;
use Lattice\Ui\Components\Component;
use Lattice\Ui\Enums\Variant;
use Lattice\Ui\I18n\Values\Translatable;

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
        public string|Translatable|null $title,
        public string|Translatable|null $body,
        public ?string $icon,
        public ?Variant $variant,
        public ?string $href,
        public bool $isRead,
        public ?string $createdAt,
        public array $actions,
    ) {}
}
