<?php
declare(strict_types=1);

namespace Lattice\Ui\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum Height: string
{
    case Full = 'full';
    case Screen = 'screen';
}
