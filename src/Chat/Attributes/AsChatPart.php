<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat\Attributes;

use Attribute;
use InvalidArgumentException;
use Lattice\Lattice\Attributes\Component;
use Lattice\Lattice\Chat\Enums\ChatPartType;
use Spatie\Attributes\Attributes;

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

    public function wireType(): string
    {
        return $this->type;
    }

    /**
     * Resolve the wire type declared by the #[AsChatPart] attribute on $class.
     *
     * @param  class-string  $class
     */
    public static function wireTypeForClass(string $class): string
    {
        $attribute = Attributes::get($class, self::class);

        if ($attribute === null) {
            throw new InvalidArgumentException(sprintf(
                'Chat part [%s] is missing the #[AsChatPart] attribute that declares its wire type.',
                $class,
            ));
        }

        return $attribute->wireType();
    }
}
