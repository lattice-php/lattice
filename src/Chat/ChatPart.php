<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat;

use JsonSerializable;
use Lattice\Lattice\Chat\Attributes\AsChatPart;
use Lattice\Lattice\Chat\Parts\TextPart;
use Lattice\Lattice\Chat\Parts\ToolCallPart;

abstract readonly class ChatPart implements JsonSerializable
{
    public static function text(string $text): TextPart
    {
        return new TextPart($text);
    }

    /**
     * @param  array<string, mixed>  $args
     */
    public static function toolCall(string $name, array $args = []): ToolCallPart
    {
        return new ToolCallPart($name, $args);
    }

    /**
     * @return array<string, mixed>
     */
    public function jsonSerialize(): array
    {
        return ['type' => $this->wireType(), ...get_object_vars($this)];
    }

    public function wireType(): string
    {
        /** @var array<class-string, string> $cache */
        static $cache = [];

        return $cache[static::class] ??= AsChatPart::wireTypeForClass(static::class);
    }
}
