<?php
declare(strict_types=1);

namespace Lattice\Search\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum SearchMode: string
{
    case Results = 'results';
    case Recent = 'recent';
}
