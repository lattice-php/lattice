<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Lattice\Lattice\Attributes\Component as ComponentAttribute;
use Lattice\Lattice\Forms\Components\Field;
use Lattice\Lattice\Tables\Columns\Column;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use ReflectionClass;
use SplFileInfo;

final class ComponentDiscovery
{
    /**
     * @return list<DiscoveredComponent>
     */
    public function discover(string $path, string $namespace): array
    {
        $basePath = realpath($path);

        if ($basePath === false || ! is_dir($basePath)) {
            return [];
        }

        $discovered = [];

        $files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($basePath));

        foreach ($files as $file) {
            if (! $file instanceof SplFileInfo || $file->getExtension() !== 'php') {
                continue;
            }

            $class = $this->classForFile($file, $basePath, $namespace);

            if (! class_exists($class)) {
                continue;
            }

            $reflection = new ReflectionClass($class);

            if ($reflection->isAbstract()) {
                continue;
            }

            $attributes = $reflection->getAttributes(ComponentAttribute::class);

            if ($attributes === []) {
                continue;
            }

            $attribute = $attributes[0]->newInstance();

            $discovered[] = new DiscoveredComponent(
                class: $class,
                type: $attribute->type,
                container: $attribute->container,
                interactive: $attribute->interactive,
                category: $this->categoryFor($class),
            );
        }

        return $discovered;
    }

    /**
     * @param  class-string  $class
     * @return 'component'|'field'|'column'
     */
    private function categoryFor(string $class): string
    {
        return match (true) {
            is_subclass_of($class, Field::class) => 'field',
            is_subclass_of($class, Column::class) => 'column',
            default => 'component',
        };
    }

    private function classForFile(SplFileInfo $file, string $basePath, string $namespace): string
    {
        $relativePath = substr($file->getPathname(), strlen($basePath) + 1);
        $relativeClass = substr($relativePath, 0, -4);
        $relativeClass = str_replace(DIRECTORY_SEPARATOR, '\\', $relativeClass);

        return trim($namespace, '\\').'\\'.$relativeClass;
    }
}
