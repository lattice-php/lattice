<?php
declare(strict_types=1);

namespace Lattice\Lattice\Ui\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum PageLayout: string
{
    case App = 'app';
    case Auth = 'auth';
    case None = 'none';
}
