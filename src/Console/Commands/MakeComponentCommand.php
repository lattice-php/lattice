<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Lattice\Lattice\Console\Commands\Concerns\GeneratesComponentPair;

final class MakeComponentCommand extends Command
{
    use GeneratesComponentPair;

    protected $signature = 'lattice:component {name} {--type=}';

    protected $description = 'Scaffold a custom Lattice UI component (PHP + React)';

    public function handle(): int
    {
        $name = $this->argument('name');
        $type = $this->option('type') ?: $this->typeFromName($name, '');
        $kebab = Str::kebab($name);

        $this->writeStub(
            'component.php.stub',
            app_path('Components/'.$name.'.php'),
            ['namespace' => 'App\\Components', 'class' => $name, 'type' => $type],
        );

        $this->writeStub(
            'component.tsx.stub',
            resource_path('js/lattice/components/'.$kebab.'.tsx'),
            ['class' => $name, 'type' => $type],
        );

        $this->registerInPlugin(
            resource_path('js/lattice/plugin.ts'),
            $type,
            $name.'Component',
            './components/'.$kebab,
        );

        $this->refreshTypes();

        $this->components->info("Component [$name] created with type [$type].");

        return self::SUCCESS;
    }
}
