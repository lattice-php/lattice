<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\TypeScript;

use Illuminate\Support\Facades\File;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Lattice\Support\JsonSchema\JsonSchemaBuilder;

/**
 * Default profile: builds the app's effective schema document in memory and
 * writes a module augmentation for every `origin: "app"` wire type, extending
 * the package's published types.
 */
final readonly class AugmentProfile implements TypeScriptProfile
{
    public function run(): string
    {
        $document = new JsonSchemaBuilder()->build(
            [dirname(__DIR__, 2)],
            DiscoveryManifest::configuredPaths(),
        );

        $output = (string) config('lattice.typescript.output');
        $module = (string) config('lattice.typescript.module', '@lattice-php/lattice');

        File::ensureDirectoryExists(dirname($output));
        File::put($output, new SchemaTypeScriptEmitter()->emitAugmentation($document, $module));

        new OxfmtFormatter()->format([$output]);

        $count = count(array_filter(
            $document['$defs'],
            static fn (array $def): bool => ($def['x-lattice']['origin'] ?? null) === 'app'
                && ($def['x-lattice']['kind'] ?? null) === 'props',
        ));

        return sprintf('Generated %d type(s) → %s', $count, $output);
    }
}
