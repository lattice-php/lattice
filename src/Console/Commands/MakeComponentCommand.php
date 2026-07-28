<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Console\Commands\Concerns\GeneratesComponentPair;

final class MakeComponentCommand extends Command
{
    use GeneratesComponentPair;

    protected $signature = 'lattice:component {name} {--type=} {--package=} {--force}';

    protected $description = 'Scaffold a custom Lattice UI component (PHP + React)';

    public function handle(): int
    {
        $name = (string) $this->argument('name');
        $target = $this->scaffoldTarget($name, 'Components', 'components');
        $class = $target['class'];
        $type = $this->option('type') ?: $this->typeFromName($class, '');
        $force = (bool) $this->option('force');

        $this->writeStub(
            'component.php.stub',
            $target['php'],
            ['namespace' => $target['namespace'], 'class' => $class, 'type' => $type], force: $force);

        $this->writeStub(
            'component.tsx.stub',
            $target['tsx'],
            ['class' => $class, 'type' => $type], force: $force);

        $this->registerInPlugin($target['plugin'], $type, $class.'Component', $target['import']);

        if ($target['refresh']) {
            $this->refreshTypes();
        }

        $this->components->info("Component [$class] created with type [$type].");

        return self::SUCCESS;
    }
}
