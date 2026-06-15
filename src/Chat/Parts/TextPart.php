<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat\Parts;

use Lattice\Lattice\Chat\Attributes\AsChatPart;
use Lattice\Lattice\Chat\ChatPart;
use Lattice\Lattice\Chat\Enums\ChatPartType;

#[AsChatPart(ChatPartType::Text)]
final readonly class TextPart extends ChatPart
{
    public function __construct(
        public string $text,
    ) {}
}
