<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Lattice\Lattice\Console\Commands\Concerns\GeneratesComponentPair;
use Lattice\Lattice\Tables\Enums\ColumnType;

final class MakeColumnCommand extends Command
{
    use GeneratesComponentPair;

    protected $signature = 'lattice:column {name} {--type=} {--package=} {--force}';

    protected $description = 'Scaffold a custom Lattice table column (PHP + React cell)';

    public function handle(): int
    {
        $name = $this->argument('name');
        $type = $this->option('type') ?: $this->typeFromName($name, '');
        $attributeType = ColumnType::localType($type);
        $wireType = ColumnType::wireType($type);
        $kebab = Str::kebab($name);
        $force = (bool) $this->option('force');

        $target = $this->scaffoldTarget($name, $kebab, 'Tables/Columns', 'columns', 'App\\Tables\\Columns');

        $this->writeStub(
            'column.php.stub',
            $target['php'],
            ['namespace' => $target['namespace'], 'class' => $name, 'type' => $attributeType], force: $force);

        $this->writeStub(
            'column.tsx.stub',
            $target['tsx'],
            ['class' => $name, 'type' => $type], force: $force);

        $this->registerInPlugin(
            $target['plugin'],
            $wireType,
            $name.'Cell',
            $target['import'],
            blockKey: 'columns',
            entryWrapper: null,
        );

        if ($target['refresh']) {
            $this->refreshTypes();
        }

        $this->components->info("Column [$name] created with type [$wireType].");

        return self::SUCCESS;
    }
}
