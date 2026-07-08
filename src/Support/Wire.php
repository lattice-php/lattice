<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support;

use BackedEnum;

/**
 * Helpers for turning PHP values into the scalar shape the frontend receives.
 */
final class Wire
{
    /**
     * The wire scalar for a value that may be a backed enum: the enum's value
     * cast to a string, or the value unchanged. Null passes through.
     *
     * @return ($value is null ? null : string)
     */
    public static function scalar(BackedEnum|string|null $value): ?string
    {
        return $value instanceof BackedEnum ? (string) $value->value : $value;
    }
}
