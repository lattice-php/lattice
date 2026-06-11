<?php

declare(strict_types=1);

namespace Lattice\Lattice\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Lattice\Lattice\Core\Services\DefinitionDiscovery;
use Lattice\Lattice\Support\TypeScript\AugmentationWriter;
use Lattice\Lattice\Support\TypeScript\ComponentDiscovery;
use Lattice\Lattice\Support\TypeScript\ComponentTransformer;
use Lattice\Lattice\Support\TypeScript\OxfmtFormatter;
use Lattice\Lattice\Support\TypeScript\TypeScriptGenerator;
use Spatie\TypeScriptTransformer\TypeScriptTransformer;

final class TypeScriptCommand extends Command
{
    protected $signature = 'lattice:typescript';

    protected $description = "Generate TypeScript types for the app's custom Lattice components";

    public function handle(ComponentDiscovery $discovery, TypeScriptGenerator $generator): int
    {
        if (! class_exists(TypeScriptTransformer::class)) {
            $this->components->error('lattice:typescript needs spatie/typescript-transformer. Install it with: composer require --dev spatie/typescript-transformer');

            return self::FAILURE;
        }

        $roots = array_keys(DefinitionDiscovery::configuredPaths());
        $output = (string) config('lattice.typescript.output');
        $module = (string) config('lattice.typescript.module', '@lattice-php/lattice');

        if ($roots === []) {
            File::ensureDirectoryExists(dirname($output));
            File::put($output, AugmentationWriter::render($module, [], []));
            $this->components->info(sprintf('Generated 0 type(s) → %s', $output));

            return self::SUCCESS;
        }

        $discovered = [];

        foreach ($roots as $path) {
            $discovered = [...$discovered, ...$discovery->discover($path)];
        }

        $components = [];
        $columns = [];

        foreach ($discovered as $component) {
            $components[$component->class] = [$component->type, $component->category];

            if ($component->category === 'column') {
                $columns[] = $component->class;
            }
        }

        $generator->generate(
            $roots,
            [new ComponentTransformer(array_keys($components), $columns)],
            [],
            new AugmentationWriter($components, $module, basename($output)),
            dirname($output),
            new OxfmtFormatter,
        );

        $this->components->info(sprintf('Generated %d type(s) → %s', count($components), $output));

        return self::SUCCESS;
    }
}
