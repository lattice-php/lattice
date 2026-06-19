<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

final class MakeActionCommand extends MakeDefinitionCommand
{
    protected $signature = 'lattice:action {name} {--force}';

    protected $description = 'Scaffold a Lattice action';

    protected string $type = 'Action';

    protected string $directory = 'Actions';

    protected string $stub = 'action.php.stub';
}
