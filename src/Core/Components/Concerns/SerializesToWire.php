<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Components\Concerns;

use BackedEnum;
use ReflectionClass;
use ReflectionProperty;

/**
 * The shared wire-serialization convention for every node family (components,
 * table columns, table filters): a public typed property is a wire prop, a
 * protected one is internal state. `decorateProps()` is the single seam where a
 * cross-cutting prop concern is injected before serialization.
 */
trait SerializesToWire
{
    /**
     * @var array<class-string, list<ReflectionProperty>>
     */
    private static array $wirePropertyCache = [];

    /**
     * Reflects the public typed properties (including inherited and trait
     * properties) into the full wire shape: every initialized prop is emitted,
     * keeping null and empty-array values so the payload mirrors the generated
     * type one-to-one. Backed enums serialize to their value.
     *
     * @return array<string, mixed>
     */
    protected function wireProps(): array
    {
        $props = [];

        foreach (self::wireProperties(static::class) as $property) {
            if (! $property->isInitialized($this)) {
                continue;
            }

            $value = $property->getValue($this);

            $props[$property->getName()] = $value instanceof BackedEnum ? $value->value : $value;
        }

        return $props;
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<string, mixed>
     */
    protected function decorateProps(array $props): array
    {
        return $props;
    }

    /**
     * @param  class-string  $class
     * @return list<ReflectionProperty>
     */
    private static function wireProperties(string $class): array
    {
        return self::$wirePropertyCache[$class] ??= array_values(array_filter(
            new ReflectionClass($class)->getProperties(ReflectionProperty::IS_PUBLIC),
            static fn (ReflectionProperty $property): bool => ! $property->isStatic(),
        ));
    }
}
