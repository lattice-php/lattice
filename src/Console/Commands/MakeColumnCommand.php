<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Lattice\Console\Commands\Concerns\GeneratesComponentPair;
use Lattice\Lattice\Tables\Enums\ColumnType;

final class MakeColumnCommand extends Command
{
    use GeneratesComponentPair;

    protected $signature = 'lattice:column {name} {--type=} {--package=} {--force}';

    protected $description = 'Scaffold a custom Lattice table column (PHP + React cell)';

    public function handle(): int
    {
        $name = (string) $this->argument('name');
        $target = $this->scaffoldTarget($name, 'Tables/Columns', 'columns');
        $class = $target['class'];
        $type = $this->option('type') ?: $this->typeFromName($class, '');
        $attributeType = ColumnType::localType($type);
        $wireType = ColumnType::wireType($type);
        $force = (bool) $this->option('force');

        $this->writeStub(
            'column.php.stub',
            $target['php'],
            ['namespace' => $target['namespace'], 'class' => $class, 'type' => $attributeType], force: $force);

        $this->writeStub(
            'column.tsx.stub',
            $target['tsx'],
            ['class' => $class, 'type' => $type], force: $force);

        $this->registerInPlugin(
            $target['plugin'],
            $wireType,
            $class.'Cell',
            $target['import'],
            blockKey: 'columns',
            entryWrapper: null,
        );

        if ($target['refresh']) {
            $this->refreshTypes();
        }

        $this->components->info("Column [$class] created with type [$wireType].");

        return self::SUCCESS;
    }
}
