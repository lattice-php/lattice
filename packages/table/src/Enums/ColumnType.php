<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

use Lattice\Lattice\Core\Enums\Concerns\HasPrefixedWireType;

enum ColumnType: string
{
    use HasPrefixedWireType;

    private const string Prefix = 'column.';

    case Text = 'column.text';
    case Boolean = 'column.boolean';
    case Number = 'column.number';
    case Money = 'column.money';
    case Stack = 'column.stack';
    case Badge = 'column.badge';
    case Icon = 'column.icon';
    case Image = 'column.image';
}
