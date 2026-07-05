<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Lattice\Lattice\Console\Commands\Concerns\GeneratesComponentPair;
use Lattice\Lattice\Forms\Enums\FieldType;

final class MakeFieldCommand extends Command
{
    use GeneratesComponentPair;

    protected $signature = 'lattice:field {name} {--type=} {--package=} {--force}';

    protected $description = 'Scaffold a custom Lattice form field (PHP + React)';

    public function handle(): int
    {
        $name = $this->argument('name');
        $type = $this->option('type') ?: $this->typeFromName($name, '');
        $attributeType = FieldType::localType($type);
        $wireType = FieldType::wireType($type);
        $kebab = Str::kebab($name);
        $force = (bool) $this->option('force');

        $target = $this->scaffoldTarget($name, $kebab, 'Forms/Fields', 'fields', 'App\\Forms\\Fields');

        $this->writeStub(
            'field.php.stub',
            $target['php'],
            ['namespace' => $target['namespace'], 'class' => $name, 'type' => $attributeType], force: $force);

        $this->writeStub(
            'field.tsx.stub',
            $target['tsx'],
            ['class' => $name, 'type' => $wireType], force: $force);

        $this->registerInPlugin($target['plugin'], $wireType, $name.'Component', $target['import']);

        if ($target['refresh']) {
            $this->refreshTypes();
        }

        $this->components->info("Field [$name] created with type [$wireType].");

        return self::SUCCESS;
    }
}
