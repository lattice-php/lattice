<?php

declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Lattice\Lattice\Console\Commands\Concerns\GeneratesComponentPair;

final class MakeFieldCommand extends Command
{
    use GeneratesComponentPair;

    protected $signature = 'lattice:field {name} {--type=}';

    protected $description = 'Scaffold a custom Lattice form field (PHP + React)';

    public function handle(): int
    {
        $name = $this->argument('name');
        $type = $this->option('type') ?: $this->typeFromName($name, 'form.');
        $kebab = Str::kebab($name);

        $this->writeStub(
            'field.php.stub',
            app_path('Forms/Fields/'.$name.'.php'),
            ['namespace' => 'App\\Forms\\Fields', 'class' => $name, 'type' => $type],
        );

        $this->writeStub(
            'field.tsx.stub',
            resource_path('js/lattice/fields/'.$kebab.'.tsx'),
            ['class' => $name, 'type' => $type],
        );

        $this->registerInPlugin(
            resource_path('js/lattice/plugin.ts'),
            $type,
            $name.'Component',
            './fields/'.$kebab,
        );

        $this->refreshTypes();

        return self::SUCCESS;
    }
}
