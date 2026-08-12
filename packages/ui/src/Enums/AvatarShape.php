<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum AvatarShape: string
{
    case Circle = 'circle';
    case Rounded = 'rounded';
}
