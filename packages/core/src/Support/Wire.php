<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support;

use BackedEnum;
use JsonException;
use JsonSerializable;
use stdClass;
use UnitEnum;

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
     * Materialize a value into its plain wire array, realizing every nested
     * JsonSerializable eagerly (inside the current request) rather than lazily
     * during the final response encode. Maps arrive as assoc arrays, so an
     * empty map collapses to `[]` — use {@see toWire()} where the `{}` vs `[]`
     * distinction must survive.
     *
     * @return array<mixed>
     */
    public static function toArray(mixed $value): array
    {
        return (array) self::materialize($value, assoc: true);
    }

    /**
     * Like {@see toArray()}, but keeps map shape: every map — a string-keyed
     * array, a non-list one, or an stdClass from {@see map()} — comes back as
     * an stdClass, so an empty map reaches the final encode as `{}` instead of
     * collapsing to `[]` and downstream walks can tell maps from lists.
     */
    public static function toWire(mixed $value): mixed
    {
        return self::materialize($value, assoc: false);
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

    /**
     * The recursive walk behind {@see toArray()}/{@see toWire()}: the same
     * realization a json_encode/json_decode round-trip produces — nested
     * JsonSerializable resolved, backed enums to their values, objects to
     * their public properties — without encoding the whole tree to a string
     * and back on every request.
     */
    private static function materialize(mixed $value, bool $assoc): mixed
    {
        if ($value instanceof JsonSerializable) {
            return self::materialize($value->jsonSerialize(), $assoc);
        }

        if ($value instanceof BackedEnum) {
            return $value->value;
        }

        if ($value instanceof UnitEnum) {
            throw new JsonException(sprintf('Non-backed enum [%s] has no wire representation.', $value::class));
        }

        if (is_object($value)) {
            $properties = array_map(
                fn (mixed $property): mixed => self::materialize($property, $assoc),
                get_object_vars($value),
            );

            return $assoc ? $properties : (object) $properties;
        }

        if (is_array($value)) {
            $items = array_map(fn (mixed $item): mixed => self::materialize($item, $assoc), $value);

            return $assoc || array_is_list($items) ? $items : (object) $items;
        }

        return $value;
    }
}
