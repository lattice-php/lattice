<?php
declare(strict_types=1);

namespace Lattice\Console\Commands;

use Illuminate\Console\Command;
use Lattice\Console\Commands\Concerns\GeneratesComponentPair;
use Lattice\Table\Enums\ColumnType;

final class MakeColumnCommand extends Command
{
    use GeneratesComponentPair;

    protected $signature = 'lattice:column {name} {--type=} {--package=} {--force}';

    protected $description = 'Scaffold a custom Lattice table column (PHP + React cell)';

    public function handle(): int
    {
        $target = $this->scaffoldTarget((string) $this->argument('name'), 'Tables/Columns', 'columns');
        $type = $this->option('type') ?: $this->typeFromName($target['class'], '');

        return $this->writePair(
            'Column',
            $target,
            'column',
            ColumnType::localType($type),
            $type,
            ColumnType::wireType($type),
            'Cell',
            blockKey: '"table.columns"',
            entryWrapper: null,
        );
    }
}
