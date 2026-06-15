<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat\Attributes;

use Attribute;
use InvalidArgumentException;
use Lattice\Lattice\Chat\Enums\ChatPartType;
use Spatie\Attributes\Attributes;

/**
 * Marks a chat-part value object and declares its wire type — the PHP↔JS
 * discriminant. Built-ins pass the ChatPartType enum for type-safety; consumers
 * pass a raw string. Discovery shares ClassWalker, but the attribute stays
 * distinct by design (chat parts form their own discriminated union).
 */
#[Attribute(Attribute::TARGET_CLASS)]
final class AsChatPart
{
    public function __construct(public readonly ChatPartType|string $type) {}

    public function wireType(): string
    {
        return $this->type instanceof ChatPartType ? $this->type->value : $this->type;
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
