<?php
declare(strict_types=1);

namespace Lattice\Support\JsonSchema;

use Illuminate\Support\Facades\File;

/**
 * Default profile: writes the app's effective wire-protocol schema — every
 * built-in wire package's dirs (from the composer-derived catalog) merged
 * with the root package's own discover dirs, the latter marked
 * `origin: "app"`.
 */
final readonly class ExportSchemaProfile implements JsonSchemaProfile
{
    public function __construct(private WireSourceCatalog $catalog) {}

    public function run(JsonSchemaBuilder $builder, JsonSchemaWriter $writer): string
    {
        $document = $builder->build($this->catalog->builtinDirs(), $this->catalog->appDirs());

        $output = (string) config('lattice.schema.output');

        File::ensureDirectoryExists(dirname($output));
        File::put($output, $writer->write($document));

        return sprintf('Wrote the wire-protocol schema → %s', $output);
    }
}
