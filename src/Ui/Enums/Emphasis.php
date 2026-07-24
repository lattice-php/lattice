<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum Emphasis: string
{
    case Solid = 'solid';
    case Outline = 'outline';
    case Ghost = 'ghost';
    case Link = 'link';
}
