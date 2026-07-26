<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\JsonSchema;

use Illuminate\Support\Facades\File;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;

/**
 * Default profile: writes the app's effective wire-protocol schema — the
 * package built-ins merged with every discovered app wire type, the latter
 * marked `origin: "app"`.
 */
final readonly class ExportSchemaProfile implements JsonSchemaProfile
{
    public function run(JsonSchemaBuilder $builder, JsonSchemaWriter $writer): string
    {
        $document = $builder->build(
            [dirname(__DIR__, 2)],
            DiscoveryManifest::configuredPaths(),
        );

        $output = (string) config('lattice.schema.output');

        File::ensureDirectoryExists(dirname($output));
        File::put($output, $writer->write($document));

        return sprintf('Wrote the wire-protocol schema → %s', $output);
    }
}
