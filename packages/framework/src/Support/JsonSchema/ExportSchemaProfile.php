<?php
declare(strict_types=1);

namespace Lattice\Support\JsonSchema;

use Illuminate\Support\Facades\File;

/**
 * Default profile: assembles the app's effective wire-protocol schema as a
 * bundle — every installed wire package's COMMITTED schema document (never
 * reflected here) plus the root package's own freshly-reflected document,
 * embedded under the framework document via `SchemaBundler`.
 */
final readonly class ExportSchemaProfile implements JsonSchemaProfile
{
    public function __construct(
        private WireSourceCatalog $catalog,
        private SchemaBundler $bundler,
    ) {}

    public function run(JsonSchemaBuilder $builder, JsonSchemaWriter $writer): string
    {
        $sources = $this->catalog->discover();
        $root = null;
        $installed = [];

        foreach ($sources as $source) {
            if ($source->isRoot) {
                $root = $source;
            } else {
                $installed[] = $source;
            }
        }

        $rootDocument = $root !== null ? $builder->buildRootDocument($root, $installed) : [];
        $bundle = $this->bundler->bundle($sources, $rootDocument);

        $output = (string) config('lattice.schema.output');

        File::ensureDirectoryExists(dirname($output));
        File::put($output, $writer->write($bundle));

        return sprintf('Wrote the wire-protocol schema → %s', $output);
    }
}
