<?php

namespace Lattice\Lattice\Core\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum Justify: string
{
    case Start = 'start';
    case Center = 'center';
    case End = 'end';
    case Between = 'between';
    case Around = 'around';
    case Evenly = 'evenly';
}
