<?php
declare(strict_types=1);

namespace Workbench\App\Support\TypeScript;

use Illuminate\Support\Facades\File;
use Lattice\Lattice\Support\TypeScript\OxfmtFormatter;
use Lattice\Lattice\Support\TypeScript\SchemaTypeScriptEmitter;
use Lattice\Lattice\Support\TypeScript\TypeScriptProfile;

/**
 * The package's own dev profile: regenerates the built-in TypeScript module
 * (generated.ts) from the committed schema artifact — the schema document is
 * the only input, so the published contract provably carries everything the
 * types need. Bound in the workbench; this build code never ships.
 */
final readonly class BaseProfile implements TypeScriptProfile
{
    public function run(): string
    {
        $packageRoot = dirname(__DIR__, 4);

        $document = json_decode(
            (string) file_get_contents($packageRoot.'/resources/schema/lattice.schema.json'),
            true,
        );

        // Overridable so the snapshot test regenerates into a scratch dir instead
        // of rewriting the committed resources/js/types mid-suite.
        $configuredOutput = config('lattice.typescript.base_output');
        $outputDirectory = is_string($configuredOutput) && $configuredOutput !== ''
            ? $configuredOutput
            : $packageRoot.'/resources/js/types';

        $output = $outputDirectory.'/generated.ts';

        File::ensureDirectoryExists($outputDirectory);
        File::put($output, new SchemaTypeScriptEmitter()->emitModule($document));

        new OxfmtFormatter()->format([$output]);

        return 'Regenerated built-in TypeScript types from the wire-protocol schema.';
    }
}
