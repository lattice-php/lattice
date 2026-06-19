<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

final class MakeTableCommand extends MakeDefinitionCommand
{
    protected $signature = 'lattice:table {name} {--force}';

    protected $description = 'Scaffold a Lattice table';

    protected string $type = 'Table';

    protected string $directory = 'Tables';

    protected string $stub = 'table.php.stub';
}
