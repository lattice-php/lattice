<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

use Lattice\Lattice\Attributes\TypeScript;

#[TypeScript]
enum ColumnType: string
{
    case Text = 'text';
    case Boolean = 'boolean';
    case Number = 'number';
    case Money = 'money';
    case Stack = 'stack';
    case Badge = 'badge';
    case Icon = 'icon';
    case Image = 'image';
}
