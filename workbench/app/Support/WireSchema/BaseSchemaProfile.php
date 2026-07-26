<?php
declare(strict_types=1);

namespace Workbench\App\Support\WireSchema;

use Illuminate\Support\Facades\File;
use Lattice\Lattice\Support\WireSchema\WireSchemaBuilder;
use Lattice\Lattice\Support\WireSchema\WireSchemaProfile;
use Lattice\Lattice\Support\WireSchema\WireSchemaWriter;

/**
 * The package's own dev profile: regenerates the committed built-ins-only
 * schema artifact from src/. Bound in the workbench so lattice:schema rebuilds
 * the published contract; workbench-only, so this build code never ships.
 */
final readonly class BaseSchemaProfile implements WireSchemaProfile
{
    public function run(WireSchemaBuilder $builder, WireSchemaWriter $writer): string
    {
        $packageRoot = dirname(__DIR__, 4);

        // Overridable so the snapshot test regenerates into a scratch dir instead
        // of rewriting the committed resources/schema mid-suite.
        $configuredOutput = config('lattice.schema.base_output');
        $outputDirectory = is_string($configuredOutput) && $configuredOutput !== ''
            ? $configuredOutput
            : $packageRoot.'/resources/schema';

        $document = $builder->build([$packageRoot.'/src']);

        $output = $outputDirectory.'/lattice.schema.json';

        File::ensureDirectoryExists($outputDirectory);
        File::put($output, $writer->write($document));

        return sprintf('Regenerated the built-in wire-protocol schema → %s', $output);
    }
}
