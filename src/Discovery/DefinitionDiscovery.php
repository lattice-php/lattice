<?php

declare(strict_types=1);

namespace Bambamboole\Lattice\Discovery;

use Bambamboole\Lattice\Actions\ActionDefinition;
use Bambamboole\Lattice\Attributes\Action;
use Bambamboole\Lattice\Attributes\Form;
use Bambamboole\Lattice\Attributes\Fragment;
use Bambamboole\Lattice\Attributes\Table;
use Bambamboole\Lattice\Forms\FormDefinition;
use Bambamboole\Lattice\Fragments\FragmentDefinition;
use Bambamboole\Lattice\Tables\TableDefinition;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use ReflectionClass;
use SplFileInfo;

final class DefinitionDiscovery
{
    /**
     * @return array{forms: array<int, class-string<FormDefinition>>, tables: array<int, class-string<TableDefinition>>, actions: array<int, class-string<ActionDefinition>>, fragments: array<int, class-string<FragmentDefinition>>}
     */
    public function discover(string $path, string $namespace): array
    {
        $basePath = realpath($path);

        if ($basePath === false || ! is_dir($basePath)) {
            return [
                'forms' => [],
                'tables' => [],
                'actions' => [],
                'fragments' => [],
            ];
        }

        $definitions = [
            'forms' => [],
            'tables' => [],
            'actions' => [],
            'fragments' => [],
        ];

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

            if ($this->hasDefinitionAttribute($reflection, Form::class) && is_subclass_of($class, FormDefinition::class)) {
                $definitions['forms'][] = $class;
            }

            if ($this->hasDefinitionAttribute($reflection, Table::class) && is_subclass_of($class, TableDefinition::class)) {
                $definitions['tables'][] = $class;
            }

            if ($this->hasDefinitionAttribute($reflection, Action::class) && is_subclass_of($class, ActionDefinition::class)) {
                $definitions['actions'][] = $class;
            }

            if ($this->hasDefinitionAttribute($reflection, Fragment::class) && is_subclass_of($class, FragmentDefinition::class)) {
                $definitions['fragments'][] = $class;
            }
        }

        return $definitions;
    }

    /**
     * @param  class-string  $attribute
     * @param  ReflectionClass<object>  $reflection
     */
    private function hasDefinitionAttribute(ReflectionClass $reflection, string $attribute): bool
    {
        return $reflection->getAttributes($attribute) !== [];
    }

    private function classForFile(SplFileInfo $file, string $basePath, string $namespace): string
    {
        $relativePath = substr($file->getPathname(), strlen($basePath) + 1);
        $relativeClass = substr($relativePath, 0, -4);
        $relativeClass = str_replace(DIRECTORY_SEPARATOR, '\\', $relativeClass);

        return trim($namespace, '\\').'\\'.$relativeClass;
    }
}
