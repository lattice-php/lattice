<?php

namespace Lattice\Lattice\Core\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum PageLayout: string
{
    case App = 'app';
    case Auth = 'auth';
    case None = 'none';
}
