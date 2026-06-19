<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

final class MakeFragmentCommand extends MakeDefinitionCommand
{
    protected $signature = 'lattice:fragment {name} {--force}';

    protected $description = 'Scaffold a Lattice fragment';

    protected string $type = 'Fragment';

    protected string $directory = 'Fragments';

    protected string $stub = 'fragment.php.stub';
}
