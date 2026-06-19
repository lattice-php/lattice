<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

final class MakeLayoutCommand extends MakeDefinitionCommand
{
    protected $signature = 'lattice:layout {name} {--force}';

    protected $description = 'Scaffold a Lattice layout';

    protected string $type = 'Layout';

    protected string $directory = 'Layouts';

    protected string $stub = 'layout.php.stub';
}
