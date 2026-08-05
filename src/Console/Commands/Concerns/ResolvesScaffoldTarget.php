<?php
declare(strict_types=1);

namespace Lattice\Console\Commands\Concerns;

trait ResolvesScaffoldTarget
{
    /**
     * Resolve where an app-scaffolded class lands from its name.
     *
     * A bare name (no path separator) uses the default UI namespace, so all
     * generated Lattice classes sit under one adapter layer separate from the
     * domain:
     *
     *   "RoleForm" + "Forms"  ->  App\Ui\Forms\RoleForm   (app/Ui/Forms/RoleForm.php)
     *
     * A name containing a path separator is an explicit location under App —
     * the caller owns the whole path, including whether there is a Ui or type
     * segment. This is the escape hatch for feature-first apps:
     *
     *   "Projects/Ui/Forms/RoleForm"  ->  App\Projects\Ui\Forms\RoleForm
     *
     * `/` and `\` are treated identically, so a slash-form name never needs
     * shell escaping.
     *
     * @return array{class: string, namespace: string, path: string}
     */
    protected function resolveAppTarget(string $name, string $typeDirectory): array
    {
        $relative = trim(str_replace('\\', '/', $name), '/');

        if ($relative === '') {
            throw new \InvalidArgumentException('A class name is required.');
        }

        if (! str_contains($relative, '/')) {
            $relative = 'Ui/'.trim($typeDirectory, '/').'/'.$relative;
        }

        $class = basename($relative);
        $directory = dirname($relative);
        $directory = $directory === '.' ? '' : $directory;
        $namespace = 'App'.($directory !== '' ? '\\'.str_replace('/', '\\', $directory) : '');

        return [
            'class' => $class,
            'namespace' => $namespace,
            'path' => app_path($relative.'.php'),
        ];
    }
}
