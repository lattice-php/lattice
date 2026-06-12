<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum ColumnType: string
{
    case Text = 'text';
    case Stack = 'stack';
}
