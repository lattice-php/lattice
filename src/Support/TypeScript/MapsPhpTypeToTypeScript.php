<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use BackedEnum;
use ReflectionNamedType;
use ReflectionProperty;

trait MapsPhpTypeToTypeScript
{
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
