<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum ButtonVariant: string
{
    case Default = 'default';
    case Destructive = 'destructive';
    case Ghost = 'ghost';
    case Info = 'info';
    case Link = 'link';
    case Outline = 'outline';
    case Secondary = 'secondary';
    case Success = 'success';
}
