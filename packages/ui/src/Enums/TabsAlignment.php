<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum TabsAlignment: string
{
    case Start = 'start';
    case Center = 'center';
    case End = 'end';
    case Stretch = 'stretch';
}
