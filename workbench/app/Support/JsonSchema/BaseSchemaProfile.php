<?php

declare(strict_types=1);

namespace Workbench\App\Support\JsonSchema;

use Illuminate\Support\Facades\File;
use Lattice\Support\JsonSchema\JsonSchemaBuilder;
use Lattice\Support\JsonSchema\JsonSchemaProfile;
use Lattice\Support\JsonSchema\JsonSchemaWriter;
use Lattice\Support\JsonSchema\WireSourceCatalog;

/**
 * The package's own dev profile: regenerates the committed built-ins-only
 * schema artifact from every wire-contributing package's discover dirs.
 * Bound in the workbench so lattice:schema rebuilds the published contract;
 * workbench-only, so this build code never ships.
 */
final readonly class BaseSchemaProfile implements JsonSchemaProfile
{
    public function __construct(private WireSourceCatalog $catalog) {}

    public function run(JsonSchemaBuilder $builder, JsonSchemaWriter $writer): string
    {
        $packageRoot = dirname(__DIR__, 4);

        // Overridable so the snapshot test regenerates into a scratch dir instead
        // of rewriting the committed resources/schema mid-suite.
        $configuredOutput = config('lattice.schema.base_output');
        $outputDirectory = is_string($configuredOutput) && $configuredOutput !== ''
            ? $configuredOutput
            : $packageRoot.'/packages/framework/resources/schema';

        $document = $builder->build($this->catalog->builtinDirs());

        $output = $outputDirectory.'/lattice.schema.json';

        File::ensureDirectoryExists($outputDirectory);
        File::put($output, $writer->write($document));

        return sprintf('Regenerated the built-in wire-protocol schema → %s', $output);
    }
}
