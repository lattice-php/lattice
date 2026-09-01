<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum Align: string
{
    case Center = 'center';
    case End = 'end';
    case Start = 'start';
    case Stretch = 'stretch';
}
