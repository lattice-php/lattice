<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

final class MakePageCommand extends MakeDefinitionCommand
{
    protected $signature = 'lattice:page {name} {--force}';

    protected $description = 'Scaffold a Lattice page';

    protected string $type = 'Page';

    protected string $directory = 'Pages';

    protected string $stub = 'page.php.stub';
}
