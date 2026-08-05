<?php
declare(strict_types=1);

namespace Lattice\Core\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum PageLayout: string
{
    case App = 'app';
    case Auth = 'auth';
    case None = 'none';
}
