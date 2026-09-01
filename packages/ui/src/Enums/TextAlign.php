<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum TextAlign: string
{
    case Left = 'left';
    case Center = 'center';
}
