<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Console\Commands\Concerns\GeneratesComponentPair;
use Lattice\Lattice\Forms\Enums\FieldType;

final class MakeFieldCommand extends Command
{
    use GeneratesComponentPair;

    protected $signature = 'lattice:field {name} {--type=} {--package=} {--force}';

    protected $description = 'Scaffold a custom Lattice form field (PHP + React)';

    public function handle(): int
    {
        $name = (string) $this->argument('name');
        $target = $this->scaffoldTarget($name, 'Forms/Fields', 'fields');
        $class = $target['class'];
        $type = $this->option('type') ?: $this->typeFromName($class, '');
        $attributeType = FieldType::localType($type);
        $wireType = FieldType::wireType($type);
        $force = (bool) $this->option('force');

        $this->writeStub(
            'field.php.stub',
            $target['php'],
            ['namespace' => $target['namespace'], 'class' => $class, 'type' => $attributeType], force: $force);

        $this->writeStub(
            'field.tsx.stub',
            $target['tsx'],
            ['class' => $class, 'type' => $wireType], force: $force);

        $this->registerInPlugin($target['plugin'], $wireType, $class.'Component', $target['import']);

        if ($target['refresh']) {
            $this->refreshTypes();
        }

        $this->components->info("Field [$class] created with type [$wireType].");

        return self::SUCCESS;
    }
}
