<?php

declare(strict_types=1);

namespace Lattice\Lattice\Chat\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum ChatRole: string
{
    case User = 'user';
    case Assistant = 'assistant';
    case System = 'system';
}
