<?php
declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;

/**
 * Marks an enum or value object for inclusion in the built-in TypeScript module.
 */
#[Attribute(Attribute::TARGET_CLASS)]
final class TypeScript {}
