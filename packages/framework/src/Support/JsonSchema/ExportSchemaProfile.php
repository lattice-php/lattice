<?php
declare(strict_types=1);

namespace Lattice\Support\JsonSchema;

use Illuminate\Support\Facades\File;
use Lattice\Core\Discovery\DiscoveryManifest;
use Lattice\Core\Facades\Lattice;

/**
 * Default profile: writes the app's effective wire-protocol schema — every
 * package's built-in wire types (via the registered wire source roots) merged
 * with every discovered app wire type, the latter marked `origin: "app"`.
 */
final readonly class ExportSchemaProfile implements JsonSchemaProfile
{
    public function run(JsonSchemaBuilder $builder, JsonSchemaWriter $writer): string
    {
        $document = $builder->build(
            Lattice::wireSources(),
            DiscoveryManifest::configuredPaths(),
        );

        $output = (string) config('lattice.schema.output');

        File::ensureDirectoryExists(dirname($output));
        File::put($output, $writer->write($document));

        return sprintf('Wrote the wire-protocol schema → %s', $output);
    }
}
