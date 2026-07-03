<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum DateTimeStyle: string
{
    case Full = 'full';
    case Long = 'long';
    case Medium = 'medium';
    case Short = 'short';
}
