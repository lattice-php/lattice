<?php
declare(strict_types=1);

namespace Lattice\Tree;

use Lattice\Lattice\Core\Definition;

/**
 * A registered, addressable tree: the server-side counterpart of
 * `Tree::use()`. The registry key from {@see AsTree} lets the lazy endpoint
 * re-resolve the definition on a later request, with the sealed context
 * re-applied by the controller.
 */
abstract class TreeDefinition extends Definition
{
    abstract public function source(): TreeSource;
}
