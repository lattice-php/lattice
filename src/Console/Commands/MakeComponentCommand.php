<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Lattice\Lattice\Console\Commands\Concerns\GeneratesComponentPair;

final class MakeComponentCommand extends Command
{
    use GeneratesComponentPair;

    protected $signature = 'lattice:component {name} {--type=} {--package=} {--force}';

    protected $description = 'Scaffold a custom Lattice UI component (PHP + React)';

    public function handle(): int
    {
        $name = $this->argument('name');
        $type = $this->option('type') ?: $this->typeFromName($name, '');
        $kebab = Str::kebab($name);
        $force = (bool) $this->option('force');

        $target = $this->scaffoldTarget($name, $kebab, 'Components', 'components', 'App\\Components');

        $this->writeStub(
            'component.php.stub',
            $target['php'],
            ['namespace' => $target['namespace'], 'class' => $name, 'type' => $type], force: $force);

        $this->writeStub(
            'component.tsx.stub',
            $target['tsx'],
            ['class' => $name, 'type' => $type], force: $force);

        $this->registerInPlugin($target['plugin'], $type, $name.'Component', $target['import']);

        if ($target['refresh']) {
            $this->refreshTypes();
        }

        $this->components->info("Component [$name] created with type [$type].");

        return self::SUCCESS;
    }
}
