<?php
declare(strict_types=1);

namespace Lattice\Support\JsonSchema;

/**
 * The role lattice:schema plays in the current project. Consumer apps export
 * the merged document (built-ins + app types); the workbench rebinds this to
 * regenerate the committed built-ins-only artifact.
 */
interface JsonSchemaProfile
{
    public function run(JsonSchemaBuilder $builder, JsonSchemaWriter $writer): string;
}
