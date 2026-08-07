<?php

declare(strict_types=1);

namespace Workbench\App\Support\JsonSchema;

use Illuminate\Support\Facades\File;
use Lattice\Support\JsonSchema\FlatProjection;
use Lattice\Support\JsonSchema\JsonSchemaBuilder;
use Lattice\Support\JsonSchema\JsonSchemaProfile;
use Lattice\Support\JsonSchema\JsonSchemaWriter;
use Lattice\Support\JsonSchema\SchemaBundler;
use Lattice\Support\JsonSchema\WireSourceCatalog;

/**
 * The package's own dev profile: regenerates every wire package's committed
 * schema document (`WireSource::schemaPath()`) — each a flat, self-contained
 * projection of `buildAll()`'s internal wire model — then merges those flat
 * documents into the committed monorepo bundle artifact. Bound in the
 * workbench so lattice:schema rebuilds the published contract; workbench-only,
 * so this build code never ships.
 */
final readonly class BaseSchemaProfile implements JsonSchemaProfile
{
    public function __construct(
        private WireSourceCatalog $catalog,
        private SchemaBundler $bundler,
    ) {}

    public function run(JsonSchemaBuilder $builder, JsonSchemaWriter $writer): string
    {
        $documents = $builder->buildAll();
        $sources = $this->catalog->discover();

        $universe = [];
        $defOrigins = [];

        foreach ($documents as $shortName => $document) {
            foreach ($document['$defs'] as $name => $def) {
                $universe[$name] = $def;
                $defOrigins[$name] = $shortName;
            }
        }

        $projector = new FlatProjection;
        $flatDocuments = [];

        foreach ($documents as $shortName => $document) {
            $flatDocuments[$shortName] = $projector->project($document, $universe, $defOrigins, $shortName);
        }

        foreach ($sources as $source) {
            // The framework's own document's path is the bundle's default
            // output path (its historical, still-npm-exported location) —
            // written once below, as the bundle, not here as the pure
            // per-package document a redirected base_output would strand.
            if ($source->shortName === 'lattice') {
                continue;
            }

            $document = $flatDocuments[$source->shortName] ?? null;

            if ($document === null) {
                continue;
            }

            File::ensureDirectoryExists(dirname($source->schemaPath()));
            File::put($source->schemaPath(), $writer->write($document));
        }

        $framework = $flatDocuments['lattice'] ?? ['$schema' => 'https://json-schema.org/draft/2020-12/schema', '$defs' => []];
        $others = array_values(array_filter(
            $flatDocuments,
            static fn (string $shortName): bool => $shortName !== 'lattice',
            ARRAY_FILTER_USE_KEY,
        ));
        $bundle = $this->bundler->bundle($framework, $others);

        $packageRoot = dirname(__DIR__, 4);

        // Overridable so the snapshot test regenerates the bundle into a
        // scratch dir instead of rewriting the committed artifact mid-suite.
        $configuredOutput = config('lattice.schema.base_output');
        $outputDirectory = is_string($configuredOutput) && $configuredOutput !== ''
            ? $configuredOutput
            : $packageRoot.'/packages/framework/resources/schema';

        $output = $outputDirectory.'/lattice.schema.json';

        File::ensureDirectoryExists($outputDirectory);
        File::put($output, $writer->write($bundle));

        return sprintf('Regenerated %d wire package schema document(s) and the bundle → %s', count($sources), $output);
    }
}
