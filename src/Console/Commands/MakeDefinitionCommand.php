<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Lattice\Lattice\Console\Commands\Concerns\ResolvesScaffoldTarget;

/**
 * Base for the PHP-only definition generators (page, form, table, action, …).
 * Each subclass sets {@see $type}, {@see $directory}, and {@see $stub}.
 *
 * A bare name is written to app/Ui/{directory}/{Name}.php (the default UI
 * layer); a name with a path separator is placed verbatim under App, so
 * feature-first apps pass e.g. `Projects/Ui/Forms/RoleForm`. See
 * {@see ResolvesScaffoldTarget}. `--force` overwrites an existing file.
 */
abstract class MakeDefinitionCommand extends Command
{
    use ResolvesScaffoldTarget;

    protected string $type;

    protected string $directory;

    protected string $stub;

    public function handle(): int
    {
        $target = $this->resolveAppTarget((string) $this->argument('name'), $this->directory);

        if (File::exists($target['path']) && ! $this->option('force')) {
            $this->components->warn($this->type.' already exists: '.$target['path'].' (use --force to overwrite)');

            return self::FAILURE;
        }

        $contents = strtr(File::get(__DIR__.'/../stubs/'.$this->stub), [
            '{{ namespace }}' => $target['namespace'],
            '{{ class }}' => $target['class'],
            '{{ key }}' => Str::kebab($target['class']),
        ]);

        File::ensureDirectoryExists(dirname($target['path']));
        File::put($target['path'], $contents);

        $this->components->info($this->type.' ['.$target['namespace'].'\\'.$target['class'].'] created.');

        return self::SUCCESS;
    }
}
