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
     * A wire map (`Record<…, X>` on the TS side) must serialize as a JSON object,
     * not an array. json_encode() emits `[]` for an empty PHP array and a JSON
     * array for any sequential-integer-keyed one — neither matches a map type.
     * Marking such a map as an stdClass at the source guarantees an object shape
     * (`{}` when empty) that survives the serialization round-trips.
     *
     * An already-string-keyed, non-empty map is left as an array — it already
     * encodes to an object — so only the ambiguous cases become stdClass.
     *
     * @param  array<array-key, mixed>  $map
     * @return array<array-key, mixed>|stdClass
     */
    public static function map(array $map): array|stdClass
    {
        return $map === [] || array_is_list($map) ? (object) $map : $map;
    }
}
