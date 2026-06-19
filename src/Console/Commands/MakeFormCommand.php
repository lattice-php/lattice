<?php
declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

final class MakeFormCommand extends MakeDefinitionCommand
{
    protected $signature = 'lattice:form {name} {--force}';

    protected $description = 'Scaffold a Lattice form';

    protected string $type = 'Form';

    protected string $directory = 'Forms';

    protected string $stub = 'form.php.stub';
}
