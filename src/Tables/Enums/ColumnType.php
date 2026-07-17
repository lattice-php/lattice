<?php
declare(strict_types=1);

namespace Lattice\Lattice\Tables\Enums;

enum ColumnType: string
{
    private const string Prefix = 'column.';

    case Text = 'column.text';
    case Boolean = 'column.boolean';
    case Number = 'column.number';
    case Money = 'column.money';
    case Stack = 'column.stack';
    case Badge = 'column.badge';
    case Icon = 'column.icon';
    case Image = 'column.image';

    public static function wireType(self|string $type): string
    {
        if ($type instanceof self) {
            return $type->value;
        }

        return str_starts_with($type, self::Prefix) ? $type : self::Prefix.$type;
    }

    public static function localType(self|string $type): string
    {
        $value = $type instanceof self ? $type->value : $type;

        return str_starts_with($value, self::Prefix) ? substr($value, strlen(self::Prefix)) : $value;
    }
}
