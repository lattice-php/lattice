<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Services;

use Lattice\Lattice\Core\Contracts\DiscoversDefinitions;
use Lattice\Lattice\Core\DefinitionRegistry;
use ReflectionClass;
use Spatie\Attributes\Attributes;
use Spatie\StructureDiscoverer\Discover;

final class DefinitionDiscovery implements DiscoversDefinitions
{
    /**
     * @param  array<int, DefinitionRegistry<*>>  $registries
     * @return array<string, array<int, class-string>>
     */
    public function discover(string $path, string $namespace, array $registries): array
    {
        $definitions = [];

        foreach ($registries as $registry) {
            $definitions[$registry->group()] = [];
        }

        if (! is_dir($path)) {
            return $definitions;
        }

        // Construct Discover directly instead of Discover::in(): the container binding
        // injects a cache driver whose entry is keyed only by directory, which collides
        // with the typescript-transformer discovering the same directory in-process.
        /** @var list<class-string> $classes */
        $classes = (new Discover(directories: [$path]))->classes()->get();

        foreach ($classes as $class) {
            if ((new ReflectionClass($class))->isAbstract()) {
                continue;
            }

            foreach ($registries as $registry) {
                if (Attributes::has($class, $registry->attributeClass())) {
                    $definitions[$registry->group()][] = $class;
                }
            }
        }

        return $definitions;
    }
}
