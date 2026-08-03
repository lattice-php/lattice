<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Illuminate\Support\Facades\File;
use Lattice\Lattice\Attributes\WireEnvelope;
use Lattice\Lattice\Core\Discovery\ComponentPackages;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;

/**
 * Default profile: discovers an app's own wire-typed classes — components,
 * columns, filters and every attribute-sourced family registered by providers —
 * and writes a module augmentation extending the package's published types.
 */
final readonly class AugmentProfile implements TypeScriptProfile
{
    public function __construct(
        private WireTypeDiscovery $discovery,
        private WireFamilies $families,
    ) {}

    public function pendingTypeCount(): int
    {
        $entries = [];

        foreach (DiscoveryManifest::configuredPaths() as $path) {
            $manifest = $this->discovery->discover($path);

            foreach ($manifest->components as $component) {
                $entries[$component->class] = true;
            }

            foreach ($this->families->valueFamilies() as $family) {
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
        $module = (string) config('lattice.typescript.module', '@lattice-php/core');

        if ($roots === []) {
            File::ensureDirectoryExists(dirname($output));
            $writer = new AugmentationWriter([], $this->families, $module, basename($output));
            File::put($output, $writer->render([]));

            return sprintf('Generated 0 type(s) → %s', $output);
        }

        $entries = [];

        foreach ($roots as $path) {
            $manifest = $this->discovery->discover($path);

            foreach ($manifest->components as $component) {
                $entries[$component->class] = [$component->type, $component->category];
            }

            foreach ($this->families->valueFamilies() as $family) {
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

        foreach ($this->families->markerFamilies() as $family) {
            $markerRefs[$family->reference] = new NodeTypeReference(
                $byCategory[$family->category] ?? [],
                WireEnvelope::forClass($family->reference),
                attributeFallback: $family->category === 'component',
            );
        }

        $generator->generate(
            $roots,
            [new ComponentTransformer(array_keys($entries), $markerRefs)],
            [],
            new AugmentationWriter($entries, $this->families, $module, basename($output)),
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
        $sources = [...$this->families->sources(), ...ComponentPackages::discoverRoots()];
        $ignored = array_map(static fn (string $source): string => $source.'/Support/Testing', $sources);

        foreach ($this->discovery->discoverMany($sources, $ignored)->components as $component) {
            $byCategory[$component->category][$component->class] = $component->type;
        }

        return $byCategory;
    }
}
