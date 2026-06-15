<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat\Enums;

enum ChatPartType: string
{
    case Text = 'text';
    case ToolCall = 'tool-call';
}
