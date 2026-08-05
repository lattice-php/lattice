<?php

declare(strict_types=1);

namespace Lattice\Chat\Components;

use Lattice\Chat\Attributes\AsChatPart;
use Lattice\Chat\ChatPart;
use Lattice\Chat\Enums\ChatPartType;

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
