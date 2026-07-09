<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support;

use BackedEnum;
use stdClass;

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

    /**
     * Materialize a value into its plain wire array by round-tripping through
     * JSON, realizing every nested JsonSerializable eagerly (inside the current
     * request) rather than lazily during the final response encode.
     *
     * @return array<mixed>
     */
    public static function toArray(mixed $value): array
    {
        return (array) json_decode(json_encode($value, JSON_THROW_ON_ERROR), true);
    }

    /**
     * Like toArray(), but decodes as objects instead of associative arrays, so
     * an empty map (wrapped via {@see map()} as an stdClass) survives the
     * round-trip as `{}` instead of collapsing to `[]`.
     */
    public static function toWire(mixed $value): mixed
    {
        return json_decode(json_encode($value, JSON_THROW_ON_ERROR), false);
    }

    /**
     * A wire map (`Record<string, X>` on the TS side) must serialize as a JSON
     * object even when empty; json_encode() cannot tell an empty PHP array
     * apart from an empty list, so an empty map is marked as an stdClass here,
     * at the source, before it enters any array-decoding round-trip.
     *
     * @param  array<string, mixed>  $map
     * @return array<string, mixed>|stdClass
     */
    public static function map(array $map): array|stdClass
    {
        return $map === [] ? new stdClass : $map;
    }
}
