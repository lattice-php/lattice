<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum Emphasis: string
{
    case Solid = 'solid';
    case Outline = 'outline';
    case Ghost = 'ghost';
    case Link = 'link';
}
