<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat\Components;

use Lattice\Lattice\Chat\Attributes\AsChatPart;
use Lattice\Lattice\Chat\ChatPart;
use Lattice\Lattice\Chat\Enums\ChatPartType;

#[AsChatPart(ChatPartType::Text)]
final class TextPart extends ChatPart
{
    public string $text = '';

    public static function make(string $text, ?string $key = null): static
    {
        $part = new self($key);
        $part->text = $text;

        return $part;
    }
}
