<?php
declare(strict_types=1);

namespace Lattice\Core\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum ColorKind: string
{
    case Named = 'named';
    case Css = 'css';
}
