<?php
declare(strict_types=1);

namespace Lattice\Lattice\Effects\Attributes;

use Attribute;
use Lattice\Lattice\Attributes\WireType;

/**
 * Marks an effect value object and declares its wire type — the discriminant
 * that keys the `Effect` union. Discovery shares ClassWalker, but the attribute
 * stays distinct by design (effects form the discriminated `Effect` union, not
 * the node hierarchy).
 */
#[Attribute(Attribute::TARGET_CLASS)]
final readonly class AsEffect extends WireType {}
