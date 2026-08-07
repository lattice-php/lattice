<?php
declare(strict_types=1);

namespace Lattice\Support\JsonSchema;

use Illuminate\Support\Facades\File;

/**
 * Default profile: assembles the app's effective wire-protocol schema by
 * merging every installed wire package's COMMITTED schema document (already
 * flat and self-contained, never reflected here) with the root package's own
 * document — reflected fresh, then projected flat against the installed
 * packages' committed `$defs` as its def universe, so a root prop typed with
 * an installed package's class resolves to a local pointer instead of
 * reflecting vendor PHP.
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

        $installedDocuments = $this->committedDocuments($installed);

        $others = [];
        $universe = [];
        $defOrigins = [];

        foreach ($installedDocuments as $shortName => $document) {
            if ($shortName !== 'lattice') {
                $others[] = $document;
            }

            foreach ($document['$defs'] as $name => $def) {
                $universe[$name] = $def;
                $defOrigins[$name] ??= $shortName;
            }
        }

        if ($root !== null) {
            $rootDocument = $builder->buildRootDocument($root, $installed);
            $others[] = new FlatProjection()->project($rootDocument, $universe, $defOrigins, $root->shortName);
        }

        $framework = $installedDocuments['lattice'] ?? ['$schema' => 'https://json-schema.org/draft/2020-12/schema', '$defs' => []];
        $bundle = $this->bundler->bundle($framework, $others);

        $output = (string) config('lattice.schema.output');

        File::ensureDirectoryExists(dirname($output));
        File::put($output, $writer->write($bundle));

        return sprintf('Wrote the wire-protocol schema → %s', $output);
    }

    /**
     * @param  list<WireSource>  $sources
     * @return array<string, array<string, mixed>>
     */
    private function committedDocuments(array $sources): array
    {
        $documents = [];

        foreach ($sources as $source) {
            $path = $source->schemaPath();

            if (! is_file($path)) {
                continue;
            }

            $decoded = json_decode((string) file_get_contents($path), true);

            if (is_array($decoded)) {
                $documents[$source->shortName] = $decoded;
            }
        }

        return $documents;
    }
}
