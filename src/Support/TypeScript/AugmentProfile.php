<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Illuminate\Support\Facades\File;
use Lattice\Lattice\Attributes\WireEnvelope;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;

/**
 * Default profile: discovers an app's own wire-typed classes — components,
 * columns, filters and every attribute-sourced family in the WireFamily table —
 * and writes a module augmentation extending the package's published types.
 */
final readonly class AugmentProfile implements TypeScriptProfile
{
    public function __construct(private WireTypeDiscovery $discovery) {}

    public function pendingTypeCount(): int
    {
        $entries = [];

        foreach (DiscoveryManifest::configuredPaths() as $path) {
            $manifest = $this->discovery->discover($path);

            foreach ($manifest->components as $component) {
                $entries[$component->class] = true;
            }

            foreach (WireFamily::registryFamilies() as $family) {
                foreach (array_keys($manifest->family($family->category)) as $class) {
                    $entries[$class] = true;
                }
            }
        }

        return count($entries);
    }

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

        $entries = [];

        foreach ($roots as $path) {
            $manifest = $this->discovery->discover($path);

            foreach ($manifest->components as $component) {
                $entries[$component->class] = [$component->type, $component->category];
            }

            foreach (WireFamily::registryFamilies() as $family) {
                foreach ($manifest->family($family->category) as $class => $type) {
                    $entries[$class] = [$type, $family->category];
                }
            }
        }

        $byCategory = $this->builtinClassTypes();

        foreach ($entries as $class => [$type, $category]) {
            if (isset($byCategory[$category])) {
                $byCategory[$category][$class] = $type;
            }
        }

        $markerRefs = [];

        foreach (WireFamily::markerFamilies() as $family) {
            $markerRefs[$family->marker] = new NodeTypeReference(
                $byCategory[$family->category] ?? [],
                WireEnvelope::forClass($family->marker),
                attributeFallback: $family->category === 'component',
            );
        }

        $generator->generate(
            $roots,
            [new ComponentTransformer(array_keys($entries), $markerRefs)],
            [],
            new AugmentationWriter($entries, $module, basename($output)),
            dirname($output),
            new OxfmtFormatter,
        );

        return sprintf('Generated %d type(s) → %s', count($entries), $output);
    }

    /**
     * The package's own wire classes per category. Seeding the node-type
     * resolvers with them keeps built-in descendants (e.g. action.bulk under
     * an Action-typed prop) in a consumer app's generated unions, exactly as
     * they are in the base module.
     *
     * @return array{component: array<class-string, string>, column: array<class-string, string>, filter: array<class-string, string>}
     */
    private function builtinClassTypes(): array
    {
        $byCategory = ['component' => [], 'column' => [], 'filter' => []];

        foreach ($this->discovery->discover(dirname(__DIR__, 2))->components as $component) {
            $byCategory[$component->category][$component->class] = $component->type;
        }

        return $byCategory;
    }
}
