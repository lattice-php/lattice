<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat\Attributes;

use Attribute;
use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Chat\Enums\ChatPartType;

/**
 * Marks a chat-part component and declares its wire type — the PHP↔JS
 * discriminant. Extends the Component attribute (like #[Column]) so a chat part
 * is a component: it serializes, renders, and is discovered through the same
 * machinery. Built-ins pass the ChatPartType enum for type-safety; consumers
 * pass a raw string.
 */
#[Attribute(Attribute::TARGET_CLASS)]
final class AsChatPart extends Component
{
    public function __construct(ChatPartType|string $type)
    {
        parent::__construct($type instanceof ChatPartType ? $type->value : $type);
    }
}
