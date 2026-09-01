<?php

declare(strict_types=1);

namespace Lattice\Form\Enums;

use Lattice\Core\Attributes\TypeScript;

#[TypeScript]
enum RowLayout: string
{
    case Stack = 'stack';
    case Table = 'table';
    case Grid = 'grid';
}
