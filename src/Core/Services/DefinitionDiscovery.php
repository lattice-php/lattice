<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Services;

use Lattice\Lattice\Core\Contracts\Discoverable;
use Lattice\Lattice\Core\Contracts\DiscoversDefinitions;
use Lattice\Lattice\Support\Discovery\ClassWalker;
use ReflectionClass;
use Spatie\Attributes\Attributes;

final class DefinitionDiscovery implements DiscoversDefinitions
{
    /**
     * The configured discover paths, normalised to a [path => namespace] map.
     *
     * @return array<string, string>
     */
    public static function configuredPaths(): array
    {
        $configured = config('lattice.discover', []);

        if (! is_array($configured)) {
            return [];
        }

        $paths = [];

        foreach ($configured as $path => $namespace) {
            // Support both "path => namespace" and ["path" => ..., "namespace" => ...] forms.
            if (is_array($namespace)) {
                $path = $namespace['path'] ?? null;
                $namespace = $namespace['namespace'] ?? null;
            }

            if (is_string($path) && is_string($namespace)) {
                $paths[$path] = $namespace;
            }
        }

        return $paths;
    }

    /**
     * @param  array<int, Discoverable>  $registries
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

        foreach ($this->classesIn($path) as $class) {
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

    /**
     * @return list<class-string>
     */
    private function classesIn(string $path): array
    {
        return ClassWalker::classes($path);
    }
}
