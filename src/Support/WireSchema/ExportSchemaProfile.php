<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\WireSchema;

use Illuminate\Support\Facades\File;
use Lattice\Lattice\Core\Discovery\DiscoveryManifest;

/**
 * Default profile: writes the app's effective wire-protocol schema — the
 * package built-ins merged with every discovered app wire type, the latter
 * marked `origin: "app"`.
 */
final readonly class ExportSchemaProfile implements WireSchemaProfile
{
    public function run(WireSchemaBuilder $builder, WireSchemaWriter $writer): string
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
