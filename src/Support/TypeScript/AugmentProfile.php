<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Illuminate\Support\Facades\File;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;

/**
 * Default profile: discovers an app's own #[AsComponent] classes and writes a
 * module augmentation extending the package's published types.
 */
final readonly class AugmentProfile implements TypeScriptProfile
{
    public function __construct(private WireTypeDiscovery $discovery) {}

    public function run(TypeScriptGenerator $generator): string
    {
        $roots = DiscoveryManifest::configuredPaths();
        $output = (string) config('lattice.typescript.output');
        $module = (string) config('lattice.typescript.module', '@lattice-php/lattice');

        if ($roots === []) {
            File::ensureDirectoryExists(dirname($output));
            File::put($output, AugmentationWriter::render($module, []));

            return sprintf('Generated 0 type(s) → %s', $output);
        }

        $discovered = [];

        foreach ($roots as $path) {
            $discovered = [...$discovered, ...$this->discovery->discover($path)->components];
        }

        $entries = [];

        foreach ($discovered as $component) {
            $entries[$component->class] = [$component->type, $component->category];
        }

        $generator->generate(
            $roots,
            [new ComponentTransformer(array_keys($entries))],
            [],
            new AugmentationWriter($entries, $module, basename($output)),
            dirname($output),
            new OxfmtFormatter,
        );

        return sprintf('Generated %d type(s) → %s', count($entries), $output);
    }
}
