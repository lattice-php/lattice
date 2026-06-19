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

    protected $signature = 'lattice:field {name} {--type=} {--force}';

    protected $description = 'Scaffold a custom Lattice form field (PHP + React)';

    public function handle(): int
    {
        $name = $this->argument('name');
        $type = $this->option('type') ?: $this->typeFromName($name, '');
        $attributeType = FieldType::localType($type);
        $wireType = FieldType::wireType($type);
        $kebab = Str::kebab($name);
        $force = (bool) $this->option('force');

        $this->writeStub(
            'field.php.stub',
            app_path('Forms/Fields/'.$name.'.php'),
            ['namespace' => 'App\\Forms\\Fields', 'class' => $name, 'type' => $attributeType], force: $force);

        $this->writeStub(
            'field.tsx.stub',
            resource_path('js/fields/'.$kebab.'.tsx'),
            ['class' => $name, 'type' => $wireType], force: $force);

        $this->registerInPlugin(
            resource_path('js/registry.ts'),
            $wireType,
            $name.'Component',
            './fields/'.$kebab,
        );

        $this->refreshTypes();

        $this->components->info("Field [$name] created with type [$wireType].");

        return self::SUCCESS;
    }
}
