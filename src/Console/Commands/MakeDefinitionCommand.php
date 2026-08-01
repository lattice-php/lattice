<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Lattice\Lattice\Console\Commands\Concerns\ResolvesScaffoldTarget;

/**
 * The PHP-only definition generators (page, form, table, action, …): one
 * command instance per {@see self::TYPES} row, registered via {@see self::all()}.
 *
 * A bare name is written to app/Ui/{directory}/{Name}.php (the default UI
 * layer); a name with a path separator is placed verbatim under App, so
 * feature-first apps pass e.g. `Projects/Ui/Forms/RoleForm`. See
 * {@see ResolvesScaffoldTarget}. `--force` overwrites an existing file.
 */
final class MakeDefinitionCommand extends Command
{
    use ResolvesScaffoldTarget;

    private const array TYPES = [
        'page' => ['Page', 'Pages', 'page.php.stub'],
        'form' => ['Form', 'Forms', 'form.php.stub'],
        'table' => ['Table', 'Tables', 'table.php.stub'],
        'action' => ['Action', 'Actions', 'action.php.stub'],
        'bulk-action' => ['Bulk action', 'Actions', 'bulk-action.php.stub'],
        'fragment' => ['Fragment', 'Fragments', 'fragment.php.stub'],
        'layout' => ['Layout', 'Layouts', 'layout.php.stub'],
        'remote-source' => ['Remote source', 'Remote', 'remote-source.php.stub'],
    ];

    /** @return list<self> */
    public static function all(): array
    {
        return array_map(
            fn (string $command): self => new self($command, ...self::TYPES[$command]),
            array_keys(self::TYPES),
        );
    }

    private function __construct(
        string $command,
        private readonly string $type,
        private readonly string $directory,
        private readonly string $stub,
    ) {
        $this->signature = "lattice:{$command} {name} {--force}";
        $this->description = 'Scaffold a Lattice '.strtolower($type);

        parent::__construct();
    }

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
