<?php

declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

enum ColumnType: string
{
    case Text = 'text';
    case Stack = 'stack';
}
