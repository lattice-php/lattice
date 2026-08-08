<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Illuminate\Support\Facades\File;
use Lattice\Support\TypeScript\ImportResolver;
use Lattice\Support\TypeScript\OxfmtFormatter;
use Lattice\Support\TypeScript\SchemaTypeScriptEmitter;
use Lattice\Support\TypeScript\TypeScriptProfile;
use Lattice\Support\Wire\WireModelBuilder;
use Lattice\Support\Wire\WireSourceCatalog;

/**
 * The package's own dev profile: regenerates the built-in TypeScript modules
 * (one `generated.ts` per non-excluded `WireSourceCatalog` source) from
 * `WireModelBuilder::buildAll()`'s per-origin partitioning. Bound in the
 * workbench so `lattice:typescript` rebuilds the base types every consumer
 * app then augments. Workbench-only, so this build code never ships.
 *
 * Which classes land in which module falls entirely out of each class file's
 * own composer package — adding a package to emission needs nothing here,
 * only dropping its short name from `EMISSION_EXCLUDED`.
 */
final readonly class BaseProfile implements TypeScriptProfile
{
    /**
     * A wire source's short name doesn't always match its package directory
     * under packages/ — only `lattice-php/lattice` (short name `lattice`)
     * diverges, living in packages/framework.
     */
    private const array PACKAGE_DIRS = ['lattice' => 'framework'];

    private const string FRAMEWORK_SOURCE = 'lattice';

    public function __construct(private WireSourceCatalog $catalog) {}

    public function run(): string
    {
        $packageRoot = dirname(__DIR__, 4);
        $model = new WireModelBuilder($this->catalog)->buildAll();
        $imports = new ImportResolver($model['defOrigins']);
        $emitter = new SchemaTypeScriptEmitter;
        $formatter = new OxfmtFormatter;

        $configuredOutput = config('lattice.typescript.base_output');
        $outputFor = static fn (string $shortName): string => is_string($configuredOutput) && $configuredOutput !== ''
            ? $configuredOutput.($shortName === self::FRAMEWORK_SOURCE ? '' : '/'.$shortName)
            : $packageRoot.'/packages/'.(self::PACKAGE_DIRS[$shortName] ?? $shortName)
                .($shortName === self::FRAMEWORK_SOURCE ? '/resources/js/types' : '/resources/js');

        $written = 0;

        foreach ($this->catalog->discover() as $source) {
            if ($source->isRoot || in_array($source->shortName, self::EMISSION_EXCLUDED, true)) {
                continue;
            }

            $document = $model['documents'][$source->shortName];

            if ($source->shortName === 'core') {
                // `Option` is hand-written in @lattice-php/core's own types.ts
                // (identical shape, predates the wire model) — re-emitting it
                // here would make the package root's `export type *` from
                // both modules ambiguous. Every other core-origin def has no
                // hand-written counterpart.
                unset($document['$defs']['Option']);
            }

            $this->writeModule($outputFor($source->shortName), $emitter->emitPackageModule($document, $imports), $formatter);
            $written++;
        }

        return sprintf('Regenerated %d built-in TypeScript module(s).', $written);
    }

    private function writeModule(string $directory, string $contents, OxfmtFormatter $formatter): void
    {
        File::ensureDirectoryExists($directory);
        $path = $directory.'/generated.ts';
        File::put($path, $contents);
        $formatter->format([$path]);
    }
}
