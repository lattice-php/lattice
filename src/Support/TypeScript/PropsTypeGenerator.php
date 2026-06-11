<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use BackedEnum;
use ReflectionClass;
use ReflectionNamedType;
use ReflectionProperty;

final class PropsTypeGenerator
{
    /**
     * Returns a TypeScript object-type literal for the public properties of a class.
     *
     * @param  class-string  $class
     */
    public function forClass(string $class): string
    {
        $reflection = new ReflectionClass($class);

        $properties = array_values(array_filter(
            $reflection->getProperties(ReflectionProperty::IS_PUBLIC),
            static fn (ReflectionProperty $p): bool => ! $p->isStatic(),
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

    private function mapType(ReflectionProperty $property): string
    {
        $type = $property->getType();

        if (! $type instanceof ReflectionNamedType) {
            return 'unknown';
        }

        $tsType = $this->mapNamedType($type);

        if ($type->allowsNull() && $tsType !== 'unknown') {
            return $tsType.' | null';
        }

        return $tsType;
    }

    private function mapNamedType(ReflectionNamedType $type): string
    {
        if ($type->isBuiltin()) {
            return match ($type->getName()) {
                'string' => 'string',
                'int', 'float' => 'number',
                'bool' => 'boolean',
                'array' => 'unknown[]',
                default => 'unknown',
            };
        }

        $name = $type->getName();

        if (class_exists($name) && is_subclass_of($name, BackedEnum::class)) {
            return 'string';
        }

        return 'unknown';
    }
}
