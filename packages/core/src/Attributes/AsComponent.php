<?php
declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;

/**
 * Marks a renderable node for the generated node types and registry.
 */
#[Attribute(Attribute::TARGET_CLASS)]
readonly class AsComponent extends WireType {}
