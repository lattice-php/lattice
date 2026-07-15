<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum ColorKind: string
{
    case Named = 'named';
    case Css = 'css';
}
