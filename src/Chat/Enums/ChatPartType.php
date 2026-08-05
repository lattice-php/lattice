<?php

declare(strict_types=1);

namespace Lattice\Chat\Enums;

enum ChatPartType: string
{
    case Text = 'chat.part.text';
    case ToolCall = 'chat.part.tool-call';
}
