<?php
declare(strict_types=1);

namespace Workbench\App\Support\Schema;

use Illuminate\Support\Facades\File;
use Lattice\Core\JsonSchema\FlatProjection;
use Lattice\Core\JsonSchema\SchemaBundler;
use Lattice\Core\JsonSchema\SchemaDocumentWriter;
use Lattice\Core\Wire\WireModelBuilder;
use Lattice\Core\Wire\WireSourceCatalog;
use Lattice\Support\Schema\SchemaProfile;

/**
 * The package's own dev profile: regenerates every wire package's committed
 * schema document (`WireSource::schemaPath()`) — each a flat, self-contained
 * projection of `buildAll()`'s internal wire model — then merges those flat
 * documents into the committed monorepo bundle artifact. Bound in the
 * workbench so lattice:schema rebuilds the published contract; workbench-only,
 * so this build code never ships.
 *
 * Mirrors `Workbench\App\Support\TypeScript\BaseProfile`'s per-source
 * `base_output` override so the snapshot test regenerates every artifact into
 * a scratch dir instead of rewriting the committed ones mid-suite.
 */
final readonly class BaseSchemaProfile implements SchemaProfile
{
    /**
     * A wire source's short name doesn't always match its package directory
     * under packages/ — only `lattice-php/lattice` (short name `lattice`)
     * diverges, living in packages/framework.
     */
    private const array PACKAGE_DIRS = ['lattice' => 'framework'];

    private const string FRAMEWORK_SOURCE = 'lattice';

    public function __construct(
        private WireSourceCatalog $catalog,
        private SchemaBundler $bundler,
    ) {}

    public function run(WireModelBuilder $builder, SchemaDocumentWriter $writer): string
    {
        $packageRoot = dirname(__DIR__, 4);
        $model = $builder->buildAll(includeFrameworkEnvelope: true);
        $documents = $model['documents'];
        $defOrigins = $model['defOrigins'];

        $universe = [];

        foreach ($documents as $document) {
            foreach ($document['$defs'] as $name => $def) {
                $universe[$name] ??= $def;
            }
        }

        $projector = new FlatProjection;
        $flatDocuments = [];

        foreach ($documents as $shortName => $document) {
            $flatDocuments[$shortName] = $projector->project($document, $universe, $defOrigins, $shortName);
        }

        $configuredOutput = config('lattice.schema.base_output');
        $pathFor = static fn (string $shortName): string => is_string($configuredOutput) && $configuredOutput !== ''
            ? $configuredOutput.($shortName === self::FRAMEWORK_SOURCE ? '' : '/'.$shortName).'/'.$shortName.'.schema.json'
            : $packageRoot.'/packages/'.(self::PACKAGE_DIRS[$shortName] ?? $shortName).'/resources/schema/'.$shortName.'.schema.json';

        $written = 0;

        foreach ($this->catalog->discover() as $source) {
            if ($source->isRoot || $source->shortName === self::FRAMEWORK_SOURCE) {
                continue;
            }

            $document = $flatDocuments[$source->shortName] ?? null;

            if ($document === null) {
                continue;
            }

            $path = $pathFor($source->shortName);
            File::ensureDirectoryExists(dirname($path));
            File::put($path, $writer->write($document));
            $written++;
        }

        $framework = $flatDocuments[self::FRAMEWORK_SOURCE] ?? ['$schema' => 'https://json-schema.org/draft/2020-12/schema', '$defs' => []];
        $others = array_values(array_filter(
            $flatDocuments,
            static fn (string $shortName): bool => $shortName !== self::FRAMEWORK_SOURCE,
            ARRAY_FILTER_USE_KEY,
        ));
        $bundle = $this->bundler->bundle($framework, $others);

        $bundlePath = $pathFor(self::FRAMEWORK_SOURCE);
        File::ensureDirectoryExists(dirname($bundlePath));
        File::put($bundlePath, $writer->write($bundle));

        return sprintf('Regenerated %d wire package schema document(s) and the bundle → %s', $written, $bundlePath);
    }
}
