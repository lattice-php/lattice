<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * Base for the PHP-only definition generators (page, form, table, action, …).
 * Each subclass sets {@see $type}, {@see $directory}, and {@see $stub}; the
 * class is written to app/{directory}/{Name}.php, supporting nested names
 * (e.g. `Teams/CreateTeam`) and an opt-in `--force` overwrite.
 */
abstract class MakeDefinitionCommand extends Command
{
    /** Human label, e.g. "Page". */
    protected string $type;

    /** Target directory under app/, e.g. "Pages". */
    protected string $directory;

    /** Stub filename, e.g. "page.php.stub". */
    protected string $stub;

    public function handle(): int
    {
        $name = ltrim(str_replace('/', '\\', (string) $this->argument('name')), '\\');
        $class = class_basename($name);
        $subNamespace = trim(Str::beforeLast($name, $class), '\\');

        $namespace = 'App\\'.$this->directory.($subNamespace !== '' ? '\\'.$subNamespace : '');
        $target = app_path($this->directory.'/'.str_replace('\\', '/', $name).'.php');

        if (File::exists($target) && ! $this->option('force')) {
            $this->components->warn($this->type.' already exists: '.$target.' (use --force to overwrite)');

            return self::FAILURE;
        }

        $contents = strtr(File::get(__DIR__.'/../stubs/'.$this->stub), [
            '{{ namespace }}' => $namespace,
            '{{ class }}' => $class,
            '{{ key }}' => Str::kebab($class),
        ]);

        File::ensureDirectoryExists(dirname($target));
        File::put($target, $contents);

        $this->components->info($this->type.' ['.$namespace.'\\'.$class.'] created.');

        return self::SUCCESS;
    }
}
