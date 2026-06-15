<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Lattice\Lattice\Console\Commands\Concerns\GeneratesComponentPair;

final class MakeColumnCommand extends Command
{
    use GeneratesComponentPair;

    protected $signature = 'lattice:column {name} {--type=}';

    protected $description = 'Scaffold a custom Lattice table column (PHP + React cell)';

    public function handle(): int
    {
        $name = $this->argument('name');
        $type = $this->option('type') ?: $this->typeFromName($name, 'column.');
        $kebab = Str::kebab($name);

        $this->writeStub(
            'column.php.stub',
            app_path('Tables/Columns/'.$name.'.php'),
            ['namespace' => 'App\\Tables\\Columns', 'class' => $name, 'type' => $type],
        );

        $this->writeStub(
            'column.tsx.stub',
            resource_path('js/lattice/columns/'.$kebab.'.tsx'),
            ['class' => $name, 'type' => $type],
        );

        $this->registerInPlugin(
            resource_path('js/lattice/columns.ts'),
            $type,
            $name.'Cell',
            './columns/'.$kebab,
            blockKey: 'columns',
            entryWrapper: null,
        );

        $this->refreshTypes();

        $this->components->info("Column [$name] created with type [$type].");

        return self::SUCCESS;
    }
}
