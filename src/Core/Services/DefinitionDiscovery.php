<?php
declare(strict_types=1);

namespace Lattice\Lattice\Core\Services;

final class DefinitionDiscovery
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
}
