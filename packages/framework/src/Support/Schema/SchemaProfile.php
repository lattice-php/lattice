<?php
declare(strict_types=1);

namespace Lattice\Support\Schema;

use Lattice\Core\JsonSchema\SchemaDocumentWriter;
use Lattice\Core\Wire\WireModelBuilder;

/**
 * The role lattice:schema plays in the current project. Consumer apps export
 * the merged document (built-ins + app types); the workbench rebinds this to
 * regenerate the committed built-ins-only artifacts.
 */
interface SchemaProfile
{
    public function run(WireModelBuilder $builder, SchemaDocumentWriter $writer): string;
}
