<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

final class MakeBulkActionCommand extends MakeDefinitionCommand
{
    protected $signature = 'lattice:bulk-action {name} {--force}';

    protected $description = 'Scaffold a Lattice bulk action';

    protected string $type = 'Bulk action';

    protected string $directory = 'Actions';

    protected string $stub = 'bulk-action.php.stub';
}
