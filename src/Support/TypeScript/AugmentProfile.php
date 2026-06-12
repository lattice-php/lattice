<?php

declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Illuminate\Support\Facades\File;
use Lattice\Lattice\Core\Services\DefinitionDiscovery;

/**
 * The default profile: discovers an app's own #[Component] classes across the
 * configured discover roots and writes a module augmentation extending the open
 * ComponentProps / ColumnProps interfaces the `@lattice-php/lattice` module
 * exposes, layered on top of the package's built-in types.
 */
final class AugmentProfile implements TypeScriptProfile
{
    public function __construct(private readonly ComponentDiscovery $discovery) {}

    public function run(TypeScriptGenerator $generator): string
    {
        $roots = array_keys(DefinitionDiscovery::configuredPaths());
        $output = (string) config('lattice.typescript.output');
        $module = (string) config('lattice.typescript.module', '@lattice-php/lattice');

        if ($roots === []) {
            File::ensureDirectoryExists(dirname($output));
            File::put($output, AugmentationWriter::render($module, [], []));

            return sprintf('Generated 0 type(s) → %s', $output);
        }

        $discovered = [];

        foreach ($roots as $path) {
            $discovered = [...$discovered, ...$this->discovery->discover($path)];
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

        return sprintf('Generated %d type(s) → %s', count($components), $output);
    }
}
