<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Enums\Concerns;

/**
 * Shared wire-type conversions for a string-backed enum whose cases all carry a
 * common `Prefix` (e.g. `field.` or `column.`). The using enum declares only the
 * `Prefix` constant; this trait adds prefix-aware {@see wireType()}/{@see localType()}.
 */
trait HasPrefixedWireType
{
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
