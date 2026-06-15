<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat\Components;

use Lattice\Lattice\Chat\Attributes\AsChatPart;
use Lattice\Lattice\Chat\ChatPart;
use Lattice\Lattice\Chat\Enums\ChatPartType;

#[AsChatPart(ChatPartType::ToolCall)]
final class ToolCallPart extends ChatPart
{
    public string $name = '';

    /**
     * @var array<string, mixed>
     */
    public array $args = [];

    /**
     * @param  array<string, mixed>  $args
     */
    public static function make(string $name, array $args = [], ?string $key = null): self
    {
        $part = new self($key);
        $part->name = $name;
        $part->args = $args;

        return $part;
    }
}
