<?php

declare(strict_types=1);

namespace Lattice\Lattice\Core\Services;

use Lattice\Lattice\Core\Contracts\DiscoversDefinitions;
use Lattice\Lattice\Core\DefinitionRegistry;
use Lattice\Lattice\Support\Discovery\ClassWalker;
use ReflectionClass;
use Spatie\Attributes\Attributes;
use Spatie\StructureDiscoverer\Cache\DiscoverCacheDriver;
use Spatie\StructureDiscoverer\Cache\LaravelDiscoverCacheDriver;
use Spatie\StructureDiscoverer\Support\DiscoverCacheDriverFactory;
use Throwable;

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

    public function cache(string $path): void
    {
        if (! is_dir($path)) {
            return;
        }

        $this->cacheDriver()->put($this->cacheId($path), $this->freshClasses($path));
    }

    public function forget(string $path): void
    {
        $this->cacheDriver()->forget($this->cacheId($path));
    }

    /**
     * Returns the cached class list when the path has been warmed, otherwise a
     * fresh walk. The cache is never written here, so an un-warmed app always
     * sees current classes; warming happens explicitly via `lattice:discover-cache`.
     *
     * @return list<class-string>
     */
    private function classesIn(string $path): array
    {
        try {
            $driver = $this->cacheDriver();
            $id = $this->cacheId($path);

            if ($driver->has($id)) {
                return $driver->get($id);
            }
        } catch (Throwable) {
            // The cache is an optimisation, never a dependency: an unavailable or
            // unconfigured cache store must not break discovery. Fall back to a walk.
        }

        return $this->freshClasses($path);
    }

    /**
     * @return list<class-string>
     */
    private function freshClasses(string $path): array
    {
        return ClassWalker::classes($path);
    }

    private function cacheDriver(): DiscoverCacheDriver
    {
        return DiscoverCacheDriverFactory::create(
            config('structure-discoverer.cache', ['driver' => LaravelDiscoverCacheDriver::class, 'store' => null]),
        );
    }

    private function cacheId(string $path): string
    {
        return 'lattice-definitions-'.md5($path);
    }
}
