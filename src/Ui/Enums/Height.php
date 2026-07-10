<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum Height: string
{
    case Full = 'full';
    case Screen = 'screen';
}
