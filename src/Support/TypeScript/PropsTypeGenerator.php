<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use ReflectionClass;
use ReflectionProperty;

final class PropsTypeGenerator
{
    use MapsPhpTypeToTypeScript;

    /**
     * Returns a TypeScript object-type literal for the public properties of a class.
     *
     * When $ownPropertiesOnly is true, inherited properties (e.g. a column's `key`)
     * are excluded and only properties declared on $class itself are emitted.
     *
     * @param  class-string  $class
     */
    public function forClass(string $class, bool $ownPropertiesOnly = false): string
    {
        $reflection = new ReflectionClass($class);

        $properties = array_values(array_filter(
            $reflection->getProperties(ReflectionProperty::IS_PUBLIC),
            static fn (ReflectionProperty $p): bool => ! $p->isStatic()
                && (! $ownPropertiesOnly || $p->getDeclaringClass()->getName() === $class),
        ));

        usort(
            $properties,
            fn (ReflectionProperty $a, ReflectionProperty $b): int => $a->getName() <=> $b->getName(),
        );

        if ($properties === []) {
            return '{}';
        }

        $entries = array_map(
            fn (ReflectionProperty $p): string => sprintf('  %s: %s;', $p->getName(), $this->mapType($p)),
            $properties,
        );

        return "{\n".implode("\n", $entries)."\n}";
    }
}
