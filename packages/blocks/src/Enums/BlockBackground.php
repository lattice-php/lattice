<?php
declare(strict_types=1);

namespace Lattice\Blocks\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum BlockBackground: string
{
    case None = 'none';
    case Muted = 'muted';
    case Inverted = 'inverted';
    case Primary = 'primary';
}
