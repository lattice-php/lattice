<?php

declare(strict_types=1);

namespace Lattice\Chat\Attributes;

use Attribute;
use Lattice\Chat\Enums\ChatPartType;
use Lattice\Core\Attributes\AsComponent;
use Lattice\Core\Support\Wire;

/**
 * Marks a chat-part component and declares its wire type — the PHP↔JS
 * discriminant. Extends the component attribute so a chat part serializes,
 * renders, and is discovered through the same
 * machinery. Built-ins pass the ChatPartType enum for type-safety; consumers
 * pass a raw string.
 */
#[Attribute(Attribute::TARGET_CLASS)]
final readonly class AsChatPart extends AsComponent
{
    public function __construct(ChatPartType|string $type)
    {
        parent::__construct(Wire::scalar($type));
    }
}
