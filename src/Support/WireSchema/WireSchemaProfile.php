<?php
declare(strict_types=1);

namespace Lattice\Lattice\Support\WireSchema;

/**
 * The role lattice:schema plays in the current project. Consumer apps export
 * the merged document (built-ins + app types); the workbench rebinds this to
 * regenerate the committed built-ins-only artifact.
 */
interface WireSchemaProfile
{
    public function run(WireSchemaBuilder $builder, WireSchemaWriter $writer): string;
}
