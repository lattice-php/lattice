<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Discovery;

use Bambamboole\Lattice\Core\Contracts\DiscoversDefinitions;
use Bambamboole\Lattice\Core\DefinitionRegistry;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use ReflectionClass;
use Spatie\Attributes\Attributes;
use SplFileInfo;

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

        $basePath = realpath($path);

        if ($basePath === false || ! is_dir($basePath)) {
            return $definitions;
        }

        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($basePath));

        foreach ($files as $file) {
            if (! $file instanceof SplFileInfo || $file->getExtension() !== 'php') {
                continue;
            }

            $class = $this->classForFile($file, $basePath, $namespace);

            if (! class_exists($class)) {
                continue;
            }

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

    private function classForFile(SplFileInfo $file, string $basePath, string $namespace): string
    {
        $relativePath = substr($file->getPathname(), strlen($basePath) + 1);
        $relativeClass = substr($relativePath, 0, -4);
        $relativeClass = str_replace(DIRECTORY_SEPARATOR, '\\', $relativeClass);

        return trim($namespace, '\\').'\\'.$relativeClass;
    }
}
