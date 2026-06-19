<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

final class MakeRemoteSourceCommand extends MakeDefinitionCommand
{
    protected $signature = 'lattice:remote-source {name} {--force}';

    protected $description = 'Scaffold a Lattice remote source';

    protected string $type = 'Remote source';

    protected string $directory = 'Remote';

    protected string $stub = 'remote-source.php.stub';
}
