<?php

declare(strict_types=1);

namespace Lattice\Chat\Enums;

use Lattice\Core\Enums\Concerns\HasPrefixedWireType;

enum ChatPartType: string
{
    use HasPrefixedWireType;

    private const string Prefix = 'chat.part.';

    case Text = 'chat.part.text';
    case ToolCall = 'chat.part.tool-call';
}
