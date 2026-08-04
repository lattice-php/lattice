<?php
declare(strict_types=1);

namespace Lattice\Lattice\Attributes;

use Attribute;
use Lattice\Lattice\Support\Wire;

/**
 * Marks an array wire prop as a map (`Record<…, X>` on the TS side) so it
 * serializes as a JSON object even when empty or sequential-integer-keyed
 * (see {@see Wire::map()}).
 */
#[Attribute(Attribute::TARGET_PROPERTY)]
class WireMap {}
