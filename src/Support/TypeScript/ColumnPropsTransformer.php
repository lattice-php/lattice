<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use ReflectionClass;
use ReflectionProperty;

final class ColumnPropsTransformer
{
    use MapsPhpTypeToTypeScript;

    /**
     * Returns a TypeScript object-type literal for the OWN public properties of
     * a column subclass (inherited properties like `key` are excluded).
     *
     * @param  class-string  $columnClass
     */
    public function forClass(string $columnClass): string
    {
        $reflection = new ReflectionClass($columnClass);

        $properties = array_values(array_filter(
            $reflection->getProperties(ReflectionProperty::IS_PUBLIC),
            static fn (ReflectionProperty $p): bool => ! $p->isStatic()
                && $p->getDeclaringClass()->getName() === $columnClass,
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
