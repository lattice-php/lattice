<?php

declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;

/**
 * Marks a renderable node for the generated node types and registry. The `Column`
 * attribute extends this for table cells.
 */
#[Attribute(Attribute::TARGET_CLASS)]
class Component
{
    public function __construct(public readonly string $type) {}
}
